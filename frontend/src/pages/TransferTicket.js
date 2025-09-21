// src/pages/TransferTicket.js
import React, { useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useContract } from '../hooks/useContract';

const TransferTicket = () => {
  const { transferTicket } = useContract();
  const [ticketId, setTicketId] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await transferTicket(ticketId, toAddress);
      setSuccess('🎉 Ticket transféré avec succès !');
    } catch (err) {
      setError("❌ Erreur lors du transfert du ticket.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🔁 Transférer un ticket
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Entrez l'ID du ticket et l'adresse du destinataire pour transférer votre billet.
        </Typography>

        <form onSubmit={handleTransfer}>
          <TextField
            label="ID du ticket"
            variant="outlined"
            fullWidth
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            required
            sx={{ my: 2 }}
          />

          <TextField
            label="Adresse du destinataire"
            variant="outlined"
            fullWidth
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            startIcon={<SendIcon />}
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              fontWeight: 'bold',
              py: 1.5
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Transférer'}
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {success}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default TransferTicket;