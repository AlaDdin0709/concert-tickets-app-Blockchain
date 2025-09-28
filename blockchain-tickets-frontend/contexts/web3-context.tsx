"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

// Types
interface Web3State {
  web3: any
  account: string | null
  contract: any
  isConnected: boolean
  isLoading: boolean
  networkId: number | null
}

interface Web3ContextType extends Web3State {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (networkId: number) => Promise<void>
}

// Create context
const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Provider component
export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Web3State>({
    web3: null,
    account: null,
    contract: null,
    isConnected: false,
    isLoading: false,
    networkId: null,
  })

  // Initialize Web3 and contract
  const initializeWeb3 = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window !== "undefined" && window.ethereum) {
        const Web3 = (await import("web3")).default

        // Ensure MetaMask's provider is used
        const web3Instance = new Web3(window.ethereum)

        // Log provider details for debugging
        console.log("Using MetaMask provider:", window.ethereum)

        // Get network ID
        const networkId = await web3Instance.eth.net.getId()

        // Import contract constants
        const { CONTRACT_ADDRESS, CONTRACT_ABI } = await import("@/lib/constants")

        // Create contract instance
        const contract = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)

        setState((prev) => ({
          ...prev,
          web3: web3Instance,
          contract,
          networkId: Number(networkId),
        }))

        return web3Instance
      } else {
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask to use this application.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error("Error initializing Web3:", error)
      toast({
        title: "Connection Error",
        description: "Failed to initialize Web3. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const web3Instance = await initializeWeb3()
      if (!web3Instance) return

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setState((prev) => ({
          ...prev,
          account: accounts[0],
          isConnected: true,
          isLoading: false,
        }))

        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setState((prev) => ({ ...prev, isLoading: false }))

      if (error.code === 4001) {
        toast({
          title: "Connection Rejected",
          description: "Please approve the connection to continue.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setState({
      web3: null,
      account: null,
      contract: null,
      isConnected: false,
      isLoading: false,
      networkId: null,
    })

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  // Switch network
  const switchNetwork = async (targetNetworkId: number) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetNetworkId.toString(16)}` }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        toast({
          title: "Network Not Added",
          description: "Please add this network to MetaMask first.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Network Switch Failed",
          description: "Failed to switch network. Please try manually.",
          variant: "destructive",
        })
      }
    }
  }

  // Listen for account and network changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setState((prev) => ({
            ...prev,
            account: accounts[0],
            isConnected: true,
          }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        const networkId = Number.parseInt(chainId, 16)
        setState((prev) => ({ ...prev, networkId }))
        // Reload the page to reset the dapp state
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      // Check if already connected
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          initializeWeb3().then(() => {
            setState((prev) => ({
              ...prev,
              account: accounts[0],
              isConnected: true,
            }))
          })
        }
      })

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [])

  const contextValue: Web3ContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  }

  return <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
}

// Custom hook to use Web3 context
export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
