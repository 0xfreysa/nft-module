import OpenAI from "openai"
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
})

export const response = async ({
  messages,
  tools = undefined,
  toolChoice = "auto",
  model = "openai/gpt-3.5-turbo",
}: {
  messages: Array<ChatCompletionMessageParam>
  tools?: Array<ChatCompletionTool>
  toolChoice?: "required" | "auto"
  model?: string
}) => {
  const completion = await openai.chat.completions.create({
    model: model,
    messages: messages,
    tools: tools,
    tool_choice: toolChoice,
  })

  return completion
}

export const dallE3 = async ({ prompt }: { prompt: string }) => {
  const openaisdk = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  const completion = await openaisdk.images.generate({
    model: "dall-e-3",
    prompt: prompt,
  })
  return completion.data[0].url
}
