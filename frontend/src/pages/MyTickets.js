import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  QrCode,
  Event as EventIcon,
  LocationOn,
  ConfirmationNumber
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import moment from 'moment';

import { useWeb3Context } from '../context/Web3Context';
import { useContract } from '../hooks/useContract';

const MyTickets = () => {
  const { isConnected } = useWeb3Context();
  const { getUserTickets, markTicketAsUsed } = useContract();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les billets de l'utilisateur - fonction simple
  const loadUserTickets = async () => {
    if (!isConnected || !getUserTickets) return;
    
    try {
      setLoading(true);
      const userTickets = await getUserTickets();
      setTickets(userTickets);
    } catch (error) {
      toast.error('Erreur lors du chargement des billets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect simple
  useEffect(() => {
    if (isConnected && getUserTickets) {
      loadUserTickets();
    }
  }, [isConnected]); // Seule dépendance: isConnected

  // Fonction pour utiliser un billet
  const handleUseTicket = async (ticketId) => {
    try {
      await markTicketAsUsed(ticketId);
      toast.success('Billet utilisé avec succès !');
      
      // Recharger après un délai
      setTimeout(() => {
        loadUserTickets();
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors de l\'utilisation du billet');
      console.error(error);
    }
  };

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          🔐 Connexion requise
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connectez votre wallet pour voir vos billets
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          🎫 Mes billets
        </Typography>
        <Button variant="outlined" onClick={loadUserTickets}>
          Actualiser
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tickets.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Vous n'avez aucun billet pour le moment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Achetez des billets pour vos événements préférés !
                </Typography>
              </Paper>
            </Grid>
          ) : (
            tickets.map((ticket) => (
              <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Billet #{ticket.id}
                      </Typography>
                      <Chip
                        label={ticket.isUsed ? 'Utilisé' : 'Valide'}
                        color={ticket.isUsed ? 'default' : 'success'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      🎵 {ticket.event.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn color="action" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {ticket.event.venue}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {moment(ticket.event.date).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ConfirmationNumber color="action" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Siège #{ticket.seatNumber}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<QrCode />}
                      disabled={ticket.isUsed}
                      onClick={() => handleUseTicket(ticket.id)}
                      sx={{ mb: 1 }}
                    >
                      {ticket.isUsed ? 'Billet utilisé' : 'Utiliser le billet'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

export default MyTickets;