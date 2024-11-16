import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BuySell from './pages/BuySell';
import Portfolio from './pages/Portfolio';

function App() {
  return (
    <Box minHeight="100vh" bg="var(--dark-bg)">
      <Navbar />
      <Box 
        maxWidth="1200px" 
        margin="0 auto" 
        px={{ base: 2, sm: 4 }}
        py={4}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/buy-sell" element={<BuySell />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;