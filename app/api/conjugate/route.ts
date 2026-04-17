import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export interface TenseVariation {
  tense: string;
  french: string;
  english: string;
  usage?: string;
}

export interface VerbConjugation {
  verb: string;
  conjugations: { tense: string; form: string }[];
}

export interface ConjugateResponse {
  original: {
    french: string;
    tense: string;
    english: string;
    usage?: string;
  };
  variations: TenseVariation[];
  verbs?: VerbConjugation[];
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
2. Génère 3-4 variations dans des temps PLUS SIMPLES ou ÉQUIVALENTS (jamais plus complexes que l'original). Évite le subjonctif et les temps composés avancés.
3. Pour l'original et chaque variation, fournis :
   - la phrase en français
   - sa traduction en anglais naturel
   - une courte note d'usage en anglais (1 phrase concise, ex: "Used for completed past actions with a clear endpoint")
4. Identifie tous les verbes conjugués dans la phrase originale. Pour chaque verbe, fournis sa conjugaison à la même personne/nombre en : Présent, Imparfait, Passé composé, Futur simple.

Réponds UNIQUEMENT avec du JSON valide, sans markdown, dans ce format exact :
{
  "original": { "french": "...", "tense": "...", "english": "...", "usage": "..." },
  "variations": [
    { "tense": "...", "french": "...", "english": "...", "usage": "..." }
  ],
  "verbs": [
    {
      "verb": "infinitif",
      "conjugations": [
        { "tense": "Présent", "form": "..." },
        { "tense": "Imparfait", "form": "..." },
        { "tense": "Passé composé", "form": "..." },
        { "tense": "Futur simple", "form": "..." }
      ]
    }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1536,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const data: ConjugateResponse = JSON.parse(rawText);
  return NextResponse.json(data);
}
