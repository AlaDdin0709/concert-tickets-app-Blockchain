// src/components/EventCard.js
import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  LocationOn,
  Event as EventIcon,
  People,
  Payment
} from '@mui/icons-material';
import moment from 'moment';

const EventCard = ({ event, onPurchaseClick }) => {
  const progressValue = (parseInt(event.soldTickets) / parseInt(event.totalSeats)) * 100;
  const isEventPassed = moment(event.date).isBefore(moment());
  const availableSeats = parseInt(event.totalSeats) - parseInt(event.soldTickets);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
          🎵 {event.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn color="action" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {event.venue}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EventIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {moment(event.date).format('DD/MM/YYYY HH:mm')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Payment color="action" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {event.ticketPrice} ETH
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Billets vendus: {event.soldTickets}/{event.totalSeats}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progressValue.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{ height: 8, borderRadius: 4 }}
            color="primary"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {isEventPassed && (
            <Chip label="Événement passé" color="error" size="small" />
          )}
          {availableSeats === 0 && !isEventPassed && (
            <Chip label="Complet" color="warning" size="small" />
          )}
          {availableSeats > 0 && !isEventPassed && (
            <Chip
              label={`${availableSeats} places disponibles`}
              color="success"
              size="small"
            />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          disabled={isEventPassed || availableSeats === 0}
          onClick={() => onPurchaseClick(event)}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            fontWeight: 'bold',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)'
            }
          }}
        >
          {isEventPassed
            ? 'Événement terminé'
            : availableSeats === 0
            ? 'Complet'
            : 'Acheter un billet'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default EventCard;