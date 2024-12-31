import { ethers } from "ethers"
import { Contract } from "ethers"
import SafeApiKit from "@safe-global/api-kit"
import Safe from "@safe-global/protocol-kit"
import { MetaTransactionData, OperationType } from "@safe-global/types-kit"

const _abi = [
  {
    type: "function",
    name: "performCreate",
    inputs: [
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deploymentData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "newContract",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "performCreate2",
    inputs: [
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deploymentData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "salt",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "newContract",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ContractCreation",
    inputs: [
      {
        name: "newContract",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const

export async function signWithSafe(value: string, data: string) {
  const RPC_URL = process.env.RPC_URL!
  const deployerProxy = process.env.DEPLOYER_PROXY!
  const SAFE_ADDRESS = process.env.SAFE_ADDRESS!
  const OWNER_1_PRIVATE_KEY = process.env.PRIVATE_KEY!
  const OWNER_1_ADDRESS = new ethers.Wallet(OWNER_1_PRIVATE_KEY).address
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
  const chainId = await provider.getNetwork().then((network) => network.chainId)

  const contract = new Contract(deployerProxy, _abi)
  const tx = await contract.performCreate.populateTransaction(0, data)

  const apiKit = new SafeApiKit({
    chainId: chainId,
  })

  const protocolKitOwner1 = await Safe.init({
    provider: RPC_URL,
    signer: OWNER_1_PRIVATE_KEY,
    safeAddress: SAFE_ADDRESS,
  })

  const safeTransactionData: MetaTransactionData = {
    to: deployerProxy,
    value,
    data: tx.data,
    operation: OperationType.DelegateCall,
  }

  const safeTransaction = await protocolKitOwner1.createTransaction({
    transactions: [safeTransactionData],
  })

  const safeTxHash = await protocolKitOwner1.getTransactionHash(safeTransaction)
  const signature = await protocolKitOwner1.signHash(safeTxHash)

  await apiKit.proposeTransaction({
    safeAddress: SAFE_ADDRESS,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: OWNER_1_ADDRESS,
    senderSignature: signature.data,
  })
}
