import fs from "fs"
import path from "path"
import { uploadDirectory } from "@/projects/nft/tools/ipfsUpload"
import { replicateRunWithRetry } from "@/llms/replicate"
import { getTraits } from "@/projects/nft/tools/traits"
import { FreysaNFT__factory } from "@/typechain-types"
import { signWithSafe } from "@/projects/nft/tools/safeSign"
import { generateStylePrompts } from "./stylePrompts"

const nftDir = path.join(process.cwd(), "projects", "nfts")
const metadataDir = path.join(process.cwd(), "projects", "metadata")
const ipfsDirPlaceholder = `PATH`

export const executeTools = async (name: string, args: string) => {
  try {
    const decodedArgs = JSON.parse(args)
    console.log(`Executing tool ${name} with arguments`, decodedArgs)

    switch (name) {
      case "Completed":
        return "NFT Creation Completed"

      case "define_project_metadata":
        return "Project metadata created"

      case "generate_nft_collection":
        return generateNFTCollection(
          decodedArgs.style_prompt,
          decodedArgs.count,
          decodedArgs.lore,
          decodedArgs.collection_name
        )

      case "uplaod_metadata_and_assets":
        return uploadMetadataAndAssets()

      case "deploy_erc721_contract":
        return deployERC721Contract(
          decodedArgs.name,
          decodedArgs.lore,
          decodedArgs.supply,
          decodedArgs.price,
          decodedArgs.base_url
        )

      case "plan_objective":
        return "Plan proposed."

      default:
        throw new Error(`Unknown Tool ${name}`)
    }
  } catch (error) {
    console.error("Error executing tool:", error)
    throw error
  }
}

async function generateNFTCollection(
  style_prompt: string,
  count: number,
  lore: string,
  collection_name: string
) {
  if (!fs.existsSync(nftDir)) {
    fs.mkdirSync(nftDir, { recursive: true })
  }

  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true })
  }

  const stylePrompts = await generateStylePrompts()

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * stylePrompts.length)
    const stylePrompt = stylePrompts[randomIndex]
    const imageUrls = await replicateRunWithRetry({
      prompt: stylePrompt,
      numOutputs: 1,
    })
    if (!imageUrls) {
      throw new Error("Failed to generate image")
    }

    const response = await fetch(imageUrls[0])
    const buffer = Buffer.from(await response.arrayBuffer())
    const imagePath = path.join(nftDir, `${i}.png`)
    fs.writeFileSync(imagePath, buffer)

    const traits = await getTraits(imagePath)
    console.log(traits)
    const metadata = {
      name: `${collection_name} #${i}`,
      description: lore,
      image: `${ipfsDirPlaceholder}/${i}.png`,
      traits: traits,
    }
    const metadataPath = path.join(metadataDir, `${i}.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
    console.log(`Saved image ${i} to ${imagePath}`)
  }

  return "NFT collection generated"
}

async function uploadMetadataAndAssets() {
  const imageIpfsHash = await uploadDirectory(nftDir)
  // Update metadata files with IPFS hash
  const metadataFiles = fs.readdirSync(metadataDir)
  for (const file of metadataFiles) {
    const metadataPath = path.join(metadataDir, file)
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    metadata.image = metadata.image.replace(
      ipfsDirPlaceholder,
      `ipfs://${imageIpfsHash}`
    )
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
  }

  // Upload updated metadata
  const ipfsHash = await uploadDirectory(metadataDir)
  return `Metadata uploaded to IPFS. Base URL: ipfs://${ipfsHash}`
}

export async function deployERC721Contract(
  name: string,
  lore: string,
  supply: number,
  price: number,
  base_url: string
) {
  if (!process.env.RPC_URL) {
    throw new Error("Missing RPC_URL in environment variables")
  }

  try {
    const factory = new FreysaNFT__factory()
    const deploymentData = await factory.getDeployTransaction(
      name,
      base_url,
      "FREYSA",
      supply
    )

    if (!deploymentData.data) {
      throw new Error("Failed to generate deployment data")
    }

    // Get just the constructor arguments portion from the deployment data
    const constructorArgs = deploymentData.data.slice(factory.bytecode.length)

    // Print encoded constructor arguments
    console.log("\nConstructor Arguments for Forge verification:")
    console.log(constructorArgs)

    await signWithSafe("0", deploymentData.data)

    return `ERC721 contract deployment transaction proposed through Safe`
  } catch (error) {
    console.error("Error deploying contract:", error)
    if (error instanceof Error) {
      throw new Error(`Contract deployment failed: ${error.message}`)
    }
    throw error
  }
}
