import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESPONSE_HEADERS = {
  "Content-Type": "application/json",
  ...CORS_HEADERS,
};

const CAL_LINK = "https://cal.id/ranjit-nahak/cscs-clarity-call";
const NOTIFY_EMAIL = "ranjit.nahak@sportsscienceuniversity.com";
const AMOUNT_INR = 499;

interface RebookBody {
  name?: string;
  email?: string;
  phone?: string;
  razorpay_payment_id?: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

function formatIstTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
  return `${formatted} IST`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CSCS Prep <noreply@cscsprep.in>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend error: ${errText}`);
  }
}

function buildConfirmationHtml(name: string): string {
  return `
<p>Hi ${escapeHtml(name)},</p>
<p>Your payment of ₹${AMOUNT_INR} is confirmed. Book your clarity call here:<br>
<a href="${CAL_LINK}">${CAL_LINK}</a></p>
<p>Talk soon,</p>
<p>Ranjit Nahak, MSc, CSCS<br>
CSCS Prep · cscsprep.in<br>
Instagram: @cscsprep</p>
`.trim();
}

function buildNotificationHtml(
  body: { name: string; email: string; phone: string; razorpay_payment_id: string },
  createdAt: string,
): string {
  return `
<p>Paid clarity call rebook.</p>
<p>
<strong>Name:</strong> ${escapeHtml(body.name)}<br>
<strong>Email:</strong> ${escapeHtml(body.email)}<br>
<strong>Phone:</strong> ${escapeHtml(body.phone)}<br>
<strong>Amount:</strong> ₹${AMOUNT_INR}<br>
<strong>Razorpay payment id:</strong> ${escapeHtml(body.razorpay_payment_id)}<br>
<strong>Paid at:</strong> ${escapeHtml(formatIstTimestamp(createdAt))}
</p>
`.trim();
}

function validateBody(body: RebookBody): string | null {
  if (!body.name?.trim()) return "Name is required";
  if (!body.email?.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return "Email is invalid";
  }
  if (!body.phone?.trim()) return "Phone is required";
  if (!body.razorpay_payment_id?.trim()) return "Payment id is required";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: RESPONSE_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body: RebookBody = await req.json();
    const validationError = validateBody(body);
    if (validationError) {
      return jsonResponse({ error: validationError }, 400);
    }

    const payload = {
      name: body.name!.trim(),
      email: body.email!.trim(),
      phone: body.phone!.trim(),
      razorpay_payment_id: body.razorpay_payment_id!.trim(),
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        source: "rebook",
        metadata: {
          razorpay_payment_id: payload.razorpay_payment_id,
          amount_inr: AMOUNT_INR,
          currency: "INR",
        },
      })
      .select("created_at")
      .single();

    if (insertError || !lead) {
      return jsonResponse({
        error: insertError?.message ?? "Failed to save lead",
      }, 500);
    }

    const emailWarnings: string[] = [];
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      emailWarnings.push("Email service not configured");
    } else {
      try {
        await sendEmail(
          resendKey,
          payload.email,
          "Your CSCS clarity call link",
          buildConfirmationHtml(payload.name),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Confirmation email failed";
        console.error(message);
        emailWarnings.push(message);
      }

      try {
        await sendEmail(
          resendKey,
          NOTIFY_EMAIL,
          `Paid rebook — ${payload.name}`,
          buildNotificationHtml(payload, lead.created_at),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Notification email failed";
        console.error(message);
        emailWarnings.push(message);
      }
    }

    return jsonResponse({
      success: true,
      ...(emailWarnings.length ? { email_warning: emailWarnings.join("; ") } : {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return jsonResponse({ error: message }, 500);
  }
});
