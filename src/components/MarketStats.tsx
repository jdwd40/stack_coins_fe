import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface MarketStats {
  event: {
    type: string;
    start_time: string;
    end_time: string;
    time_left: number;
  } | null;
  marketValue: string;
  last5minsMarketValue: string;
  percentage5mins: string;
  last10minsMarketValue: string;
  percentage10mins: string;
  last30minsMarketValue: string;
  percentage30mins: string;
  top3Coins: Array<{
    name: string;
    price: number;
  }>;
  allTimeHigh: number;
  marketTotal: string;
}

const MarketStats: React.FC = () => {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('https://jdwd40.com/api/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching market stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="xl" color="var(--neon-cyan)" />
      </Box>
    );
  }

  if (!stats) return null;

  const getPercentageColor = (percentage: string) => {
    const value = parseFloat(percentage);
    return value >= 0 ? 'var(--neon-cyan)' : '#ff4d4d';
  };

  const formatPercentage = (percentage: string) => {
    const value = parseFloat(percentage);
    const icon = value >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
    const color = getPercentageColor(percentage);
    return (
      <HStack spacing={1} color={color}>
        {icon}
        <Text>{percentage}</Text>
      </HStack>
    );
  };

  const renderMarketEvent = () => {
    if (!stats.event || !stats.event.type || !stats.event.time_left) {
      return (
        <VStack align="stretch" spacing={3}>
          <HStack>
            <AlertCircle className="text-[var(--neon-cyan)]" size={20} />
            <Text className="gradient-text" fontSize="lg" fontWeight="bold">
              Market Event
            </Text>
          </HStack>
          <Text color="var(--text-primary)" textAlign="center">
            No Active Market Event
          </Text>
        </VStack>
      );
    }

    return (
      <VStack align="stretch" spacing={3}>
        <HStack>
          <AlertCircle className="text-[var(--neon-cyan)]" size={20} />
          <Text className="gradient-text" fontSize="lg" fontWeight="bold">
            Market Event
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Badge
            bg={stats.event.type === 'bull' ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255, 77, 77, 0.2)'}
            color={stats.event.type === 'bull' ? 'var(--neon-cyan)' : '#ff4d4d'}
            px={3}
            py={1}
            rounded="md"
            fontSize="sm"
          >
            {stats.event.type.toUpperCase()}
          </Badge>
          <HStack color="var(--text-primary)">
            <Clock size={16} className="text-[var(--neon-cyan)]" />
            <Text>{Math.round(stats.event.time_left)}m left</Text>
          </HStack>
        </HStack>
        <Progress
          value={(stats.event.time_left / 20) * 100}
          bg="rgba(255, 255, 255, 0.1)"
          sx={{
            '& > div': {
              background: stats.event.type === 'bull' 
                ? 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))'
                : 'linear-gradient(90deg, #ff4d4d, #ff8080)'
            }
          }}
          size="sm"
          rounded="full"
        />
      </VStack>
    );
  };

  return (
    <Box className="glass-card" px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }} mb={8}>
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={{ base: 4, md: 6 }}
      >
        {/* Market Event */}
        <Box className="glass-card" px={4} py={{ base: 3, md: 4 }} rounded="lg">
          {renderMarketEvent()}
        </Box>

        {/* Market Values */}
        <Box className="glass-card" px={4} py={{ base: 3, md: 4 }} rounded="lg">
          <VStack align="stretch" spacing={3}>
            <Text className="gradient-text" fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              Market Values
            </Text>
            <HStack justify="space-between" color="var(--text-primary)">
              <Text>Current Value:</Text>
              <Text className="text-[var(--neon-cyan)]">
                £{parseFloat(stats.marketValue).toFixed(2)}
              </Text>
            </HStack>
            <HStack justify="space-between" color="var(--text-primary)">
              <Text>5m Change:</Text>
              {formatPercentage(stats.percentage5mins)}
            </HStack>
            <HStack justify="space-between" color="var(--text-primary)">
              <Text>30m Change:</Text>
              {formatPercentage(stats.percentage30mins)}
            </HStack>
          </VStack>
        </Box>

        {/* Top Coins */}
        <Box className="glass-card" px={4} py={{ base: 3, md: 4 }} rounded="lg">
          <VStack align="stretch" spacing={3}>
            <Text className="gradient-text" fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              Top Performers
            </Text>
            {stats.top3Coins.slice(0, 3).map((coin, index) => (
              <HStack key={coin.name} justify="space-between" color="var(--text-primary)">
                <HStack>
                  <Text className="text-[var(--neon-cyan)]">#{index + 1}</Text>
                  <Text>{coin.name}</Text>
                </HStack>
                <Text className="text-[var(--neon-cyan)]">
                  £{coin.price.toFixed(2)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
};

export default MarketStats;