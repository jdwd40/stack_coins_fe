import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Register the user
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Create user profile with initial funds
      const { error: profileError } = await supabase
        .from('coin_users')
        .insert([
          {
            user_id: data.user?.id,
            username,
            email,
            funds: 1000, // Initial £1000
          },
        ]);

      if (profileError) throw profileError;

      toast({
        title: 'Registration successful',
        description: 'Welcome to Coin Exchange! You have been credited with £1000.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/');
    } catch (error) {
      const e = error as Error;
      toast({
        title: 'Registration failed',
        description: e.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxWidth="400px" margin="0 auto" mt={8}>
      <VStack spacing={6} align="stretch" className="glass-card p-8 rounded-xl">
        <Heading className="gradient-text text-center">Register</Heading>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel color="var(--text-primary)">Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              bg="var(--card-bg)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              _hover={{ borderColor: 'var(--neon-cyan)' }}
              _focus={{ borderColor: 'var(--neon-cyan)', boxShadow: '0 0 0 1px var(--neon-cyan)' }}
              color="var(--text-primary)"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel color="var(--text-primary)">Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              bg="var(--card-bg)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              _hover={{ borderColor: 'var(--neon-cyan)' }}
              _focus={{ borderColor: 'var(--neon-cyan)', boxShadow: '0 0 0 1px var(--neon-cyan)' }}
              color="var(--text-primary)"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel color="var(--text-primary)">Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              bg="var(--card-bg)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              _hover={{ borderColor: 'var(--neon-cyan)' }}
              _focus={{ borderColor: 'var(--neon-cyan)', boxShadow: '0 0 0 1px var(--neon-cyan)' }}
              color="var(--text-primary)"
            />
          </FormControl>
          <Button
            type="submit"
            width="full"
            mt={6}
            isLoading={isLoading}
            className="neon-border"
            bg="transparent"
            color="var(--neon-cyan)"
            _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
          >
            Register
          </Button>
        </form>
        <Text mt={4} textAlign="center" color="var(--text-primary)">
          Already have an account?{' '}
          <ChakraLink as={Link} to="/login" color="var(--neon-cyan)">
            Login here
          </ChakraLink>
        </Text>
      </VStack>
    </Box>
  );
};

export default Register;