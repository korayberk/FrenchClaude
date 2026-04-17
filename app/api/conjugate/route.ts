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
  conjugations: {
    tense: string;
    sentence_form: string;
    il_elle: string;
    ils_elles: string;
  }[];
}

export interface ConjugateResponse {
  _usage?: { input: number; output: number };
  corrected_input?: string;
  original: {
    french: string;
    tense: string;
    english: string;
    usage?: string;
  };
  variations: TenseVariation[];
  verbs?: VerbConjugation[];
}

const SYSTEM_PROMPT = `Tu es un expert en langue française. Tu penses et raisonnes en français, puis traduis en anglais.`;

export async function POST(req: NextRequest) {
  const { sentence, apiKey, model = "claude-sonnet-4-6" } = await req.json();

  if (!sentence || !apiKey) {
    return NextResponse.json({ error: "Missing sentence or API key" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Voici une phrase en français (potentiellement avec des fautes) : "${sentence}"

1. Corrige silencieusement les fautes d'orthographe, d'accentuation et de ponctuation. Si corrigé, retourne la phrase dans "corrected_input", sinon omet ce champ.
2. Identifie le temps de la phrase corrigée.
3. Génère des variations dans TOUS les temps pertinents plus simples ou équivalents — du passé lointain au conditionnel. Évite le subjonctif.
4. Pour l'original et chaque variation : phrase en français, traduction anglaise naturelle, courte note d'usage en anglais (1 phrase).

Réponds UNIQUEMENT avec du JSON valide, sans markdown :
{
  "corrected_input": "...",
  "original": { "french": "...", "tense": "...", "english": "...", "usage": "..." },
  "variations": [
    { "tense": "...", "french": "...", "english": "...", "usage": "..." }
  ]
}`;

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (message.stop_reason === "max_tokens") {
    return NextResponse.json({ error: "Response too long — try a shorter sentence." }, { status: 500 });
  }

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  const jsonText = start !== -1 && end !== -1 ? rawText.slice(start, end + 1) : rawText;

  try {
    const data = JSON.parse(jsonText);
    return NextResponse.json({
      ...data,
      _usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
    });
  } catch {
    return NextResponse.json({ error: "Could not parse response — please try again." }, { status: 500 });
  }
}
