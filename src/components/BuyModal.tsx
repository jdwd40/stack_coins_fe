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
  Select,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Coin {
  coin_id: number;
  name: string;
  symbol: string;
  current_price: string;
}

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCoinId?: number;
}

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, selectedCoinId }) => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [amount, setAmount] = useState('');
  const [userFunds, setUserFunds] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get<Coin[]>('https://jdwd40.com/api/coins');
        const coinsData = response.data;
        setCoins(coinsData);
        
        if (selectedCoinId) {
          const selectedCoinData = coinsData.find(c => c.coin_id === selectedCoinId);
          if (selectedCoinData) {
            setSelectedCoin(selectedCoinData);
          }
        }
      } catch (error) {
        console.error('Error fetching coins:', error);
        toast({
          title: 'Error fetching coins',
          description: 'Unable to load coin data. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

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
        toast({
          title: 'Error fetching funds',
          description: 'Unable to load your funds. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchCoins();
    fetchUserFunds();
  }, [selectedCoinId, user, toast]);

  const handleBuy = async () => {
    if (!user || !selectedCoin || !amount) {
      toast({
        title: 'Invalid input',
        description: 'Please select a coin and enter an amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const purchaseAmount = parseFloat(amount);
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid positive number',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const currentPrice = parseFloat(selectedCoin.current_price);
    const totalCost = currentPrice * purchaseAmount;

    if (totalCost > userFunds) {
      toast({
        title: 'Insufficient funds',
        description: 'You do not have enough funds for this purchase',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Start a transaction
      const { error: fundsError } = await supabase
        .from('coin_users')
        .update({ funds: userFunds - totalCost })
        .eq('user_id', user.id);

      if (fundsError) throw fundsError;

      // Check for existing portfolio entry
      const { data: existingPortfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('coin_id', selectedCoin.coin_id)
        .single();

      const now = new Date().toISOString();
      
      if (existingPortfolio) {
        // Update existing portfolio entry
        const newAmount = existingPortfolio.amount_held + purchaseAmount;
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({
            amount_held: newAmount,
            current_price: currentPrice.toString(),
            total_value: newAmount * currentPrice,
            updated_at: now
          })
          .eq('user_id', user.id)
          .eq('coin_id', selectedCoin.coin_id);

        if (updateError) throw updateError;
      } else {
        // Create new portfolio entry
        const { error: insertError } = await supabase
          .from('portfolios')
          .insert([{
            user_id: user.id,
            coin_id: selectedCoin.coin_id,
            coin_name: selectedCoin.name,
            amount_held: purchaseAmount,
            price_bought: currentPrice.toString(),
            current_price: currentPrice.toString(),
            total_value: purchaseAmount * currentPrice,
            created_at: now,
            updated_at: now
          }]);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Purchase successful',
        description: `You bought ${amount} ${selectedCoin.symbol}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setUserFunds(prev => prev - totalCost);
      onClose();
    } catch (error) {
      // Rollback funds update if portfolio update fails
      await supabase
        .from('coin_users')
        .update({ funds: userFunds })
        .eq('user_id', user.id);

      const e = error as Error;
      toast({
        title: 'Purchase failed',
        description: e.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const totalCost = selectedCoin && amount
    ? parseFloat(selectedCoin.current_price) * parseFloat(amount)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="var(--card-bg)" color="var(--text-primary)" className="glass-card">
        <ModalHeader className="gradient-text">Buy Coins</ModalHeader>
        <ModalCloseButton color="var(--neon-cyan)" />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Select Coin</FormLabel>
              <Select
                value={selectedCoin?.coin_id || ''}
                onChange={(e) => {
                  const coin = coins.find(c => c.coin_id === parseInt(e.target.value));
                  setSelectedCoin(coin || null);
                }}
                bg="var(--card-bg)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                _hover={{ borderColor: 'var(--neon-cyan)' }}
                _focus={{ borderColor: 'var(--neon-cyan)' }}
              >
                <option value="">Select a coin</option>
                {coins.map((coin) => (
                  <option key={coin.coin_id} value={coin.coin_id} style={{ background: 'var(--card-bg)' }}>
                    {coin.name} ({coin.symbol})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to buy"
                bg="var(--card-bg)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                _hover={{ borderColor: 'var(--neon-cyan)' }}
                _focus={{ borderColor: 'var(--neon-cyan)' }}
              />
            </FormControl>

            {selectedCoin && (
              <VStack spacing={2} align="stretch" w="100%">
                <Text>Current Price: ${parseFloat(selectedCoin.current_price).toFixed(2)}</Text>
                <Text>Total Cost: ${totalCost.toFixed(2)}</Text>
                <Text>Your Funds: ${userFunds.toFixed(2)}</Text>
              </VStack>
            )}

            <Button
              onClick={handleBuy}
              isLoading={loading}
              isDisabled={!selectedCoin || !amount || totalCost > userFunds}
              width="full"
              className="neon-border"
              bg="transparent"
              color="var(--neon-cyan)"
              _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
            >
              Buy
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BuyModal;