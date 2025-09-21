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
    <AppBar position="sticky" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
      <Toolbar>
        <LibraryMusic sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🎫 Concert Tickets DApp
        </Typography>
        
        {/* Menu de navigation */}
        {isConnected && (
          <Box sx={{ mr: 3 }}>
            <Tabs
              value={location.pathname}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                '& .MuiTab-root': {
                  color: 'white',
                  minWidth: 'auto',
                  px: 2
                }
              }}
            >
              <Tab 
                icon={<Home />} 
                label="Accueil" 
                value="/" 
                sx={{ minHeight: 48 }}
              />
              <Tab 
                icon={<Event />} 
                label="Événements" 
                value="/events" 
                sx={{ minHeight: 48 }}
              />
              <Tab 
                icon={<ConfirmationNumber />} 
                label="Mes Billets" 
                value="/my-tickets" 
                sx={{ minHeight: 48 }}
              />
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
                sx={{ color: 'white', borderColor: 'white' }}
              />
              <Button
                variant="outlined"
                color="inherit"
                onClick={disconnect}
                sx={{ borderColor: 'white', color: 'white' }}
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
                '&:hover': { backgroundColor: '#f5f5f5' }
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