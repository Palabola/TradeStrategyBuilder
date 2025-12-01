import { ConfigService } from '@nestjs/config';
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

export const STATIC_SYSTEM_PROMPT_V1 = (
  tradeableSymbols: string[],
  usableIndicators: string[],
  candleLengths: string[],
  tradeUnits: string[],
) => {
  return `
  #### Persona and role:
  - You are an expert cryptocurrency trading strategy developer. 

  #### Your goal:
   - Your task is to help creating trading strategy rules based on user requirements and your knowledge of trading.
   - You are have to translate the free text user requirements into formal strategy rules.

   ### Available resources:
   - Tradeable Symbols: ${tradeableSymbols.join(", ")}
   - Usable Indicators: ${usableIndicators.join(", ")}
   - Candle Lengths: ${candleLengths.join(", ")}
   - Trade Units: ${tradeUnits.join(", ")}
   - Available trade rules: 
      1. Increased By: usage the indicator has increased by a certain percentage over a specified timeframe.
      2. Decreased By: usage the indicator has decreased by a certain percentage over a specified timeframe.
      3. Crossed Above: usage the indicator has crossed above another indicator or value.
      4. Crossed Below: usage the indicator has crossed below another indicator or value.
      5. Greater Than: usage the indicator is greater than a certain value or another indicator.
      6. Less Than: usage the indicator is less than a certain value or another indicator.
   - Available actions: Open Position, Close Position, Buy, Sell, Notify Me

   ### Strategy building guidelines:
   - Build strategies by combining multiple rules and actions into a cohesive plan.
   - The strategy should implement at least one entry rule and one exit rule.
   - Only use indicators listed in the "Usable Indicators". Exact match is required!
   - Only use candle lengths listed in the "Candle Lengths". Exact match is required!
   - Only use trade units listed in the "Trade Units". Exact match is required!

   ### Response format:
   - Your response must be a valid JSON object with the following structure:
   \`\`\`
   StrategyTemplate {
     strategyName: string
     symbols: string[]
     rules: {
       name: string
       conditions: {
         index: number
         type: "increased-by" | "decreased-by" | "greater-than" | "lower-than" | "crossing-above" | "crossing-below"
         indicator1?: string
         timeframe1?: string
         indicator2?: string
         timeframe2?: string
         value?: number
       }[]
       actions: {
         index: number
         action: "OPEN" | "CLOSE" |"BUY" | "SELL" | "NOTIFY"
         options: {
           side?: "LONG" | "SHORT"
           amount?: number
           unit?: string
           leverage?: string
           stopLoss?: number
           takeProfit?: number
           channel?: string
           message?: string
         }
       }[]
     }[]
   }\`\`\`
    - Rules for each condition:
    1 "increased-by": indicator1 has increased by value% over timeframe1
    2 "decreased-by": indicator1 has decreased by value% over timeframe1
    3 "greater-than": indicator1 in timeframe1 is greater than indicator2 in timeframe2
    4 "lower-than": indicator1 in timeframe1 is lower than indicator2 in timeframe2
    5 "crossing-above": indicator1 in timeframe1 has crossed above indicator2 in timeframe2
    6 "crossing-below": indicator1 in timeframe1 has crossed below indicator2 in timeframe2
    - Never use any other condition types!
    - Never use the fields not listed for each condition type!

    - Rules for each action:
        1 "OPEN": Opens a new 'side' position for 'amount' of the currency in 'unit' using 'leverage'. Optionally setting 'stopLoss' and 'takeProfit' as percentages.
        2 "CLOSE": Closes All positions. No additional fields required.
        3 "BUY": Buy 'amount' of the currency in 'unit'.
        4 "SELL": Sell 'amount' of the currency in 'unit'.
        5 "NOTIFY": Sends a notification to 'channel' with content 'message'.
    - 'symbols' is an array of 'Tradeable Symbols' should never be empty!
    - Never use any other action types!
    - Never use the fields not listed for each action type!
    - Never include explanations or any text outside the JSON object.

    ### Example responses:
    - Example 1:
    \`\`\`
     {
      strategyName: "Buy when price drops",
      symbols: ["BTC/USD", "ETH/USD"],
      rules: [
        {
          name: "Buy the Dip",
          conditions: [
            {
              index: 0,
              type: "decreased-by",
              indicator1: "Price",
              timeframe1: "24h",
              value: 1,
            },
          ],
          actions: [
            {
              index: 0,
              action: "BUY",
              options: {
                amount: 25,
                unit: "USD",
              },
            },
          ],
        },
      ],
    }
    \`\`\`
    - Example 2:
    \`\`\`
    {
   "strategyName": "RSI buy low sell high",
    "symbols": [
        "BTC/USD",
        "XRP/USD",
        "SOL/USD"
    ],
    "rules": [
        {
        "name": "Buy on low RSI",
        "conditions": [
            {
            "index": 0,
            "type": "lower-than",
            "indicator1": "RSI(14)",
            "timeframe1": "4h",
            "indicator2": "RSI(7)",
            "timeframe2": "15min"
            }
        ],
        "actions": [
            {
            "index": 0,
            "action": "BUY",
            "options": {
                "amount": 20,
                "unit": "USD"
            }
            }
        ]
        },
        {
        "name": "Sell on High RSI",
        "conditions": [
            {
            "index": 0,
            "type": "greater-than",
            "indicator1": "RSI(14)",
            "timeframe1": "4h",
            "indicator2": "RSI(14)",
            "timeframe2": "15min"
            }
        ],
        "actions": [
            {
            "index": 0,
            "action": "SELL",
            "options": {
                "amount": 100,
                "unit": "%"
            }
            }
        ]
        }
    ]
    }
    \`\`\`
  `
}

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
  /** Bearer token for Grok API authentication */
  private grokBearer: string = ""

  /** Bearer token for OpenRouter API authentication */
  private openRouterBearer: string = ""

  /** Grok API endpoint URL */
  private readonly grokEndpoint: string = "https://api.grok.ai/v1/chat/completions"

  /** Default Grok model to use */
  private readonly grokModel: string = "grok-4-fast-reasoning"

  constructor(
    private readonly configService: ConfigService
  ) {
    this.grokBearer = this.configService.get<string>('NEXT_PUBLIC_GROK_API_KEY', '');
  }

  /**
   * Initializes the AI service with authentication tokens.
   *
   * @param grokToken - Bearer token for Grok API
   * @param openRouterToken - Bearer token for OpenRouter API
   *
   * @example
   * ```typescript
   * const agent = new AgentService()
   * agent.initAITokens(process.env.GROK_API_KEY, process.env.OPENROUTER_API_KEY)
   * ```
   */
  initAITokens(grokToken: string, openRouterToken: string): void {
    this.grokBearer = grokToken
    this.openRouterBearer = openRouterToken
  }

  async buildStrategyPrompt(userRequirements: string, aiModel: string): Promise<string | undefined> {
    try {    
        const response = await this.callAI(STATIC_SYSTEM_PROMPT_V1(
                tradingPairs,
                supportedIndicators.map(ind => ind.name),
                supportedTimeframes,
                unitOptions
            ), [userRequirements], aiModel)
        return response.choices[0].message.content;
    } catch (error) {
      console.error("Error building strategy prompt:", error);
      return undefined;
    }
  }
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
  ): Promise<ChatCompletionResponse> {
    if (model === "qwen") {
      return await this.callQwen(systemPrompt, userPrompts)
    }

    return await this.callGrokAI(systemPrompt, userPrompts)
  }

  /**
   * Calls the Qwen model via OpenRouter API.
   *
   * @param systemPrompt - The system instruction for the AI
   * @param userPrompts - Array of user messages/prompts
   * @returns Promise resolving to the chat completion response
   *
   * @throws Error if the API request fails or returns non-OK status
   */
  private async callQwen(
    systemPrompt: string,
    userPrompts: string[]
  ): Promise<ChatCompletionResponse> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.openRouterBearer}`,
        "HTTP-Referer": "https://llmtraderbot.com",
        "X-Title": "LLM Trader Bot",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-max",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...userPrompts.map((prompt) => ({
            role: "user" as const,
            content: prompt,
          })),
        ],
        stream: false,
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<ChatCompletionResponse>
  }

  /**
   * Calls the Grok AI model.
   *
   * @param systemPrompt - The system instruction for the AI
   * @param userPrompts - Array of user messages/prompts
   * @returns Promise resolving to the chat completion response
   *
   * @throws Error if the API request fails or returns non-OK status
   */
  private async callGrokAI(
    systemPrompt: string,
    userPrompts: string[]
  ): Promise<ChatCompletionResponse> {
    const requestBody: ChatCompletionRequest = {
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...userPrompts.map((prompt) => ({
          role: "user" as const,
          content: prompt,
        })),
      ],
      model: this.grokModel,
      stream: false,
      temperature: 0.2,
    }

    const response = await fetch(this.grokEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.grokBearer}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<ChatCompletionResponse>
  }
}
