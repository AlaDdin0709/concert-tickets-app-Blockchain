// Smart contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x26CEff3D80C1684971e716784Bdb048F6F88Cd6B"

// Contract ABI - This would be the actual ABI from your deployed contract
export const CONTRACT_ABI = require("../../blockchain/build/contracts/ConcertTickets.json").abi

// Network configuration
export const SUPPORTED_NETWORKS = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
  1337: "Local Network",
}

export const DEFAULT_NETWORK_ID = 11155111 // Sepolia for development
