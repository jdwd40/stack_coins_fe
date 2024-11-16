import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SellModal from '../components/SellModal';

interface PortfolioItem {
  coin_id: number;
  coin_name: string;
  amount_held: number;
  price_bought: string;
  current_price: string;
  total_value: number;
}

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFunds, setUserFunds] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;
      
      try {
        const [portfolioResponse, fundsResponse] = await Promise.all([
          supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', user.id),
          supabase
            .from('coin_users')
            .select('funds')
            .eq('user_id', user.id)
            .single()
        ]);

        if (portfolioResponse.error) throw portfolioResponse.error;
        if (fundsResponse.error) throw fundsResponse.error;

        setPortfolio(portfolioResponse.data || []);
        setUserFunds(fundsResponse.data.funds);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [user]);

  const totalPortfolioValue = portfolio.reduce(
    (sum, item) => sum + parseFloat(item.current_price) * item.amount_held,
    0
  );

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" color="var(--neon-cyan)" />
      </Box>
    );
  }

  return (
    <Box className="glass-card p-6 rounded-xl">
      <VStack spacing={6} align="stretch">
        <Heading className="gradient-text">Your Portfolio</Heading>
        
        <Box className="glass-card p-4 rounded-lg" color="var(--text-primary)">
          <VStack spacing={2} align="stretch">
            <Text fontSize="lg">Available Funds: <span className="text-[var(--neon-cyan)]">${userFunds.toFixed(2)}</span></Text>
            <Text fontSize="lg">Portfolio Value: <span className="text-[var(--neon-cyan)]">${totalPortfolioValue.toFixed(2)}</span></Text>
            <Text fontSize="lg">Total Assets: <span className="text-[var(--neon-cyan)]">${(userFunds + totalPortfolioValue).toFixed(2)}</span></Text>
          </VStack>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="var(--neon-cyan)">Coin</Th>
                <Th color="var(--neon-cyan)" isNumeric>Amount</Th>
                <Th color="var(--neon-cyan)" isNumeric>Bought At</Th>
                <Th color="var(--neon-cyan)" isNumeric>Current Price</Th>
                <Th color="var(--neon-cyan)" isNumeric>Total Value</Th>
                <Th color="var(--neon-cyan)" isNumeric>Profit/Loss</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {portfolio.map((item) => {
                const profitLoss = (
                  (parseFloat(item.current_price) - parseFloat(item.price_bought)) *
                  item.amount_held
                );
                const profitLossPercentage = (
                  ((parseFloat(item.current_price) - parseFloat(item.price_bought)) /
                    parseFloat(item.price_bought)) *
                  100
                );

                return (
                  <Tr key={item.coin_id}>
                    <Td color="var(--text-primary)">{item.coin_name}</Td>
                    <Td color="var(--text-primary)" isNumeric>{item.amount_held.toFixed(4)}</Td>
                    <Td color="var(--text-primary)" isNumeric>${parseFloat(item.price_bought).toFixed(2)}</Td>
                    <Td color="var(--text-primary)" isNumeric>${parseFloat(item.current_price).toFixed(2)}</Td>
                    <Td color="var(--text-primary)" isNumeric>${item.total_value.toFixed(2)}</Td>
                    <Td color={profitLoss >= 0 ? 'green.400' : 'red.400'} isNumeric>
                      ${profitLoss.toFixed(2)}
                      <br />
                      ({profitLossPercentage.toFixed(2)}%)
                    </Td>
                    <Td>
                      <Button
                        onClick={() => setSelectedItem(item)}
                        size="sm"
                        className="neon-border"
                        bg="transparent"
                        color="var(--neon-cyan)"
                        _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
                      >
                        Sell
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {selectedItem && (
        <SellModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          portfolio={selectedItem}
        />
      )}
    </Box>
  );
};

export default Portfolio;