import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { CONCERT_TICKETS_ADDRESS } from '../utils/constants';
// Importez l'ABI du contrat
import ConcertTicketsABI from '../contracts/ConcertTickets.json';

export const useContract = () => {
  const { web3, currentAccount } = useWeb3Context();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (web3 && CONCERT_TICKETS_ADDRESS) {
      const contractInstance = new web3.eth.Contract(
        ConcertTicketsABI.abi,
        CONCERT_TICKETS_ADDRESS
      );
      setContract(contractInstance);
    }
  }, [web3]);

  // Mémoriser les fonctions pour éviter les re-créations
  const contractFunctions = useMemo(() => {
    if (!contract || !web3 || !currentAccount) {
      return {};
    }

    return {
      // Créer un événement
      createEvent: async (name, venue, date, price, totalSeats) => {
        try {
          const priceInWei = web3.utils.toWei(price.toString(), 'ether');
          const dateTimestamp = Math.floor(new Date(date).getTime() / 1000);
          
          const result = await contract.methods
            .createEvent(name, venue, dateTimestamp, priceInWei, totalSeats)
            .send({ from: currentAccount });
            
          console.log('✅ Événement créé:', result);
          return result;
        } catch (error) {
          console.error('❌ Erreur création événement:', error);
          throw error;
        }
      },

      // Acheter un billet
      purchaseTicket: async (eventId, seatNumber, ticketPrice) => {
        try {
          const priceInWei = web3.utils.toWei(ticketPrice.toString(), 'ether');
          
          const result = await contract.methods
            .purchaseTicket(eventId, seatNumber)
            .send({ 
              from: currentAccount,
              value: priceInWei
            });
            
          console.log('✅ Billet acheté:', result);
          return result;
        } catch (error) {
          console.error('❌ Erreur achat billet:', error);
          throw error;
        }
      },

      // Obtenir les événements actifs
      getActiveEvents: async () => {
        try {
          const eventIds = await contract.methods.getActiveEvents().call();
          const events = [];
          
          for (let eventId of eventIds) {
            const event = await contract.methods.getEvent(eventId).call();
            events.push({
              ...event,
              id: eventId,
              ticketPrice: web3.utils.fromWei(event.ticketPrice, 'ether'),
              date: new Date(parseInt(event.date) * 1000)
            });
          }
          
          return events;
        } catch (error) {
          console.error('❌ Erreur récupération événements:', error);
          throw error;
        }
      },

      // Obtenir les billets de l'utilisateur
      getUserTickets: async () => {
        try {
          const ticketIds = await contract.methods.getUserTickets(currentAccount).call();
          const tickets = [];
          
          for (let ticketId of ticketIds) {
            const ticket = await contract.methods.tickets(ticketId).call();
            const event = await contract.methods.getEvent(ticket.eventId).call();
            
            tickets.push({
              id: ticketId,
              ...ticket,
              event: {
                ...event,
                ticketPrice: web3.utils.fromWei(event.ticketPrice, 'ether'),
                date: new Date(parseInt(event.date) * 1000)
              }
            });
          }
          
          return tickets;
        } catch (error) {
          console.error('❌ Erreur récupération billets:', error);
          throw error;
        }
      },

      // Utiliser un billet
      markTicketAsUsed: async (ticketId) => {
        try {
          const result = await contract.methods
            .useTicket(ticketId)
            .send({ from: currentAccount });
            
          console.log('✅ Billet utilisé:', result);
          return result;
        } catch (error) {
          console.error('❌ Erreur utilisation billet:', error);
          throw error;
        }
      },

      // Vérifier un billet
      verifyTicket: async (ticketId) => {
        try {
          const verification = await contract.methods.verifyTicket(ticketId).call();
          return verification;
        } catch (error) {
          console.error('❌ Erreur vérification billet:', error);
          throw error;
        }
      }
    };
  }, [contract, web3, currentAccount]);

  return {
    contract,
    ...contractFunctions
  };
};