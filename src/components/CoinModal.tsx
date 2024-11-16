import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  Box,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Grid,
  Badge,
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import axios from 'axios';
import BuyModal from './BuyModal';

interface CoinDetails {
  coin_id: number;
  name: string;
  symbol: string;
  current_price: string;
  supply: string;
  market_cap: string;
  date_added: string;
  description: string;
  allTimeHigh: string;
  last5minsValue: string;
  percentage5mins: string;
  last10minsValue: string;
  percentage10mins: string;
  last30minsValue: string;
  percentage30mins: string;
  eventDuration: string;
  eventType: string;
  coinEventPositive: boolean;
  eventImpact: string;
}

interface PriceHistory {
  history_id: number;
  coin_id: number;
  price: string;
  timestamp: string;
}

interface CoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinId: number;
}

const CoinModal: React.FC<CoinModalProps> = ({ isOpen, onClose, coinId }) => {
  const [details, setDetails] = useState<CoinDetails | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !coinId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [detailsRes, historyRes] = await Promise.all([
          axios.get(`https://jdwd40.com/api/coins/${coinId}`),
          axios.get(`https://jdwd40.com/api/history/${coinId}`)
        ]);
        
        if (detailsRes.data && historyRes.data) {
          setDetails(detailsRes.data);
          setHistory(historyRes.data);
        } else {
          throw new Error('Invalid data received from server');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch coin data';
        setError(errorMessage);
        console.error('Error fetching coin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coinId, isOpen]);

  const handleBuyClick = () => {
    onClose();
    setShowBuyModal(true);
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (err) {
      return timestamp;
    }
  };

  const getPercentageColor = (percentage: string) => {
    const value = parseFloat(percentage);
    return value >= 0 ? 'var(--neon-cyan)' : '#ff4d4d';
  };

  const PercentageChange = ({ value }: { value: string }) => {
    const numValue = parseFloat(value);
    const Icon = numValue >= 0 ? TrendingUp : TrendingDown;
    const color = getPercentageColor(value);
    
    return (
      <HStack color={color}>
        <Icon size={16} />
        <Text>{value}</Text>
      </HStack>
    );
  };

  // Calculate min and max values for the chart
  const priceValues = history.map(h => parseFloat(h.price));
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const padding = (maxPrice - minPrice) * 0.1; // Add 10% padding

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="var(--card-bg)" color="var(--text-primary)" className="glass-card">
          <ModalHeader className="gradient-text">
            {details ? `${details.name} (${details.symbol})` : 'Coin Details'}
          </ModalHeader>
          <ModalCloseButton color="var(--neon-cyan)" />
          <ModalBody pb={6}>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="var(--neon-cyan)" />
              </Box>
            ) : error ? (
              <Alert status="error" variant="subtle" bg="rgba(254, 178, 178, 0.1)" color="var(--text-primary)">
                <AlertIcon />
                {error}
              </Alert>
            ) : details && (
              <VStack spacing={6} align="stretch">
                {/* Event Information */}
                <Box className="glass-card p-4 rounded-lg">
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <AlertCircle className="text-[var(--neon-cyan)]" size={20} />
                      <Text className="gradient-text" fontSize="lg">Active Event</Text>
                    </HStack>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <VStack align="stretch">
                        <Text color="var(--text-primary)">Type:</Text>
                        <Badge
                          bg={details.coinEventPositive ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255, 77, 77, 0.2)'}
                          color={details.coinEventPositive ? 'var(--neon-cyan)' : '#ff4d4d'}
                          p={2}
                          rounded="md"
                        >
                          {details.eventType}
                        </Badge>
                      </VStack>
                      <VStack align="stretch">
                        <Text color="var(--text-primary)">Impact:</Text>
                        <Badge
                          bg="rgba(0, 245, 212, 0.2)"
                          color="var(--neon-cyan)"
                          p={2}
                          rounded="md"
                        >
                          {details.eventImpact.toUpperCase()}
                        </Badge>
                      </VStack>
                      <Text color="var(--text-primary)">Duration: {details.eventDuration}</Text>
                    </Grid>
                  </VStack>
                </Box>

                {/* Price Chart */}
                <Box>
                  <Text fontSize="lg" mb={2} color="var(--text-primary)">Price History</Text>
                  <Box height="300px" className="glass-card p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={formatDate}
                          stroke="var(--text-primary)"
                          tick={{ fill: 'var(--text-primary)' }}
                        />
                        <YAxis
                          stroke="var(--text-primary)"
                          tick={{ fill: 'var(--text-primary)' }}
                          domain={[minPrice - padding, maxPrice + padding]}
                          tickFormatter={(value) => `£${value.toFixed(2)}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            border: '1px solid var(--neon-cyan)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                          }}
                          labelStyle={{ color: 'var(--text-primary)' }}
                          formatter={(value: string) => [`£${parseFloat(value).toFixed(2)}`, 'Price']}
                          labelFormatter={(label) => formatDate(label.toString())}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="var(--neon-cyan)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: 'var(--neon-cyan)' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                {/* Price Statistics */}
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box className="glass-card p-4 rounded-lg">
                    <VStack align="stretch" spacing={3}>
                      <Text className="gradient-text">Price Info</Text>
                      <HStack justify="space-between">
                        <Text>Current:</Text>
                        <Text className="text-[var(--neon-cyan)]">
                          £{parseFloat(details.current_price).toFixed(2)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>All-Time High:</Text>
                        <Text className="text-[var(--neon-cyan)]">
                          £{parseFloat(details.allTimeHigh).toFixed(2)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box className="glass-card p-4 rounded-lg">
                    <VStack align="stretch" spacing={3}>
                      <Text className="gradient-text">Price Changes</Text>
                      <HStack justify="space-between">
                        <Text>5m:</Text>
                        <PercentageChange value={details.percentage5mins} />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>30m:</Text>
                        <PercentageChange value={details.percentage30mins} />
                      </HStack>
                    </VStack>
                  </Box>
                </Grid>

                {/* Market Info */}
                <Box className="glass-card p-4 rounded-lg">
                  <VStack align="stretch" spacing={3}>
                    <Text className="gradient-text">Market Info</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <HStack justify="space-between">
                        <Text>Supply:</Text>
                        <Text>{parseInt(details.supply).toLocaleString()}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Market Cap:</Text>
                        <Text>£{parseInt(details.market_cap).toLocaleString()}</Text>
                      </HStack>
                    </Grid>
                    <Text fontSize="sm" opacity={0.8}>{details.description}</Text>
                  </VStack>
                </Box>

                <Button
                  onClick={handleBuyClick}
                  className="neon-border"
                  bg="transparent"
                  color="var(--neon-cyan)"
                  _hover={{ bg: 'rgba(0, 245, 212, 0.1)' }}
                  mt={4}
                >
                  Buy {details.symbol}
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <BuyModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        selectedCoinId={coinId}
      />
    </>
  );
};

export default CoinModal;