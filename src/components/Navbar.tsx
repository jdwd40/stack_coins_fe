import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Button, 
  Heading, 
  useToast, 
  Text, 
  HStack,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { Coins, Wallet, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [userFunds, setUserFunds] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchUserFunds = async () => {
      if (!user) {
        setUserFunds(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('coin_users')
          .select('funds')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserFunds(data.funds);
      } catch (error) {
        console.error('Error fetching user funds:', error);
      }
    };

    fetchUserFunds();
    const interval = setInterval(fetchUserFunds, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      const e = error as Error;
      toast({
        title: 'Logout failed',
        description: e.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const NavLinks = () => (
    <>
      <Button
        as={Link}
        to="/"
        variant="ghost"
        _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
        color="var(--text-primary)"
      >
        Home
      </Button>
      {user && (
        <>
          <Button
            as={Link}
            to="/portfolio"
            variant="ghost"
            _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
            color="var(--text-primary)"
          >
            Portfolio
          </Button>
          
          <HStack spacing={2} px={4} py={2} className="glass-card rounded-lg">
            <Wallet size={16} className="text-[var(--neon-cyan)]" />
            <Text color="var(--text-primary)">
              £{userFunds?.toFixed(2) || '0.00'}
            </Text>
          </HStack>

          <Text color="var(--text-primary)" opacity={0.8} display={{ base: 'none', md: 'block' }}>
            {user.email}
          </Text>
          
          <Button
            onClick={handleLogout}
            className="neon-border"
            bg="transparent"
            color="var(--neon-cyan)"
            _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
          >
            Logout
          </Button>
        </>
      )}
      {!user && (
        <Button
          as={Link}
          to="/login"
          className="neon-border"
          bg="transparent"
          color="var(--neon-cyan)"
          _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
        >
          Login
        </Button>
      )}
    </>
  );

  return (
    <Box className="glass-card" px={{ base: 2, md: 4 }} py={3} mb={8}>
      <Flex maxW="1200px" mx="auto" alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Coins size={24} className="text-[var(--neon-cyan)]" />
          <Heading as="h1" size={{ base: 'md', md: 'lg' }} className="gradient-text ml-2">
            Coin Exchange
          </Heading>
        </Flex>

        {/* Desktop Navigation */}
        <Flex gap={4} alignItems="center" display={{ base: 'none', md: 'flex' }}>
          <NavLinks />
        </Flex>

        {/* Mobile Menu Button */}
        <IconButton
          aria-label="Open menu"
          icon={<Menu />}
          variant="ghost"
          color="var(--neon-cyan)"
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
        />

        {/* Mobile Navigation Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay backdropFilter="blur(4px)" />
          <DrawerContent bg="var(--dark-bg)">
            <DrawerCloseButton color="var(--neon-cyan)" />
            <DrawerHeader className="gradient-text">Menu</DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="stretch">
                <NavLinks />
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
};

export default Navbar;