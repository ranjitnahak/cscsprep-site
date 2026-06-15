import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESPONSE_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=3600",
  "Access-Control-Allow-Origin": "*",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: RESPONSE_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("chapters")
      .select("id, chapter_number, title, questions!inner(id)")
      .eq("questions.is_active", true)
      .order("chapter_number", { ascending: true });

    if (error) {
      return jsonResponse({ error: "No questions available" });
    }

    const chapterPool = (data ?? []).map((c) => ({
      id: c.id,
      chapter_number: c.chapter_number,
      title: c.title,
      question_count: c.questions.length,
    }));

    if (chapterPool.length === 0) {
      return jsonResponse({ error: "No questions available" });
    }

    const daysSinceEpoch = Math.floor(Date.now() / 86400000);
    const selectedChapter = chapterPool[daysSinceEpoch % chapterPool.length];

    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select(
        "id, question_text, options, correct_option, explanation, difficulty, domain",
      )
      .eq("chapter_id", selectedChapter.id)
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (qError || !questions?.length) {
      return jsonResponse({ error: "No questions available" });
    }

    const question = questions[daysSinceEpoch % questions.length];
    const ctaIndex = daysSinceEpoch % 3;
    const dateLabel = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    return jsonResponse({
      question_id: question.id,
      question_text: question.question_text,
      options: question.options,
      correct_option: question.correct_option,
      explanation: question.explanation,
      difficulty: question.difficulty,
      domain: question.domain,
      chapter_number: selectedChapter.chapter_number,
      chapter_title: selectedChapter.title,
      cta_index: ctaIndex,
      date_label: dateLabel,
    });
  } catch {
    return jsonResponse({ error: "Internal error" });
  }
});
