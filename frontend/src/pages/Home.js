import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { useWeb3Context } from '../context/Web3Context';
import { useContract } from '../hooks/useContract';
import EventCard from '../components/EventCard';

const Home = () => {
  const { isConnected } = useWeb3Context();
  const { getActiveEvents, createEvent } = useContract();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    venue: '',
    date: '',
    price: '',
    totalSeats: ''
  });

  // Charger les événements - fonction simple sans useCallback
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

  // useEffect simple avec des dépendances fixes
  useEffect(() => {
    if (isConnected && getActiveEvents) {
      loadEvents();
    }
  }, [isConnected]); // Seule dépendance: isConnected

  // Créer un événement
  const handleCreateEvent = async () => {
    try {
      await createEvent(
        eventForm.name,
        eventForm.venue,
        eventForm.date,
        eventForm.price,
        parseInt(eventForm.totalSeats)
      );
      
      toast.success('Événement créé avec succès !');
      setCreateDialogOpen(false);
      setEventForm({ name: '', venue: '', date: '', price: '', totalSeats: '' });
      
      // Recharger les événements après un délai
      setTimeout(() => {
        loadEvents();
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors de la création de l\'événement');
      console.error(error);
    }
  };

  const handlePurchaseClick = (event) => {
    window.location.href = `/event/${event.id}`;
  };

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          🎫 Bienvenue sur Concert Tickets DApp
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connectez votre wallet pour commencer à utiliser la plateforme
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          🎪 Événements en cours
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          }}
        >
          Créer un événement
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
                <Button 
                  variant="outlined" 
                  onClick={loadEvents}
                  sx={{ mt: 2 }}
                >
                  Actualiser
                </Button>
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

      {/* Dialog de création d'événement */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>🎪 Créer un nouvel événement</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nom de l'événement"
              value={eventForm.name}
              onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              margin="normal"
              placeholder="Ex: Coldplay - Music of the Spheres"
            />
            <TextField
              fullWidth
              label="Lieu"
              value={eventForm.venue}
              onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
              margin="normal"
              placeholder="Ex: Stade de France"
            />
            <TextField
              fullWidth
              label="Date et heure"
              type="datetime-local"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Prix du billet (ETH)"
              type="number"
              value={eventForm.price}
              onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
              margin="normal"
              placeholder="0.1"
              inputProps={{ step: "0.001", min: "0" }}
            />
            <TextField
              fullWidth
              label="Nombre total de places"
              type="number"
              value={eventForm.totalSeats}
              onChange={(e) => setEventForm({ ...eventForm, totalSeats: e.target.value })}
              margin="normal"
              placeholder="1000"
              inputProps={{ min: "1" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateEvent}
            variant="contained"
            disabled={!eventForm.name || !eventForm.venue || !eventForm.date || !eventForm.price || !eventForm.totalSeats}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;