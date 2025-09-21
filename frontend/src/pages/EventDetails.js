// src/pages/EventDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  Event as EventIcon,
  Payment
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import moment from 'moment';

import { useWeb3Context } from '../context/Web3Context';
import { useContract } from '../hooks/useContract';

const EventDetails = () => {
  const { id } = useParams();
  const { isConnected, web3 } = useWeb3Context();
  const { getActiveEvents, purchaseTicket, contract } = useContract();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [seatNumber, setSeatNumber] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  const loadEventDetails = async () => {
    if (!isConnected || !contract) return;

    try {
      setLoading(true);
      const eventData = await contract.methods.getEvent(id).call();
      const eventDetails = {
        ...eventData,
        id: id,
        ticketPrice: web3.utils.fromWei(eventData.ticketPrice, 'ether'),
        date: new Date(parseInt(eventData.date) * 1000)
      };
      setEvent(eventDetails);
    } catch (error) {
      toast.error("Erreur lors du chargement de l'événement");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventDetails();
  }, [isConnected, id, contract]);

  const handlePurchase = async () => {
    if (!seatNumber || !event) return;

    try {
      setPurchasing(true);
      await purchaseTicket(event.id, parseInt(seatNumber), event.ticketPrice);
      toast.success(`Billet acheté avec succès ! Siège ${seatNumber}`);
      setPurchaseDialogOpen(false);
      setSeatNumber('');
      loadEventDetails();
    } catch (error) {
      toast.error("Erreur lors de l'achat du billet");
      console.error(error);
    } finally {
      setPurchasing(false);
    }
  };

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          🔐 Connexion requise
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connectez votre wallet pour voir les détails de l'événement
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" color="text.secondary">
          Événement non trouvé
        </Typography>
      </Box>
    );
  }

  const progressValue = (parseInt(event.soldTickets) / parseInt(event.totalSeats)) * 100;
  const isEventPassed = moment(event.date).isBefore(moment());
  const availableSeats = parseInt(event.totalSeats) - parseInt(event.soldTickets);

  return (
    <Box>
      <Paper sx={{
        p: 4,
        mb: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎵 {event.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn color="action" sx={{ mr: 1 }} />
              <Typography variant="h6" color="text.secondary">
                {event.venue}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="h6" color="text.secondary">
                {moment(event.date).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Payment color="action" sx={{ mr: 1 }} />
              <Typography variant="h6" color="text.secondary">
                {event.ticketPrice} ETH par billet
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Disponibilité
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  Billets vendus: {event.soldTickets}/{event.totalSeats}
                </Typography>
                <Typography variant="body1">
                  {progressValue.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{ height: 12, borderRadius: 6, mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {isEventPassed && (
                  <Chip label="Événement passé" color="error" />
                )}
                {availableSeats === 0 && !isEventPassed && (
                  <Chip label="Complet" color="warning" />
                )}
                {availableSeats > 0 && !isEventPassed && (
                  <Chip label={`${availableSeats} places disponibles`} color="success" />
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 3,
              backgroundColor: '#e3f2fd',
              borderRadius: 3,
              boxShadow: 2
            }}>
              <Typography variant="h6" gutterBottom>
                💳 Achat de billet
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                Prix: <strong>{event.ticketPrice} ETH</strong>
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                Commission plateforme: 2.5%
              </Typography>

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={isEventPassed || availableSeats === 0}
                onClick={() => setPurchaseDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  py: 2,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(33,150,243,0.3)'
                }}
              >
                {isEventPassed
                  ? 'Événement terminé'
                  : availableSeats === 0
                  ? 'Complet'
                  : 'Acheter un billet'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog d'achat */}
      <Dialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f0f8ff' }}>🎫 Acheter un billet</DialogTitle>
        <DialogContent sx={{ backgroundColor: '#fafafa' }}>
          <Typography variant="body1" paragraph>
            Événement: <strong>{event.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Prix: {event.ticketPrice} ETH
          </Typography>

          <TextField
            fullWidth
            label="Numéro de siège"
            type="number"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            placeholder={`Choisissez entre 1 et ${event.totalSeats}`}
            inputProps={{ min: 1, max: event.totalSeats }}
            margin="normal"
          />

          <Typography variant="caption" color="text.secondary">
            Choisissez un numéro de siège entre 1 et {event.totalSeats}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f0f0f0' }}>
          <Button onClick={() => setPurchaseDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handlePurchase}
            variant="contained"
            disabled={!seatNumber || purchasing}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              fontWeight: 'bold'
            }}
          >
            {purchasing ? 'Achat en cours...' : 'Acheter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetails;