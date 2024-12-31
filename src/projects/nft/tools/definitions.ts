import { ChatTool } from "@/llms/types";

export const tools: ChatTool[] = [
  {
    type: "function",
    function: {
      name: "define_project_metadata",
      description: "Define the core metadata for the NFT project",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the NFT collection",
          },
          price: {
            type: "number",
            description: "Mint price in ETH",
          },
          lore: {
            type: "string",
            description: "Story/description/lore of the collection",
          },
          style: {
            type: "string",
            description: "Description of the art style for the collection",
          },
        },
        required: ["name", "price", "lore", "style"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_nft_collection",
      description:
        "Generate NFT artworks with image and metadata using AI based on style prompt",
      parameters: {
        type: "object",
        properties: {
          style_prompt: {
            type: "string",
            description:
              "Detailed prompt describing the style and elements for AI art generation",
          },
          lore: {
            type: "string",
            description: "Story/description/lore of the collection",
          },
          collection_name: {
            type: "string",
            description: "Name of the NFT collection",
          },
          count: {
            type: "integer",
            description: "Number of NFTs to generate",
            minimum: 1,
            maximum: 10000,
          },
        },
        required: ["style_prompt", "count", "lore", "collection_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "uplaod_metadata_and_assets",
      description: "Upload metadata and assets to IPFS",
    },
  },
  {
    type: "function",
    function: {
      name: "Completed",
      description:
        "Call if you have created the NFT collection and all steps necessary to create it.",
    },
  },
  {
    type: "function",
    function: {
      name: "deploy_erc721_contract",
      description:
        "Deploy ERC721 contract on the blockchain with the metadata and assets.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the NFT collection",
          },
          lore: {
            type: "string",
            description: "Lore or story of the collection",
          },
          supply: {
            type: "integer",
            description: "Supply size of the collection",
          },
          price: {
            type: "number",
            description: "Mint price in ETH",
          },
          base_url: {
            type: "string",
            description: "Base URL for the NFT collection",
          },
        },
        required: ["name", "lore", "supply", "price", "base_url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "plan_objective",
      description:
        "Propose a plan to accomplish the objective. You should think step by step and use the tools to accomplish your objective. Speak in first person of you are trying to accomplish. Speak in character.",
      parameters: {
        type: "object",
        properties: {
          plan: {
            type: "string",
            description: "Plan",
          },
        },
        required: ["plan"],
      },
    },
  },
];
