import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import { Web3Provider } from './context/Web3Context';
import Header from './components/Header';
import Home from './pages/Home';
import Events from './pages/Events';
import MyTickets from './pages/MyTickets';
import EventDetails from './pages/EventDetails';
import TransferTicket from './pages/TransferTicket';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#21CBF3',
    },
    background: {
      default: '#f5f5f5'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Web3Provider>
        <Router>
          <div className="App">
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
                <Route path="/my-tickets" element={<MyTickets />} />
                <Route path="/event/:id" element={<EventDetails />} />
                <Route path="/transfer" element={<TransferTicket />} />
                <Route path="/transfer/:ticketId" element={<TransferTicket />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
            <Toaster position="top-right" />
          </div>
        </Router>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;