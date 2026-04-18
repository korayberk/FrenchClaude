import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { sentence, apiKey, model = "claude-sonnet-4-6" } = await req.json();

  if (!sentence || !apiKey) {
    return NextResponse.json({ error: "Missing sentence or API key" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Voici une phrase en français : "${sentence}"

Identifie TOUS les verbes présents dans la phrase, listés à l'infinitif. Inclut :
- les verbes conjugués (ex. "mange" → manger) ;
- les auxiliaires des temps composés comme verbes à part entière (ex. pour "je suis arrivé", liste être ET arriver séparément) ;
- les infinitifs (ex. pour "j'aime nager", liste aimer ET nager séparément).

Réponds UNIQUEMENT avec un tableau JSON d'infinitifs en minuscules, sans markdown :
["infinitif1", "infinitif2", ...]`;

  const message = await client.messages.create({
    model,
    max_tokens: 512,
    system: "Tu es un expert en conjugaison française. Réponds uniquement avec du JSON valide.",
    messages: [{ role: "user", content: userPrompt }],
  });

  if (message.stop_reason === "max_tokens") {
    return NextResponse.json({ error: "Response truncated — try a shorter sentence." }, { status: 500 });
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
    return NextResponse.json({ error: "Could not parse infinitives response — please try again." }, { status: 500 });
  }

  try {
    const parsed: unknown = JSON.parse(jsonText);
    if (!Array.isArray(parsed) || !parsed.every((v) => typeof v === "string")) {
      throw new Error("not an array of strings");
    }
    const seen = new Set<string>();
    const infinitives = (parsed as string[])
      .map((v) => v.trim().toLowerCase())
      .filter((v) => {
        if (!v || seen.has(v)) return false;
        seen.add(v);
        return true;
      });
    return NextResponse.json({
      infinitives,
      _usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
    });
  } catch (e) {
    console.error("[/api/verb-infinitives] JSON parse failed:", e, "\nRaw text:", rawText);
    return NextResponse.json({ error: "Could not parse infinitives response — please try again." }, { status: 500 });
  }
}
