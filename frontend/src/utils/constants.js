// Adresses des contrats (à mettre à jour après déploiement)
export const CONCERT_TICKETS_ADDRESS = "0x26CEff3D80C1684971e716784Bdb048F6F88Cd6B";

// Configuration du réseau
export const NETWORKS = {
  ganache: {
    chainId: '0x539', // 1337 en decimal
    chainName: 'GanachNetwork',
    rpcUrls: ['http://127.0.0.1:7545'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Test Network',
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

export const PLATFORM_FEE_PERCENT = 250; // 2.5%