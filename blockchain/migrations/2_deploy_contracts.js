const ConcertTickets = artifacts.require("ConcertTickets");

module.exports = function (deployer, network, accounts) {
  // Déploie le contrat ConcertTickets
  deployer.deploy(ConcertTickets).then(() => {
    console.log("=".repeat(50));
    console.log("🎫 ConcertTickets Contract Deployed Successfully!");
    console.log("=".repeat(50));
    console.log("📍 Contract Address:", ConcertTickets.address);
    console.log("🏗️  Network:", network);
    console.log("👤 Deployer:", accounts[0]);
    console.log("=".repeat(50));
  });
};