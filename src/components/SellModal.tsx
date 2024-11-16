import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: {
    coin_id: number;
    coin_name: string;
    amount_held: number;
    current_price: string;
  };
}

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, portfolio }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFunds, setUserFunds] = useState(0);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchUserFunds = async () => {
      if (!user) return;
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
  }, [user]);

  const handleSell = async () => {
    if (!user || !amount) return;
    const sellAmount = parseFloat(amount);

    if (sellAmount > portfolio.amount_held) {
      toast({
        title: 'Insufficient coins',
        description: 'You cannot sell more coins than you own',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const totalValue = sellAmount * parseFloat(portfolio.current_price);
      const newAmount = portfolio.amount_held - sellAmount;

      if (newAmount === 0) {
        // Delete portfolio entry if selling all coins
        const { error: deleteError } = await supabase
          .from('portfolios')
          .delete()
          .eq('user_id', user.id)
          .eq('coin_id', portfolio.coin_id);

        if (deleteError) throw deleteError;
      } else {
        // Update portfolio with new amount
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({
            amount_held: newAmount,
            total_value: newAmount * parseFloat(portfolio.current_price),
          })
          .eq('user_id', user.id)
          .eq('coin_id', portfolio.coin_id);

        if (updateError) throw updateError;
      }

      // Update user funds
      const { error: fundsError } = await supabase
        .from('coin_users')
        .update({ funds: userFunds + totalValue })
        .eq('user_id', user.id);

      if (fundsError) throw fundsError;

      toast({
        title: 'Sale successful',
        description: `You sold ${amount} ${portfolio.coin_name} for $${totalValue.toFixed(2)}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      const e = error as Error;
      toast({
        title: 'Sale failed',
        description: e.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const totalValue = amount
    ? parseFloat(amount) * parseFloat(portfolio.current_price)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="var(--card-bg)" color="var(--text-primary)" className="glass-card">
        <ModalHeader className="gradient-text">Sell {portfolio.coin_name}</ModalHeader>
        <ModalCloseButton color="var(--neon-cyan)" />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Amount to Sell</FormLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to sell"
                max={portfolio.amount_held}
                bg="var(--card-bg)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                _hover={{ borderColor: 'var(--neon-cyan)' }}
                _focus={{ borderColor: 'var(--neon-cyan)' }}
              />
            </FormControl>

            <VStack spacing={2} align="stretch" w="100%">
              <Text>Current Price: ${parseFloat(portfolio.current_price).toFixed(2)}</Text>
              <Text>You Own: {portfolio.amount_held}</Text>
              <Text>Sale Value: ${totalValue.toFixed(2)}</Text>
              <Text>Current Funds: ${userFunds.toFixed(2)}</Text>
            </VStack>

            <Button
              onClick={handleSell}
              isLoading={loading}
              isDisabled={!amount || parseFloat(amount) > portfolio.amount_held}
              width="full"
              className="neon-border"
              bg="transparent"
              color="var(--neon-cyan)"
              _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
            >
              Sell
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SellModal;