import { NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface AIRequestBody {
  model: string
  systemPrompt: string
  userPrompts: string[]
}

const GROK_ENDPOINT = "https://api.x.ai/v1/chat/completions"
const GROK_MODEL = "grok-3-fast"
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const body: AIRequestBody = await request.json()
    const { model, systemPrompt, userPrompts } = body

    if (!model || !systemPrompt || !userPrompts) {
      return NextResponse.json(
        { error: "Missing required fields: model, systemPrompt, userPrompts" },
        { status: 400 }
      )
    }

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...userPrompts.map((prompt) => ({
        role: "user" as const,
        content: prompt,
      })),
    ]

    let response: Response

    if (model === "qwen") {
      const openRouterKey = process.env.OPENROUTER_API_KEY
      if (!openRouterKey) {
        return NextResponse.json(
          { error: "OpenRouter API key not configured" },
          { status: 500 }
        )
      }

      response = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://llmtraderbot.com",
          "X-Title": "LLM Trader Bot",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3-max",
          messages,
          stream: false,
          temperature: 0.2,
        }),
      })
    } else {
      // Default to Grok
      const grokKey = process.env.GROK_API_KEY
      if (!grokKey) {
        return NextResponse.json(
          { error: "Grok API key not configured" },
          { status: 500 }
        )
      }

      response = await fetch(GROK_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${grokKey}`,
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages,
          stream: false,
          temperature: 0.2,
        }),
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`AI API error (${model}):`, response.status, errorText)
      return NextResponse.json(
        { error: `AI API request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "No content in AI response" },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("AI API route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
