import React, { useState, useEffect } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Select, Button, useToast } from '@chakra-ui/react';
import { getCoinList, createTransaction } from '../services/api';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
}

const BuySell: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('buy');
  const toast = useToast();

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await getCoinList();
        setCoins(data);
      } catch (error) {
        console.error('Error fetching coins:', error);
      }
    };

    fetchCoins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        coinId: selectedCoin,
        amount: parseFloat(amount),
        type: transactionType,
      });
      toast({
        title: 'Transaction successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedCoin('');
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
      toast({
        title: 'Transaction failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="500px" margin="0 auto" mt={8}>
      <Heading mb={6}>Buy/Sell Coins</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Coin</FormLabel>
          <Select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} required>
            <option value="">Select a coin</option>
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Amount</FormLabel>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Transaction Type</FormLabel>
          <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </Select>
        </FormControl>
        <Button type="submit" colorScheme="blue" width="full">
          Submit Transaction
        </Button>
      </form>
    </Box>
  );
};

export default BuySell;