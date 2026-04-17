import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export interface TenseVariation {
  tense: string;
  french: string;
  english: string;
}

export interface ConjugateResponse {
  original: {
    french: string;
    tense: string;
    english: string;
  };
  variations: TenseVariation[];
}

const SYSTEM_PROMPT = `Tu es un expert en langue française. Quand tu analyses des phrases françaises et génères des variations de temps verbaux, tu penses et raisonnes en français d'abord, puis tu traduis en anglais. Tu te concentres sur des temps simples et accessibles pour les apprenants.`;

export async function POST(req: NextRequest) {
  const { sentence, apiKey } = await req.json();

  if (!sentence || !apiKey) {
    return NextResponse.json(
      { error: "Missing sentence or API key" },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Voici une phrase en français : "${sentence}"

1. Identifie le temps de cette phrase (en français).
2. Génère 3-4 variations de cette phrase dans des temps différents — choisis des temps PLUS SIMPLES ou ÉQUIVALENTS (jamais plus complexes que l'original). Par exemple, si la phrase est au présent, utilise l'imparfait, le passé composé, le futur simple, le conditionnel présent. Évite le subjonctif et les temps composés avancés.
3. Pour chaque variation, fournis la phrase en français et sa traduction en anglais naturel.
4. Fournis aussi la traduction anglaise de la phrase originale.

Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans explications, dans ce format exact :
{
  "original": { "french": "...", "tense": "...", "english": "..." },
  "variations": [
    { "tense": "...", "french": "...", "english": "..." }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const data: ConjugateResponse = JSON.parse(rawText);
  return NextResponse.json(data);
}
