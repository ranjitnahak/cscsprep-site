import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESPONSE_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

const CAL_LINK = "https://cal.com/cscs-prep/cscs-clarity-call";
const NOTIFY_EMAIL = "ranjit.nahak@sportsscienceuniversity.com";

interface EnrolLeadBody {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: string;
  certifications?: string;
  attempted_cscs?: boolean;
  biggest_challenge?: string;
  source?: string;
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
<p>Thanks for expressing your interest in the upcoming CSCS Prep cohort.<br>
We've received your details and will be in touch within 24 hours.</p>
<p>If you'd like to speak sooner, you can book a free clarity call here:<br>
<a href="${CAL_LINK}">${CAL_LINK}</a></p>
<p>Talk soon,</p>
<p>Ranjit Nahak, MSc, CSCS<br>
CSCS Prep · cscsprep.in<br>
Instagram: @cscsprep</p>
`.trim();
}

function buildNotificationHtml(
  body: Required<
    Pick<
      EnrolLeadBody,
      | "name"
      | "email"
      | "phone"
      | "city"
      | "role"
      | "certifications"
      | "attempted_cscs"
      | "biggest_challenge"
    >
  >,
  createdAt: string,
): string {
  const attemptedLabel = body.attempted_cscs ? "Yes" : "No";
  const submittedAt = formatIstTimestamp(createdAt);

  return `
<p>New lead from the enrolment form.</p>
<p>
<strong>Name:</strong> ${escapeHtml(body.name)}<br>
<strong>Email:</strong> ${escapeHtml(body.email)}<br>
<strong>Phone:</strong> ${escapeHtml(body.phone)}<br>
<strong>City:</strong> ${escapeHtml(body.city)}<br>
<strong>Role:</strong> ${escapeHtml(body.role)}<br>
<strong>Certifications:</strong> ${escapeHtml(body.certifications)}<br>
<strong>Attempted CSCS before:</strong> ${attemptedLabel}<br>
<strong>Biggest challenge:</strong> ${escapeHtml(body.biggest_challenge)}<br>
<strong>Submitted at:</strong> ${escapeHtml(submittedAt)}
</p>
`.trim();
}

function validateBody(body: EnrolLeadBody): string | null {
  if (!body.name?.trim()) return "Name is required";
  if (!body.email?.trim()) return "Email is required";
  if (!body.phone?.trim()) return "Phone is required";
  if (!body.city?.trim()) return "City is required";
  if (!body.role?.trim()) return "Role is required";
  if (!body.certifications?.trim()) return "Certifications is required";
  if (typeof body.attempted_cscs !== "boolean") {
    return "attempted_cscs is required";
  }
  if (!body.biggest_challenge?.trim()) return "biggest_challenge is required";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: RESPONSE_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" });
  }

  try {
    const body: EnrolLeadBody = await req.json();
    const validationError = validateBody(body);
    if (validationError) {
      return jsonResponse({ error: validationError });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert({
        name: body.name!.trim(),
        email: body.email!.trim(),
        phone: body.phone!.trim(),
        source: "enrol-form",
        metadata: {
          city: body.city!.trim(),
          role: body.role!.trim(),
          certifications: body.certifications!.trim(),
          attempted_cscs: body.attempted_cscs,
          biggest_challenge: body.biggest_challenge!.trim(),
        },
      })
      .select("created_at")
      .single();

    if (insertError || !lead) {
      return jsonResponse({ error: insertError?.message ?? "Failed to save lead" });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return jsonResponse({ error: "Email service not configured" });
    }

    const payload = {
      name: body.name!.trim(),
      email: body.email!.trim(),
      phone: body.phone!.trim(),
      city: body.city!.trim(),
      role: body.role!.trim(),
      certifications: body.certifications!.trim(),
      attempted_cscs: body.attempted_cscs!,
      biggest_challenge: body.biggest_challenge!.trim(),
    };

    await sendEmail(
      resendKey,
      payload.email,
      "You're in — CSCS Prep Upcoming Cohort",
      buildConfirmationHtml(payload.name),
    );

    await sendEmail(
      resendKey,
      NOTIFY_EMAIL,
      `New enrolment enquiry — ${payload.name}`,
      buildNotificationHtml(payload, lead.created_at),
    );

    return jsonResponse({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return jsonResponse({ error: message });
  }
});
