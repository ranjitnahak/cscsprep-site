import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const text = await req.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid JSON" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const {
      first_name,
      last_name,
      email,
      whatsapp,
      score,
      tier,
      domain_scores,
      payment_method,
      coupon_used,
      razorpay_payment_id,
    } = body as {
      first_name?: string;
      last_name?: string;
      email?: string;
      whatsapp?: string;
      score?: number;
      tier?: string;
      domain_scores?: Record<string, unknown>;
      payment_method?: string;
      coupon_used?: string | null;
      razorpay_payment_id?: string | null;
    };

    if (!first_name || !last_name || !email || !whatsapp) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const resolvedScore = score ?? 0;
    const resolvedTier = tier ?? "Unknown";
    const resolvedDomainScores = domain_scores ?? {};
    const resolvedPaymentMethod = payment_method ?? "razorpay";
    const resolvedCoupon = coupon_used ?? null;
    const resolvedPaymentId = razorpay_payment_id ?? null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from("blood_test_leads")
      .insert({
        first_name,
        last_name,
        email,
        whatsapp,
        score: resolvedScore,
        total: 20,
        tier: resolvedTier,
        domain_scores: resolvedDomainScores,
        payment_method: resolvedPaymentMethod,
        coupon_used: resolvedCoupon,
        razorpay_payment_id: resolvedPaymentId,
      })
      .select();

    if (error) {
      console.error("Insert error:", JSON.stringify(error));
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    console.log("Lead inserted:", JSON.stringify(data));

    const { error: leadsError } = await supabase.from("leads").insert({
      name: `${first_name} ${last_name}`.trim(),
      email,
      phone: whatsapp,
      source: "blood-test",
      metadata: {
        first_name,
        last_name,
        score: resolvedScore,
        total: 20,
        tier: resolvedTier,
        domain_scores: resolvedDomainScores,
        payment_method: resolvedPaymentMethod,
        coupon_used: resolvedCoupon,
        razorpay_payment_id: resolvedPaymentId,
      },
    });

    if (leadsError) {
      console.error("leads insert error:", JSON.stringify(leadsError));
    }

    return new Response(
      JSON.stringify({ success: true, message: "Lead saved" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
