module.exports = {
  // Configuration des réseaux
  networks: {
    // Réseau de développement (Ganache)
    development: {
      host: "127.0.0.1",     // Localhost (Ganache GUI)
      port: 7545,            // Port standard de Ganache GUI
      network_id: "*",       // Accepte n'importe quel network ID
      gas: 6721975,          // Limite de gas
      gasPrice: 20000000000, // 20 gwei
      websockets: true       // Active les websockets
    },

    // Ganache CLI
    ganache: {
      host: "127.0.0.1",
      port: 8545,            // Port standard de Ganache CLI
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000
    },

    // Testnet (Sepolia)
    sepolia: {
      host: "sepolia.infura.io",
      port: 443,
      network_id: 11155111,
      gas: 4000000,
      gasPrice: 10000000000,
      ssl: true
      // Décommentez et ajoutez votre clé privée pour déployer sur testnet
      // from: "0x...",
      // privateKeys: ["0x..."]
    }
  },

  // Configuration du compilateur Solidity
  compilers: {
    solc: {
      version: "^0.8.19",    // Version de Solidity
      settings: {
        optimizer: {
          enabled: true,
          runs: 200          // Optimise pour 200 exécutions
        },
        evmVersion: "istanbul"
      }
    }
  },

  // Configuration des plugins
  plugins: [
    "truffle-plugin-verify"  // Pour vérifier les contrats sur Etherscan
  ],

  // Configuration des tests
  mocha: {
    timeout: 100000,
    reporter: 'spec'
  },

  // Configuration de la console
  console: {
    require: [
      'babel-register',
      'babel-polyfill'
    ]
  },

  // Configuration des migrations
  migrations_directory: './migrations',
  contracts_directory: './contracts',
  contracts_build_directory: './build/contracts',

  // Configuration des dépendances
  dependencies: {
    "@openzeppelin/contracts": "^4.9.0"
  }
};