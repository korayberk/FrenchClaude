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

  const userPrompt = `Voici une phrase en français (telle que saisie par l'utilisateur, potentiellement avec des fautes) : "${sentence}"

0. Corrige silencieusement toutes les fautes d'orthographe, d'accentuation et de ponctuation. Si tu as fait des corrections, retourne la phrase corrigée dans le champ "corrected_input". Si la phrase était déjà correcte, omet ce champ.
1. Utilise la phrase corrigée pour tout ce qui suit. Identifie le temps de cette phrase (en français).
2. Génère des variations dans TOUS les temps pertinents qui sont plus simples ou équivalents au temps original — couvre tout le spectre temporel accessible à un apprenant (passé lointain, passé, présent, futur, conditionnel). Ne limite pas le nombre : génère autant que cela a du sens grammaticalement. Évite le subjonctif.
3. Pour l'original et chaque variation, fournis :
   - la phrase en français
   - sa traduction en anglais naturel
   - une courte note d'usage en anglais (1 phrase concise)
4. Identifie tous les verbes conjugués dans la phrase originale. Pour chaque verbe, fournis — à ces 4 temps : Présent, Imparfait, Passé composé, Futur simple — trois formes : la forme telle qu'elle apparaît dans la phrase (même personne/nombre), la forme il/elle, et la forme ils/elles.

Réponds UNIQUEMENT avec du JSON valide, sans markdown, dans ce format exact (respecte cet ordre de champs) :
{
  "corrected_input": "...",
  "verbs": [
    {
      "verb": "infinitif",
      "conjugations": [
        { "tense": "Présent", "sentence_form": "...", "il_elle": "...", "ils_elles": "..." },
        { "tense": "Imparfait", "sentence_form": "...", "il_elle": "...", "ils_elles": "..." },
        { "tense": "Passé composé", "sentence_form": "...", "il_elle": "...", "ils_elles": "..." },
        { "tense": "Futur simple", "sentence_form": "...", "il_elle": "...", "ils_elles": "..." }
      ]
    }
  ],
  "original": { "french": "...", "tense": "...", "english": "...", "usage": "..." },
  "variations": [
    { "tense": "...", "french": "...", "english": "...", "usage": "..." }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (message.stop_reason === "max_tokens") {
    return NextResponse.json(
      { error: "Response too long — try a shorter sentence." },
      { status: 500 }
    );
  }

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract the JSON object regardless of markdown fences or preamble text
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  const jsonText = start !== -1 && end !== -1 ? rawText.slice(start, end + 1) : rawText;

  try {
    const data: ConjugateResponse = JSON.parse(jsonText);
    return NextResponse.json({
      ...data,
      _usage: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not parse response — please try again." },
      { status: 500 }
    );
  }
}
