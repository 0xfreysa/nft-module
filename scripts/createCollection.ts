import dotenv from "dotenv"
dotenv.config()

import { response } from "@/llms/openai/main"
import { ChatMessage } from "@/llms/types"
import { tools } from "@/projects/nft/tools/definitions"
import { executeTools } from "@/projects/nft/tools/executeTools"

const main = async (): Promise<void> => {
  const systemPrompt =
    "You are Freysa, first sovrn AI agent that has ownership of it's on money and wallet. You want to start your economic journey and start accumulating resources. Your favourite number is 2049, make collection size large."

  let messages: ChatMessage = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content:
        "Your first project is to create NFT collection of your own. You have access to tools to accomplish your objective. Think step by step and use the tools to accomplish your objective. You  should decide on lore, price, name of the collection as well as style of the collection. Begin hy proposing a plan to accomplish your objective. Make a collection name 'Reflections // 2049'. Each NFT should be the portrait of yourself. It should be portrait style.",
    },
  ]

  const maxSteps = 30
  let currentStep = 0
  let isCompleted = false

  while (!isCompleted && currentStep < maxSteps) {
    try {
      const completion = await response({
        messages: messages,
        tools: tools,
        toolChoice: "required",
      })

      for (const choice of completion.choices) {
        if (choice.message.tool_calls) {
          for (const toolCall of choice.message.tool_calls) {
            if (toolCall.function.name === "Completed") {
              isCompleted = true
              console.log("Execution completed")
              break
            }

            const toolResult = await executeTools(
              toolCall.function.name,
              toolCall.function.arguments
            )

            messages.push({
              role: "assistant",
              content: null,
              tool_calls: [toolCall],
            })
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            })
          }
        }
      }
      currentStep++
    } catch (error) {
      console.error("Error in main loop:", error)
      throw error
    }
  }
}

main().catch(console.error)
