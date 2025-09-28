"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "@/contexts/web3-context"
import type { Ticket } from "@/types/ticket"
import { toast } from "@/hooks/use-toast"

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { contract, account, isConnected, web3 } = useWeb3()

  // Fetch user's tickets from smart contract
  const fetchUserTickets = async () => {
    if (!contract || !account || !isConnected) return

    setIsLoading(true)
    try {
      // Get ticket IDs owned by the user
      const ticketIds: string[] = await contract.methods.getUserTickets(account).call()

      // Fetch ticket details for each ticket ID
      const ticketDetails = await Promise.all(
        ticketIds.map(async (id) => {
          const ticket = await contract.methods.tickets(id).call()
          return {
            id: Number(id),
            eventId: Number(ticket.eventId),
            seatNumber: Number(ticket.seatNumber),
            owner: ticket.originalBuyer,
            isUsed: ticket.isUsed,
            purchaseDate: Number(ticket.purchaseDate) ? Number(ticket.purchaseDate) * 1000 : Date.now(),
            transactionHash: undefined, // You may want to fetch this from events/logs if needed
          }
        })
      )
      setTickets(ticketDetails)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your tickets. Please try again.",
        variant: "destructive",
      })
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  // Buy ticket
  const buyTicket = async (eventId: number, seatNumber: number, ticketPrice: string) => {
    // Debug log all purchase parameters
    console.log("[buyTicket] Params:", {
      eventId,
      seatNumber,
      ticketPrice,
      account,
      contractAddress: contract?.options?.address,
      isConnected,
      web3: !!web3
    })
    if (!contract || !account || !web3) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase tickets.",
        variant: "destructive",
      })
      return { success: false, transactionHash: null }
    }

    try {
      setIsLoading(true)

      // Ensure ticketPrice is a string in ETH (not Wei)
      let priceEth: string
      // Defensive: ticketPrice should always be string, but handle if not
      if (typeof ticketPrice === "string") {
        // If it's a big number string (e.g. 1000000000000000000), convert to ETH
        if (/^\d{15,}$/.test(ticketPrice)) {
          priceEth = web3.utils.fromWei(ticketPrice, "ether")
        } else {
          priceEth = ticketPrice
        }
      } else {
        priceEth = String(ticketPrice)
      }

      // Log conversion
      console.log("[buyTicket] priceEth:", priceEth)

      // Convert ETH to Wei
      const priceInWei = web3.utils.toWei(priceEth, "ether")

  // Log conversion
  console.log("[buyTicket] priceInWei:", priceInWei)

      // Check network (normalize BigInt or string IDs)
      let networkIdRaw = await web3.eth.net.getId()
      const networkId = Number(networkIdRaw)

      console.log("[buyTicket] networkId:", networkId)
      // Allow Sepolia (11155111), Local (1337), Ganache (5777) and Mainnet (1)
      if (networkId !== 11155111 && networkId !== 1337 && networkId !== 5777 && networkId !== 1) {
        toast({
          title: "Wrong Network",
          description: `Please switch to Sepolia, Mainnet, or Local network. Current: ${networkId}`,
          variant: "destructive",
        })
        return { success: false, transactionHash: null }
      }

      // Send transaction

      // Notify and log before sending transaction
      toast({
        title: "Attempting Purchase",
        description: `Sending purchase transaction for seat ${seatNumber} at price ${priceEth} ETH...`,
      })
      console.log("[buyTicket] Attempting to send transaction:", {
        eventId,
        seatNumber,
        from: account,
        value: priceInWei,
        contractAddress: contract.options.address,
      })

      // Encode the contract call and send via MetaMask provider directly.
      // This forces MetaMask to prompt and avoids cases where the provider
      // used by the contract instance isn't the injected provider.
      const data = contract.methods.purchaseTicket(eventId, seatNumber).encodeABI()

      // Safely convert value and gas to hex. Some web3 builds may not expose
      // web3.utils.toBN in the browser bundle, so use BigInt as a reliable
      // fallback for converting decimal wei strings to 0x-prefixed hex.
      let valueHex: string
      let gasHex: string
      try {
        // priceInWei is a decimal string (e.g. "10000000000000000"). Use BigInt
        // to convert to a hex string that eth_sendTransaction expects.
        valueHex = `0x${BigInt(priceInWei).toString(16)}`
        gasHex = `0x${BigInt(300000).toString(16)}`
      } catch (e) {
        // As a defensive fallback, try using web3.utils.toHex if available.
        try {
          valueHex = web3.utils.toHex(priceInWei)
          gasHex = web3.utils.toHex(300000)
        } catch (e2) {
          // Last resort: send raw decimal strings (some providers accept this),
          // though it's not ideal. Keep them as-is to avoid throwing here.
          valueHex = priceInWei as any
          gasHex = (300000 as any)
        }
      }

      // Build tx params and validate them. eth_sendTransaction expects hex
      // values for numeric fields (0x-prefixed). Normalize and validate to
      // avoid internal JSON-RPC errors from the provider.
      const normalizeHex = (v: any) => {
        if (typeof v === "string") {
          if (v.startsWith("0x") || v.startsWith("0X")) return v
          // Decimal integer string -> convert
          if (/^\d+$/.test(v)) return `0x${BigInt(v).toString(16)}`
        }
        if (typeof v === "number") return `0x${BigInt(v).toString(16)}`
        // As a fallback, return as-is
        return v
      }

      const toAddress = contract?.options?.address
      if (!toAddress) {
        throw new Error("Contract address not available in web3 contract instance")
      }

      const txParams: any = {
        from: account,
        to: toAddress,
        data,
        value: normalizeHex(valueHex),
        gas: normalizeHex(gasHex),
      }

      console.log("[buyTicket] txParams:", txParams)

      // Parameter validation helpers
      const isHexString = (s: any) => typeof s === "string" && /^0x[0-9a-fA-F]+$/.test(s)
      const isAddress = (s: any) => typeof s === "string" && /^0x[0-9a-fA-F]{40}$/.test(s)

      // Log detailed types and small validations
      console.log("[buyTicket] tx param checks:", {
        from: { value: txParams.from, ok: isAddress(txParams.from) },
        to: { value: txParams.to, ok: isAddress(txParams.to) },
        data: { value: (txParams.data || "").slice(0, 20) + "...", ok: typeof txParams.data === "string" && txParams.data.startsWith("0x") },
        value: { value: txParams.value, ok: isHexString(txParams.value) || typeof txParams.value === "string" && /^\d+$/.test(txParams.value) },
        gas: { value: txParams.gas, ok: isHexString(txParams.gas) || typeof txParams.gas === "string" && /^\d+$/.test(txParams.gas) },
      })

      // If basic validations fail, surface a clear error before calling provider
      if (!isAddress(txParams.from)) {
        const msg = `Invalid 'from' address: ${txParams.from}`
        console.error(msg)
        toast({ title: "Invalid Parameter", description: msg, variant: "destructive" })
        return { success: false, transactionHash: null }
      }
      if (!isAddress(txParams.to)) {
        const msg = `Invalid 'to' address (contract): ${txParams.to}`
        console.error(msg)
        toast({ title: "Invalid Parameter", description: msg, variant: "destructive" })
        return { success: false, transactionHash: null }
      }
      if (!(typeof txParams.data === "string" && txParams.data.startsWith("0x"))) {
        const msg = `Invalid 'data' field; must be 0x-prefixed hex: ${String(txParams.data).slice(0, 80)}`
        console.error(msg)
        toast({ title: "Invalid Parameter", description: msg, variant: "destructive" })
        return { success: false, transactionHash: null }
      }

      let txHash: string | null = null
      if (typeof window !== "undefined" && (window as any).ethereum && (window as any).ethereum.request) {
        try {
          // First attempt: include gas. Some providers accept it.
          txHash = await (window as any).ethereum.request({
            method: "eth_sendTransaction",
            params: [txParams],
          })

          toast({
            title: "Purchase Sent",
            description: `Transaction submitted. Hash: ${txHash}`,
          })

          // Optionally wait for confirmation — for now, refresh list after a short delay
          setTimeout(() => {
            fetchUserTickets().catch((e) => console.error(e))
          }, 3000)

          return { success: true, transactionHash: txHash }
        } catch (err: any) {
          // When providers return "Internal JSON-RPC error", they often include
          // additional info in err.data or err.stack. Log everything to help
          // debugging and surface a clearer message to the user.
          console.error("eth_sendTransaction error:", err)
          console.error("eth_sendTransaction error - data:", err?.data ?? err?.error ?? null)

          // Show a better toast with provider feedback when available
          const providerMessage = err?.message || err?.data?.message || JSON.stringify(err?.data || err) || "Unknown provider error"
          toast({
            title: "Transaction Failed",
            description: providerMessage,
            variant: "destructive",
          })

          // If the provider rejected parameters, retry without gas (many
          // wallets will estimate gas themselves). Only retry once.
          try {
            const retryParams = { ...txParams }
            delete retryParams.gas
            console.log("[buyTicket] retrying eth_sendTransaction without gas:", retryParams)
            txHash = await (window as any).ethereum.request({
              method: "eth_sendTransaction",
              params: [retryParams],
            })

            toast({
              title: "Purchase Sent (retry)",
              description: `Transaction submitted. Hash: ${txHash}`,
            })

            setTimeout(() => {
              fetchUserTickets().catch((e) => console.error(e))
            }, 3000)

            return { success: true, transactionHash: txHash }
          } catch (err2: any) {
            console.error("eth_sendTransaction retry error:", err2)
            console.error("eth_sendTransaction retry - data:", err2?.data ?? err2?.error ?? null)
            // fallthrough to contract.send fallback below
          }

          // fallthrough to attempt contract.send as a fallback
        }
      }

      // Fallback: try using web3 contract send (older path)
      const transaction = await contract.methods.purchaseTicket(eventId, seatNumber).send({
        from: account,
        value: priceInWei,
        gas: 300000, // Estimate gas limit
      })

      toast({
        title: "Ticket Purchased!",
        description: `Successfully purchased seat ${seatNumber}. Transaction: ${transaction.transactionHash}`,
      })

      // Refresh tickets list
      await fetchUserTickets()

      return { success: true, transactionHash: transaction.transactionHash }
    } catch (error: any) {
      // Enhanced error logging
      console.error("Error buying ticket:", error)
      let errorMessage = "Failed to purchase ticket. Please try again."
      if (error.code === 4001) {
        errorMessage = "Transaction was rejected by user."
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH balance for this purchase."
      } else if (error.message?.includes("seat already taken")) {
        errorMessage = "This seat is no longer available."
      } else if (error.message) {
        errorMessage = error.message
      }
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, transactionHash: null }
    } finally {
      setIsLoading(false)
    }
  }

  // Use ticket (mark as used)
  const useTicket = async (ticketId: number) => {
    if (!contract || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to use tickets.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)

    try {
      await contract.methods.useTicket(ticketId).send({ from: account })

      toast({
        title: "Ticket Used",
        description: "Ticket has been successfully marked as used.",
      })

      // Refresh tickets list
      await fetchUserTickets()
      return true
    } catch (error: any) {
      console.error("Error using ticket:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to use ticket. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Transfer ticket
  const transferTicket = async (ticketId: number, toAddress: string) => {
    if (!contract || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to transfer tickets.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)

    try {
      // Validate recipient address
      const isAddressRegex = (s: any) => typeof s === "string" && /^0x[0-9a-fA-F]{40}$/.test(s)
      const isAddress = (s: any) => {
        try {
          if (web3 && web3.utils && typeof web3.utils.isAddress === "function") {
            return web3.utils.isAddress(s)
          }
        } catch (e) {
          // ignore
        }
        return isAddressRegex(s)
      }

      if (!isAddress(toAddress)) {
        toast({ title: "Invalid Address", description: "The recipient address is not a valid Ethereum address.", variant: "destructive" })
        return false
      }

      // Verify connected account is the ticket owner to produce a clearer error
      try {
        const currentOwner: string = await contract.methods.ownerOf(ticketId).call()
        if (currentOwner.toLowerCase() !== account.toLowerCase()) {
          toast({ title: "Not Ticket Owner", description: "You are not the owner of this ticket and cannot transfer it.", variant: "destructive" })
          return false
        }
      } catch (e) {
        // If ownerOf reverts or fails, show a generic message and continue to call transfer which will revert with a helpful message from the node/wallet
        console.warn("ownerOf check failed", e)
      }

      // Use ERC-721 safeTransferFrom(from, to, tokenId) to transfer the NFT
      // The current account should be the owner; call from the connected account so MetaMask prompts.
      await contract.methods.safeTransferFrom(account, toAddress, ticketId).send({ from: account })

      toast({
        title: "Ticket Transferred",
        description: `Ticket successfully transferred to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`,
      })

      // Refresh tickets list
      await fetchUserTickets()
      return true
    } catch (error: any) {
      console.error("Error transferring ticket:", error)
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer ticket. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Load tickets on mount and when account changes
  useEffect(() => {
    if (isConnected && contract && account) {
      fetchUserTickets()
    } else {
      // Show mock data when not connected
      setTickets(mockTickets)
    }
  }, [contract, account, isConnected])

  return {
    tickets,
    isLoading,
    fetchUserTickets,
    buyTicket,
    useTicket,
    transferTicket,
  }
}

// Mock data for development
const mockTickets: Ticket[] = [
  {
    id: 1,
    eventId: 1,
    seatNumber: 42,
    owner: "0x1234...5678",
    isUsed: false,
    purchaseDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    transactionHash: "0xabcd...efgh",
  },
  {
    id: 2,
    eventId: 2,
    seatNumber: 156,
    owner: "0x1234...5678",
    isUsed: true,
    purchaseDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    transactionHash: "0x1234...5678",
  },
]
