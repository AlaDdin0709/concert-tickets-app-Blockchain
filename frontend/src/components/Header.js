// src/components/Header.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  AccountBalanceWallet,
  LibraryMusic,
  AccountCircle,
  Home,
  Event,
  ConfirmationNumber
} from '@mui/icons-material';
import { useWeb3Context } from '../context/Web3Context';

const Header = () => {
  const { isConnected, currentAccount, connectWallet, disconnect, loading } = useWeb3Context();
  const navigate = useNavigate();
  const location = useLocation();

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ flexWrap: 'wrap' }}>
        <LibraryMusic sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            letterSpacing: 1,
            color: 'white'
          }}
        >
          🎫 Concert Tickets DApp
        </Typography>

        {isConnected && (
          <Box sx={{ mr: 3 }}>
            <Tabs
              value={location.pathname}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                '& .MuiTab-root': {
                  color: 'white',
                  minWidth: 'auto',
                  px: 2,
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: 2,
                  '&.Mui-selected': {
                    background: 'rgba(255,255,255,0.25)',
                    color: '#fff',
                    fontWeight: 'bold'
                  },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: '#fff'
                }
              }}
            >
              <Tab icon={<Home />} label="Accueil" value="/" />
              <Tab icon={<Event />} label="Événements" value="/events" />
              <Tab icon={<ConfirmationNumber />} label="Mes Billets" value="/my-tickets" />
              <Tab icon={<AccountCircle />} label="Transfert" value="/transfer" />
            </Tabs>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isConnected ? (
            <>
              <Chip
                icon={<AccountCircle />}
                label={formatAddress(currentAccount)}
                color="secondary"
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.1)'
                }}
              />
              <Button
                variant="outlined"
                color="inherit"
                onClick={disconnect}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)'
                  }
                }}
              >
                Déconnecter
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<AccountBalanceWallet />}
              onClick={connectWallet}
              disabled={loading}
              sx={{
                backgroundColor: 'white',
                color: '#2196F3',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {loading ? 'Connexion...' : 'Connecter Wallet'}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;