import { supportedIndicators, supportedTimeframes } from './strategy-runner';
import { tradingPairs, unitOptions } from '../components/strategy/block-types';

/**
 * AI Strategy Builder Agent Service
 *
 * This service provides AI-powered assistance for building trading strategies.
 * It supports multiple AI providers including Grok and OpenRouter (Qwen).
 */

/**
 * Represents a single message in a chat conversation.
 */
export interface ChatMessage {
  /** The role of the message sender */
  role: "system" | "user" | "assistant"
  /** The content of the message */
  content: string
}

/**
 * Request payload for chat completion API calls.
 */
export interface ChatCompletionRequest {
  /** The model identifier to use for completion */
  model: string
  /** Array of messages forming the conversation */
  messages: ChatMessage[]
  /** Controls randomness in responses (0-2, lower is more deterministic) */
  temperature?: number
  /** Maximum number of tokens to generate */
  max_tokens?: number
  /** Reasoning effort level for supported models */
  reasoningEffort?: "low" | "medium" | "high"
  /** Whether to stream the response */
  stream?: boolean
}

/**
 * Response from chat completion API calls.
 */
export interface ChatCompletionResponse {
  /** Unique identifier for the completion */
  id: string
  /** Object type (e.g., "chat.completion") */
  object: string
  /** Unix timestamp of creation */
  created: number
  /** Model used for the completion */
  model: string
  /** Array of completion choices */
  choices: Array<{
    /** Index of this choice */
    index: number
    /** The generated message */
    message: ChatMessage
    /** Reason the generation stopped */
    finish_reason: string
  }>
  /** Token usage statistics */
  usage?: {
    /** Number of tokens in the prompt */
    prompt_tokens: number
    /** Number of tokens in the completion */
    completion_tokens: number
    /** Total tokens used */
    total_tokens: number
  }
}

export const supportedModels = ["grok", "qwen"]

/**
 * AI Agent Service for strategy building assistance.
 *
 * Provides methods to interact with various AI providers for generating
 * trading strategy suggestions and analysis.
 *
 * @example
 * ```typescript
 * const agent = new AgentService()
 * agent.initAITokens("grok-token", "openrouter-token")
 * const response = await agent.callAI("You are a trading assistant", ["Create a simple strategy"], "grok")
 * ```
 */
export class AgentService {

  /**
   * Calls the AI provider based on the specified model.
   *
   * @param systemPrompt - The system instruction for the AI
   * @param userPrompts - Array of user messages/prompts
   * @param model - The model to use ("qwen" for OpenRouter, otherwise Grok)
   * @returns Promise resolving to the chat completion response
   *
   * @throws Error if the API request fails
   *
   * @example
   * ```typescript
   * const response = await agent.callAI(
   *   "You are a trading strategy expert",
   *   ["Create a momentum-based strategy"],
   *   "grok"
   * )
   * console.log(response.choices[0].message.content)
   * ```
   */
  async callAI(
    systemPrompt: string,
    userPrompts: string[],
    model: string
  ): Promise<string> {
    // Call our API route to avoid CORS issues
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        systemPrompt,
        userPrompts,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `AI API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.content
  }
}

// Export singleton instance
export const agentService = new AgentService();