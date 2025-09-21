const ConcertTickets = artifacts.require("ConcertTickets");

// Fonctions helpers personnalisées pour remplacer @truffle/test-helpers
async function expectRevert(promise, expectedError) {
  try {
    await promise;
    throw new Error('Expected transaction to revert');
  } catch (error) {
    if (expectedError) {
      assert(
        error.message.includes(expectedError) || 
        error.reason === expectedError,
        `Expected error containing "${expectedError}" but got "${error.message}"`
      );
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

contract("ConcertTickets", (accounts) => {
  let concertTickets;
  
  // Comptes de test
  const [owner, chris, sarah, alex, marc] = accounts;
  
  // Données de test pour l'événement Coldplay
  const eventName = "Coldplay - Music of the Spheres World Tour";
  const venue = "Stade de France";
  const ticketPrice = web3.utils.toWei("0.1", "ether");
  const totalSeats = 1000;
  
  beforeEach(async () => {
    concertTickets = await ConcertTickets.new({ from: owner });
  });

  describe("📝 Déploiement du contrat", () => {
    it("devrait déployer correctement", async () => {
      assert.ok(concertTickets.address);
      console.log("✅ Contrat déployé à l'adresse:", concertTickets.address);
    });

    it("devrait définir le propriétaire correct", async () => {
      const contractOwner = await concertTickets.owner();
      assert.equal(contractOwner, owner);
      console.log("✅ Propriétaire défini:", contractOwner);
    });

    it("devrait avoir une commission de 2.5%", async () => {
      const platformFee = await concertTickets.platformFeePercent();
      assert.equal(platformFee.toString(), "250"); // 250 = 2.5%
      console.log("✅ Commission plateforme:", platformFee.toString() / 100, "%");
    });
  });

  describe("🎪 Création d'événements", () => {
    it("devrait créer un événement Coldplay avec succès", async () => {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // +1 jour
      
      const tx = await concertTickets.createEvent(
        eventName,
        venue,
        futureDate,
        ticketPrice,
        totalSeats,
        { from: chris }
      );

      // Vérifier l'événement émis
      assert.equal(tx.logs[0].event, "EventCreated");
      assert.equal(tx.logs[0].args.name, eventName);
      assert.equal(tx.logs[0].args.organizer, chris);
      console.log("✅ Événement créé par:", tx.logs[0].args.organizer);

      // Vérifier les détails de l'événement
      const event = await concertTickets.getEvent(1);
      assert.equal(event.name, eventName);
      assert.equal(event.venue, venue);
      assert.equal(event.organizer, chris);
      assert.equal(event.ticketPrice.toString(), ticketPrice);
      assert.equal(event.totalSeats.toString(), totalSeats.toString());
      assert.equal(event.isActive, true);
      console.log("✅ Détails de l'événement vérifiés");
    });

    it("ne devrait pas créer un événement avec une date passée", async () => {
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // -1 jour
      
      await expectRevert(
        concertTickets.createEvent(
          eventName,
          venue,
          pastDate,
          ticketPrice,
          totalSeats,
          { from: chris }
        ),
        "Date must be in the future"
      );
      console.log("✅ Rejet de date passée confirmé");
    });
  });

  describe("🎫 Achat de billets", () => {
    let eventId;
    let futureDate;

    beforeEach(async () => {
      futureDate = Math.floor(Date.now() / 1000) + 86400; // +1 jour
      const tx = await concertTickets.createEvent(
        eventName,
        venue,
        futureDate,
        ticketPrice,
        totalSeats,
        { from: chris }
      );
      eventId = tx.logs[0].args.eventId.toString();
    });

    it("Sarah devrait pouvoir acheter le siège 42", async () => {
      const seatNumber = 42;
      const chrisBalanceBefore = await web3.eth.getBalance(chris);
      
      const tx = await concertTickets.purchaseTicket(
        eventId,
        seatNumber,
        { from: sarah, value: ticketPrice }
      );

      // Vérifier l'événement émis
      const transferEvent = tx.logs.find(log => log.event === "Transfer");
      const purchaseEvent = tx.logs.find(log => log.event === "TicketPurchased");
      
      assert(transferEvent, "Transfer event should be emitted");
      assert(purchaseEvent, "TicketPurchased event should be emitted");
      assert.equal(purchaseEvent.args.eventId.toString(), eventId);
      assert.equal(purchaseEvent.args.seatNumber.toString(), seatNumber.toString());
      assert.equal(purchaseEvent.args.buyer, sarah);

      // Vérifier que Sarah possède le billet
      const ticketId = purchaseEvent.args.ticketId;
      const ticketOwner = await concertTickets.ownerOf(ticketId);
      assert.equal(ticketOwner, sarah);

      // Vérifier que le siège est pris
      const seatTaken = await concertTickets.seatTaken(eventId, seatNumber);
      assert.equal(seatTaken, true);

      console.log("✅ Sarah a acheté le billet #" + ticketId + " pour le siège " + seatNumber);

      // Vérifier les détails du billet
      const ticket = await concertTickets.tickets(ticketId);
      assert.equal(ticket.eventId.toString(), eventId);
      assert.equal(ticket.seatNumber.toString(), seatNumber.toString());
      assert.equal(ticket.isUsed, false);
      assert.equal(ticket.originalBuyer, sarah);

      // Vérifier que Chris a reçu ses 97.5%
      const chrisBalanceAfter = await web3.eth.getBalance(chris);
      const expectedPayment = web3.utils.toBN(ticketPrice).mul(web3.utils.toBN(975)).div(web3.utils.toBN(1000));
      const actualReceived = web3.utils.toBN(chrisBalanceAfter).sub(web3.utils.toBN(chrisBalanceBefore));
      
      console.log("💰 Paiement attendu pour Chris:", web3.utils.fromWei(expectedPayment.toString(), "ether"), "ETH");
      console.log("💰 Paiement reçu par Chris:", web3.utils.fromWei(actualReceived.toString(), "ether"), "ETH");
      
      assert.equal(actualReceived.toString(), expectedPayment.toString());
    });

    it("Sarah devrait pouvoir acheter le siège 43", async () => {
      const seatNumber = 43;
      
      const tx = await concertTickets.purchaseTicket(
        eventId,
        seatNumber,
        { from: sarah, value: ticketPrice }
      );

      // Vérifier que l'achat est réussi
      const purchaseEvent = tx.logs.find(log => log.event === "TicketPurchased");
      assert(purchaseEvent, "TicketPurchased event should be emitted");
      assert.equal(purchaseEvent.args.seatNumber.toString(), seatNumber.toString());
      console.log("✅ Sarah a acheté le siège " + seatNumber);
    });

    it("ne devrait pas permettre d'acheter le même siège deux fois", async () => {
      const seatNumber = 42;
      
      // Premier achat
      await concertTickets.purchaseTicket(
        eventId,
        seatNumber,
        { from: sarah, value: ticketPrice }
      );

      // Deuxième achat du même siège (devrait échouer)
      await expectRevert(
        concertTickets.purchaseTicket(
          eventId,
          seatNumber,
          { from: alex, value: ticketPrice }
        ),
        "Seat already taken"
      );
      console.log("✅ Double achat du même siège rejeté");
    });

    it("ne devrait pas permettre d'acheter avec un montant incorrect", async () => {
      const wrongPrice = web3.utils.toWei("0.05", "ether");
      
      await expectRevert(
        concertTickets.purchaseTicket(
          eventId,
          42,
          { from: sarah, value: wrongPrice }
        ),
        "Incorrect payment amount"
      );
      console.log("✅ Montant incorrect rejeté");
    });
  });

  describe("💝 Transfert de billets", () => {
    let eventId, ticketId;

    beforeEach(async () => {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const eventTx = await concertTickets.createEvent(
        eventName,
        venue,
        futureDate,
        ticketPrice,
        totalSeats,
        { from: chris }
      );
      eventId = eventTx.logs[0].args.eventId.toString();

      // Sarah achète deux billets
      const purchaseTx1 = await concertTickets.purchaseTicket(
        eventId,
        42,
        { from: sarah, value: ticketPrice }
      );
      
      const purchaseTx2 = await concertTickets.purchaseTicket(
        eventId,
        43,
        { from: sarah, value: ticketPrice }
      );
      
      const purchaseEvent = purchaseTx2.logs.find(log => log.event === "TicketPurchased");
      ticketId = purchaseEvent.args.ticketId; // Billet siège 43
    });

    it("Sarah devrait pouvoir transférer le siège 43 à Alex", async () => {
      // Vérifier que Sarah possède le billet
      const ownerBefore = await concertTickets.ownerOf(ticketId);
      assert.equal(ownerBefore, sarah);

      // Transférer le billet à Alex
      await concertTickets.transferFrom(sarah, alex, ticketId, { from: sarah });

      // Vérifier qu'Alex possède maintenant le billet
      const ownerAfter = await concertTickets.ownerOf(ticketId);
      assert.equal(ownerAfter, alex);
      console.log("✅ Billet transféré de Sarah à Alex");

      // Vérifier les billets de chaque utilisateur
      const sarahTickets = await concertTickets.getUserTickets(sarah);
      const alexTickets = await concertTickets.getUserTickets(alex);
      
      assert.equal(sarahTickets.length, 1); // Sarah garde 1 billet
      assert.equal(alexTickets.length, 1);  // Alex a 1 billet
      
      console.log("📊 Sarah possède", sarahTickets.length, "billet(s)");
      console.log("📊 Alex possède", alexTickets.length, "billet(s)");
    });
  });

  describe("🚪 Utilisation des billets", () => {
    let eventId, sarahTicketId, alexTicketId;

    beforeEach(async () => {
      const eventDate = Math.floor(Date.now() / 1000) + 3600; // +1 heure
      const eventTx = await concertTickets.createEvent(
        eventName,
        venue,
        eventDate,
        ticketPrice,
        totalSeats,
        { from: chris }
      );
      eventId = eventTx.logs[0].args.eventId.toString();

      // Sarah achète deux billets
      const purchaseTx1 = await concertTickets.purchaseTicket(
        eventId,
        42,
        { from: sarah, value: ticketPrice }
      );
      const purchaseEvent1 = purchaseTx1.logs.find(log => log.event === "TicketPurchased");
      sarahTicketId = purchaseEvent1.args.ticketId;

      const purchaseTx2 = await concertTickets.purchaseTicket(
        eventId,
        43,
        { from: sarah, value: ticketPrice }
      );
      const purchaseEvent2 = purchaseTx2.logs.find(log => log.event === "TicketPurchased");
      alexTicketId = purchaseEvent2.args.ticketId;

      // Sarah transfère le siège 43 à Alex
      await concertTickets.transferFrom(sarah, alex, alexTicketId, { from: sarah });
    });

    it("Alex devrait pouvoir utiliser son billet à l'entrée", async () => {
      // Utiliser le billet d'Alex
      const tx = await concertTickets.useTicket(alexTicketId, { from: marc });

      // Vérifier l'événement émis
      const usedEvent = tx.logs.find(log => log.event === "TicketUsed");
      assert(usedEvent, "TicketUsed event should be emitted");
      assert.equal(usedEvent.args.ticketId.toString(), alexTicketId.toString());
      assert.equal(usedEvent.args.eventId.toString(), eventId);

      // Vérifier que le billet est marqué comme utilisé
      const ticket = await concertTickets.tickets(alexTicketId);
      assert.equal(ticket.isUsed, true);
      console.log("✅ Alex a utilisé son billet avec succès");
    });

    it("ne devrait pas permettre d'utiliser un billet déjà utilisé", async () => {
      // Utiliser le billet une première fois
      await concertTickets.useTicket(alexTicketId, { from: marc });

      // Tenter de l'utiliser à nouveau (devrait échouer)
      await expectRevert(
        concertTickets.useTicket(alexTicketId, { from: marc }),
        "Ticket already used"
      );
      console.log("✅ Réutilisation de billet rejetée");
    });

    it("Sarah devrait pouvoir utiliser son billet", async () => {
      const tx = await concertTickets.useTicket(sarahTicketId, { from: marc });
      
      const usedEvent = tx.logs.find(log => log.event === "TicketUsed");
      assert(usedEvent, "TicketUsed event should be emitted");
      assert.equal(usedEvent.args.ticketId.toString(), sarahTicketId.toString());
      console.log("✅ Sarah a utilisé son billet avec succès");
    });
  });

  describe("🔍 Vérification des billets", () => {
    let eventId, ticketId;

    beforeEach(async () => {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const eventTx = await concertTickets.createEvent(
        eventName,
        venue,
        futureDate,
        ticketPrice,
        totalSeats,
        { from: chris }
      );
      eventId = eventTx.logs[0].args.eventId.toString();

      const purchaseTx = await concertTickets.purchaseTicket(
        eventId,
        42,
        { from: sarah, value: ticketPrice }
      );
      const purchaseEvent = purchaseTx.logs.find(log => log.event === "TicketPurchased");
      ticketId = purchaseEvent.args.ticketId;
    });

    it("devrait vérifier correctement un billet valide", async () => {
      const verification = await concertTickets.verifyTicket(ticketId);
      
      assert.equal(verification.isValid, true);
      assert.equal(verification.eventId.toString(), eventId);
      assert.equal(verification.seatNumber.toString(), "42");
      assert.equal(verification.isUsed, false);
      assert.equal(verification.currentOwner, sarah);
      assert.equal(verification.eventName, eventName);
      console.log("✅ Vérification de billet valide réussie");
    });

    it("devrait retourner false pour un billet inexistant", async () => {
      const verification = await concertTickets.verifyTicket(999);
      
      assert.equal(verification.isValid, false);
      console.log("✅ Billet inexistant correctement identifié");
    });
  });

  describe("🎯 Scénario complet Coldplay", () => {
    it("devrait reproduire exactement le scénario du document", async () => {
      console.log("\n🎪 === SCÉNARIO COMPLET COLDPLAY ===");
      
      // PHASE 1: Chris crée l'événement
      console.log("📝 Phase 1: Chris crée l'événement Coldplay");
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const eventTx = await concertTickets.createEvent(
        "Coldplay - Music of the Spheres World Tour",
        "Stade de France",
        futureDate,
        web3.utils.toWei("0.1", "ether"),
        1000,
        { from: chris }
      );
      const eventId = eventTx.logs[0].args.eventId.toString();
      console.log(`✅ Événement créé avec l'ID: ${eventId}`);

      // PHASE 2: Sarah achète siège 42
      console.log("🎫 Phase 2: Sarah achète le siège 42");
      const chrisBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(chris));
      
      const purchaseTx1 = await concertTickets.purchaseTicket(
        eventId,
        42,
        { from: sarah, value: web3.utils.toWei("0.1", "ether") }
      );
      const purchaseEvent1 = purchaseTx1.logs.find(log => log.event === "TicketPurchased");
      const ticket42Id = purchaseEvent1.args.ticketId;
      console.log(`✅ Sarah a acheté le billet #${ticket42Id} (siège 42)`);

      // PHASE 3: Sarah achète siège 43
      console.log("🎫 Phase 3: Sarah achète le siège 43");
      const purchaseTx2 = await concertTickets.purchaseTicket(
        eventId,
        43,
        { from: sarah, value: web3.utils.toWei("0.1", "ether") }
      );
      const purchaseEvent2 = purchaseTx2.logs.find(log => log.event === "TicketPurchased");
      const ticket43Id = purchaseEvent2.args.ticketId;
      console.log(`✅ Sarah a acheté le billet #${ticket43Id} (siège 43)`);

      // Vérifier les paiements de Chris
      const chrisBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(chris));
      const totalReceived = chrisBalanceAfter.sub(chrisBalanceBefore);
      const expectedTotal = web3.utils.toBN(web3.utils.toWei("0.1", "ether")).mul(web3.utils.toBN(2)).mul(web3.utils.toBN(975)).div(web3.utils.toBN(1000));
      console.log(`💰 Chris a reçu: ${web3.utils.fromWei(totalReceived.toString(), "ether")} ETH`);
      
      // PHASE 4: Sarah transfère le siège 43 à Alex
      console.log("💝 Phase 4: Sarah transfère le siège 43 à Alex");
      await concertTickets.transferFrom(sarah, alex, ticket43Id, { from: sarah });
      
      const newOwner = await concertTickets.ownerOf(ticket43Id);
      assert.equal(newOwner, alex);
      console.log(`✅ Alex est maintenant propriétaire du billet #${ticket43Id}`);

      // PHASE 5: Vérifications finales
      console.log("🔍 Phase 5: Vérifications finales");
      const sarahTickets = await concertTickets.getUserTickets(sarah);
      const alexTickets = await concertTickets.getUserTickets(alex);
      
      console.log(`📊 Sarah possède ${sarahTickets.length} billet(s)`);
      console.log(`📊 Alex possède ${alexTickets.length} billet(s)`);
      
      // Vérifier l'événement
      const event = await concertTickets.getEvent(eventId);
      console.log(`📈 Billets vendus: ${event.soldTickets}/1000`);
      
      // PHASE 6: Utilisation des billets (jour du concert)
      console.log("🚪 Phase 6: Jour du concert - Entrées");
      
      // Alex utilise son billet
      await concertTickets.useTicket(ticket43Id, { from: marc });
      const alexTicketAfter = await concertTickets.tickets(ticket43Id);
      assert.equal(alexTicketAfter.isUsed, true);
      console.log(`✅ Alex a utilisé son billet (siège 43)`);
      
      // Sarah utilise son billet
      await concertTickets.useTicket(ticket42Id, { from: marc });
      const sarahTicketAfter = await concertTickets.tickets(ticket42Id);
      assert.equal(sarahTicketAfter.isUsed, true);
      console.log(`✅ Sarah a utilisé son billet (siège 42)`);
      
      console.log("🎉 === SCÉNARIO TERMINÉ AVEC SUCCÈS ===\n");
      
      // Assertions finales
      assert.equal(sarahTickets.length, 1);
      assert.equal(alexTickets.length, 1);
      assert.equal(totalReceived.toString(), expectedTotal.toString());
      assert.equal(event.soldTickets.toString(), "2");
    });
  });
});