import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { VerbConjugation } from "@/app/api/conjugate/route";

export async function POST(req: NextRequest) {
  const { sentence, apiKey, model = "claude-sonnet-4-6" } = await req.json();

  if (!sentence || !apiKey) {
    return NextResponse.json({ error: "Missing sentence or API key" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Voici une phrase en français : "${sentence}"

Identifie tous les verbes conjugués. Pour chacun, fournis sa conjugaison à la même personne/nombre que dans la phrase, plus il/elle et ils/elles, aux 4 temps suivants : Présent, Imparfait, Passé composé, Futur simple.

Réponds UNIQUEMENT avec du JSON valide, sans markdown :
[
  {
    "verb": "infinitif",
    "conjugations": [
      { "tense": "Présent", "sentence_form": "...", "il_elle": "...", "ils_elles": "..." },
      { "tense": "Imparfait", "sentence_form": "...", "il_elle": "...", "ils_elles": "..." },
      { "tense": "Passé composé", "sentence_form": "...", "il_elle": "...", "ils_elles": "..." },
      { "tense": "Futur simple", "sentence_form": "...", "il_elle": "...", "ils_elles": "..." }
    ]
  }
]`;

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system: "Tu es un expert en conjugaison française. Réponds uniquement avec du JSON valide.",
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const start = rawText.indexOf("[");
  const end = rawText.lastIndexOf("]");
  const jsonText = start !== -1 && end !== -1 ? rawText.slice(start, end + 1) : "[]";

  try {
    const verbs: VerbConjugation[] = JSON.parse(jsonText);
    return NextResponse.json({
      verbs,
      _usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
    });
  } catch {
    return NextResponse.json({ verbs: [] });
  }
}
