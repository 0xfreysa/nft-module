import { response } from "@/llms/openai/main"
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources"
import fs from "fs"
import { ideas } from "@/projects/nft/tools/stylePrompts"

const systemPrompt = `
Given the following NFT traits and their cases, analyse the image andextract the traits information for tool call.

${ideas}
`

const tools = [
  {
    type: "function",
    function: {
      name: "get_nft_traits",
      description: "Get NFT traits information",
      parameters: {
        type: "object",
        required: [
          "facepaint",
          "headgear",
          "hair_adornments",
          "earrings",
          "background",
          "additional_objects",
          "expression_style",
          "theme",
        ],
        properties: {
          facepaint: {
            type: "string",
            description: "Style and pattern of facepaint",
          },
          headgear: {
            type: "string",
            description: "Type of headwear or crown",
          },
          hair_adornments: {
            type: "string",
            description: "Decorative elements in the hair",
          },
          earrings: {
            type: "string",
            description: "Type of earrings worn",
          },
          background: {
            type: "string",
            description: "Background style or setting",
          },
          additional_objects: {
            type: "string",
            description: "Additional objects or elements in the portrait",
          },
          expression_style: {
            type: "string",
            description: "Style of facial expression",
          },
          theme: {
            type: "string",
            description: "Overall theme of the portrait",
          },
          special_effects: {
            type: "string",
            description: "Special visual effects or magical elements",
          },
        },
      },
    },
  },
]

function base64FromImagePath(imagePath: string) {
  const image = fs.readFileSync(imagePath)
  return image.toString("base64")
}

export async function getTraits(
  imagePath: string
): Promise<Record<string, string>> {
  console.log("Getting traits for image", imagePath)
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this image and extract the traits",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${base64FromImagePath(imagePath)}`,
          },
        },
      ],
    },
  ]

  const modelResponse = await response({
    messages: messages,
    model: "gpt-4o",
    tools: tools as ChatCompletionTool[],
    toolChoice: "required",
  })

  const traits =
    modelResponse.choices?.[0]?.message?.tool_calls?.[0]?.function.arguments

  const processedTraits = Object.fromEntries(
    Object.entries(JSON.parse(traits ?? "{}"))
      .filter(([_, value]) => value !== "None")
      .map(([key, value]) => [
        key
          .split(" ")
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join(" "),
        value,
      ])
  ) as Record<string, string>

  return processedTraits
}
