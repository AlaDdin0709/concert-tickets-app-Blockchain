// src/pages/MyTickets.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress
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

  useEffect(() => {
    if (isConnected && getUserTickets) {
      loadUserTickets();
    }
  }, [isConnected]);

  const handleUseTicket = async (ticketId) => {
    try {
      await markTicketAsUsed(ticketId);
      toast.success('Billet utilisé avec succès !');
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
      <Box sx={{
        mb: 4,
        py: 2,
        px: 3,
        background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
        borderRadius: 3,
        boxShadow: 2,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h5" fontWeight="bold">
          🎫 Mes billets
        </Typography>
        <Button
          variant="contained"
          onClick={loadUserTickets}
          sx={{
            backgroundColor: 'white',
            color: '#2196F3',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#f0f0f0'
            }
          }}
        >
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
              <Paper sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: '#f9f9f9',
                boxShadow: 2
              }}>
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
                <Card sx={{
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
                  boxShadow: 3,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}>
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
                      variant="contained"
                      fullWidth
                      startIcon={<QrCode />}
                      disabled={ticket.isUsed}
                      onClick={() => handleUseTicket(ticket.id)}
                      sx={{
                        background: ticket.isUsed
                          ? '#cfd8dc'
                          : 'linear-gradient(45deg, #66bb6a 30%, #43a047 90%)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
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