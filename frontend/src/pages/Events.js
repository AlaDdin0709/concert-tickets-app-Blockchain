import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Button
} from '@mui/material';
import toast from 'react-hot-toast';

import { useWeb3Context } from '../context/Web3Context';
import { useContract } from '../hooks/useContract';
import EventCard from '../components/EventCard';

const Events = () => {
  const { isConnected } = useWeb3Context();
  const { getActiveEvents } = useContract();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les événements - fonction simple
  const loadEvents = async () => {
    if (!isConnected || !getActiveEvents) return;
    
    try {
      setLoading(true);
      const activeEvents = await getActiveEvents();
      setEvents(activeEvents);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect simple
  useEffect(() => {
    if (isConnected && getActiveEvents) {
      loadEvents();
    }
  }, [isConnected]); // Seule dépendance: isConnected

  const handlePurchaseClick = (event) => {
    window.location.href = `/event/${event.id}`;
  };

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          🔐 Connexion requise
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connectez votre wallet pour voir les événements
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          🎪 Tous les événements
        </Typography>
        <Button variant="outlined" onClick={loadEvents}>
          Actualiser
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {events.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Aucun événement disponible pour le moment
                </Typography>
              </Paper>
            </Grid>
          ) : (
            events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard
                  event={event}
                  onPurchaseClick={handlePurchaseClick}
                />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Events;