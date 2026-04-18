import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { VerbConjugation } from "@/app/api/conjugate/route";

export async function POST(req: NextRequest) {
  const { infinitives, apiKey, model = "claude-sonnet-4-6" } = await req.json();

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }
  if (!Array.isArray(infinitives) || infinitives.length === 0) {
    return NextResponse.json({ verbs: [], _usage: { input: 0, output: 0 } });
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Conjugue les verbes français suivants : ${JSON.stringify(infinitives)}

Pour chaque verbe, fournis la conjugaison complète (je, tu, il/elle, nous, vous, ils/elles) aux 4 temps suivants : Présent, Imparfait, Passé composé, Futur simple.

Réponds UNIQUEMENT avec du JSON valide, sans markdown :
[
  {
    "verb": "infinitif",
    "conjugations": [
      { "tense": "Présent", "je": "...", "tu": "...", "il_elle": "...", "nous": "...", "vous": "...", "ils_elles": "..." },
      { "tense": "Imparfait", "je": "...", "tu": "...", "il_elle": "...", "nous": "...", "vous": "...", "ils_elles": "..." },
      { "tense": "Passé composé", "je": "...", "tu": "...", "il_elle": "...", "nous": "...", "vous": "...", "ils_elles": "..." },
      { "tense": "Futur simple", "je": "...", "tu": "...", "il_elle": "...", "nous": "...", "vous": "...", "ils_elles": "..." }
    ]
  }
]`;

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: "Tu es un expert en conjugaison française. Réponds uniquement avec du JSON valide.",
    messages: [{ role: "user", content: userPrompt }],
  });

  if (message.stop_reason === "max_tokens") {
    return NextResponse.json({ error: "Response truncated — try fewer verbs at once." }, { status: 500 });
  }

  const textBlock = message.content.find((b) => b.type === "text");
  const rawText = textBlock && textBlock.type === "text" ? textBlock.text : "";

  if (!rawText) {
    return NextResponse.json({ error: "No text response from model — please try again." }, { status: 500 });
  }

  const start = rawText.indexOf("[");
  const end = rawText.lastIndexOf("]");
  const jsonText = start !== -1 && end !== -1 ? rawText.slice(start, end + 1) : "";

  if (!jsonText) {
    return NextResponse.json({ error: "Could not parse verb response — please try again." }, { status: 500 });
  }

  try {
    const verbs: VerbConjugation[] = JSON.parse(jsonText);
    return NextResponse.json({
      verbs,
      _usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
    });
  } catch (e) {
    console.error("[/api/verbs] JSON parse failed:", e, "\nRaw text:", rawText);
    return NextResponse.json({ error: "Could not parse verb response — please try again." }, { status: 500 });
  }
}
