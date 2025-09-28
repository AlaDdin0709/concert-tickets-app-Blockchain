# BlockTix - Blockchain Concert Tickets

A secure, transparent concert ticket marketplace built on the blockchain.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   \`\`\`
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 🎫 Browse and purchase concert tickets
- 🔗 Blockchain-based ticket verification
- 💳 Secure wallet integration
- 🎵 Event discovery and management
- 🔄 Ticket transfer functionality
- 📊 Real-time statistics

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Blockchain**: Web3.js
- **UI Components**: Radix UI primitives

## Project Structure

\`\`\`
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── contexts/           # React contexts (Web3, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── public/             # Static assets
\`\`\`

## Environment Variables

- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your smart contract address

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
