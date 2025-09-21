import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { NETWORKS } from '../utils/constants';

const Web3Context = createContext();

export const useWeb3Context = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3Context must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Connexion au wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        
        setWeb3(web3Instance);
        setAccounts(accounts);
        setCurrentAccount(accounts[0]);
        setNetworkId(networkId);
        setIsConnected(true);
        
        console.log('✅ Wallet connecté:', accounts[0]);
        console.log('🌐 Réseau:', networkId);
        
      } else {
        alert('Veuillez installer MetaMask !');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const disconnect = () => {
    setWeb3(null);
    setAccounts([]);
    setCurrentAccount('');
    setNetworkId(null);
    setIsConnected(false);
  };

  // Écouter les changements de compte
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccounts(accounts);
          setCurrentAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value = {
    web3,
    accounts,
    currentAccount,
    networkId,
    isConnected,
    loading,
    connectWallet,
    disconnect
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};