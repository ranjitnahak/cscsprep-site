import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import satori from "https://esm.sh/satori@0.10.9";
import React from "https://esm.sh/react@18.2.0";
import { initWasm, Resvg } from "https://esm.sh/@resvg/resvg-wasm@2.4.1";

const PNG_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=3600",
  "Access-Control-Allow-Origin": "*",
};

const WIDTH = 1200;
const HEIGHT = 630;

interface QuestionOption {
  id: string;
  text: string;
}

interface TodaysQuestion {
  question_text: string;
  options: QuestionOption[];
}

const wasmBuffer = await fetch(
  "https://esm.sh/@resvg/resvg-wasm@2.4.1/index_bg.wasm",
).then((r) => r.arrayBuffer());
await initWasm(wasmBuffer);

const [barlowCondensed700, barlowCondensed800, barlow400] = await Promise.all([
  fetch(
    "https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2_3E.ttf",
  ).then((r) => r.arrayBuffer()),
  fetch(
    "https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B47b1_3E.ttf",
  ).then((r) => r.arrayBuffer()),
  fetch(
    "https://fonts.gstatic.com/s/barlow/v13/7cHpv4kjgoGqM7EPCw.ttf",
  ).then((r) => r.arrayBuffer()),
]);

const FONTS = [
  {
    name: "Barlow Condensed",
    data: barlowCondensed700,
    weight: 700,
    style: "normal",
  },
  {
    name: "Barlow Condensed",
    data: barlowCondensed800,
    weight: 800,
    style: "normal",
  },
  { name: "Barlow", data: barlow400, weight: 400, style: "normal" },
];

function pngResponse(bytes: Uint8Array): Response {
  return new Response(bytes, { status: 200, headers: PNG_HEADERS });
}

async function svgToPng(svg: string): Promise<Uint8Array> {
  const resvg = new Resvg(svg);
  return resvg.render().asPng();
}

async function renderImage(element: React.ReactElement): Promise<Uint8Array> {
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: FONTS,
  });
  return svgToPng(svg);
}

function questionFontSize(length: number): number {
  if (length > 180) return 28;
  if (length > 120) return 32;
  if (length > 80) return 38;
  return 44;
}

function truncateQuestion(text: string, maxLength = 180): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function buildOgElement(question: TodaysQuestion): React.ReactElement {
  const questionText = truncateQuestion(question.question_text);
  const fontSize = questionFontSize(questionText.length);
  const teaserOptions = question.options.slice(0, 2);

  return React.createElement(
    "div",
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        background: "#0F0F0F",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Barlow",
      },
    },
    React.createElement("div", {
      style: { width: WIDTH, height: 5, background: "#F4511E" },
    }),
    React.createElement(
      "div",
      {
        style: {
          padding: "16px 56px",
          display: "flex",
          alignItems: "center",
        },
      },
      React.createElement(
        "span",
        {
          style: {
            fontFamily: "Barlow Condensed",
            fontWeight: 800,
            fontSize: 22,
            color: "#FFFFFF",
            letterSpacing: 1,
          },
        },
        "CSCS ",
      ),
      React.createElement(
        "span",
        {
          style: {
            fontFamily: "Barlow Condensed",
            fontWeight: 800,
            fontSize: 22,
            color: "#F4511E",
          },
        },
        "PREP",
      ),
    ),
    React.createElement(
      "div",
      {
        style: {
          flex: 1,
          padding: "0px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            fontFamily: "Barlow Condensed",
            fontWeight: 600,
            fontSize: 13,
            color: "#AAAAAA",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 16,
          },
        },
        "QUESTION OF THE DAY",
      ),
      React.createElement(
        "div",
        {
          style: {
            fontFamily: "Barlow Condensed",
            fontWeight: 700,
            fontSize: fontSize,
            color: "#FFFFFF",
            lineHeight: 1.3,
            maxWidth: 1080,
            marginBottom: 32,
          },
        },
        questionText,
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 12 } },
        ...teaserOptions.map((opt) =>
          React.createElement(
            "div",
            {
              key: opt.id,
              style: {
                display: "flex",
                flexDirection: "row",
                gap: 14,
                alignItems: "flex-start",
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  fontFamily: "Barlow Condensed",
                  fontWeight: 700,
                  fontSize: 24,
                  color: "#F4511E",
                  minWidth: 28,
                },
              },
              `${opt.id}.`,
            ),
            React.createElement(
              "span",
              {
                style: {
                  fontFamily: "Barlow",
                  fontWeight: 400,
                  fontSize: 24,
                  color: "#CCCCCC",
                  lineHeight: 1.4,
                },
              },
              opt.text,
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      "div",
      {
        style: {
          width: WIDTH,
          height: 56,
          background: "#1A1A1A",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0px 56px",
        },
      },
      React.createElement(
        "span",
        {
          style: {
            fontFamily: "Barlow Condensed",
            fontWeight: 600,
            fontSize: 16,
            color: "#AAAAAA",
          },
        },
        "Tap to see all options →",
      ),
      React.createElement(
        "span",
        {
          style: {
            fontFamily: "Barlow Condensed",
            fontWeight: 600,
            fontSize: 16,
            color: "#F4511E",
          },
        },
        "cscsprep.in/question-of-the-day",
      ),
    ),
  );
}

function buildFallbackElement(): React.ReactElement {
  return React.createElement(
    "div",
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        background: "#0F0F0F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    React.createElement(
      "span",
      {
        style: {
          fontFamily: "Barlow Condensed",
          fontWeight: 800,
          fontSize: 48,
          color: "#FFFFFF",
        },
      },
      "CSCS Prep",
    ),
  );
}

async function getTodaysQuestion(
  supabase: SupabaseClient,
): Promise<TodaysQuestion> {
  const { data, error } = await supabase
    .from("chapters")
    .select("id, chapter_number, questions!inner(id)")
    .eq("questions.is_active", true)
    .in("questions.difficulty", ["medium", "hard"])
    .order("chapter_number", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch chapter pool");
  }

  const chapterPool = (data ?? []).map((c) => ({
    chapter_id: c.id,
    chapter_number: c.chapter_number,
    question_count: c.questions.length,
  }));

  if (chapterPool.length === 0) {
    throw new Error("No chapters available");
  }

  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const selectedChapter =
    chapterPool[daysSinceEpoch % chapterPool.length];

  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("question_text, options")
    .eq("chapter_id", selectedChapter.chapter_id)
    .eq("is_active", true)
    .in("difficulty", ["medium", "hard"])
    .order("id", { ascending: true });

  if (qError || !questions?.length) {
    throw new Error("No questions available");
  }

  const question = questions[daysSinceEpoch % questions.length];

  return {
    question_text: question.question_text,
    options: question.options as QuestionOption[],
  };
}

async function renderFallbackPng(): Promise<Uint8Array> {
  return renderImage(buildFallbackElement());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: PNG_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const question = await getTodaysQuestion(supabase);
    const png = await renderImage(buildOgElement(question));
    return pngResponse(png);
  } catch {
    try {
      const png = await renderFallbackPng();
      return pngResponse(png);
    } catch {
      return pngResponse(new Uint8Array(0));
    }
  }
});
