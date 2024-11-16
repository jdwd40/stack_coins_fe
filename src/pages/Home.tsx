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
  Alert,
  AlertIcon,
  HStack,
  TableContainer,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import CoinModal from '../components/CoinModal';
import MarketStats from '../components/MarketStats';

interface Coin {
  coin_id: number;
  name: string;
  symbol: string;
  current_price: string;
  supply: string;
  market_cap: string;
  date_added: string;
  description: string;
}

type SortField = 'name' | 'symbol' | 'current_price' | 'supply' | 'market_cap' | 'date_added';
type SortDirection = 'asc' | 'desc';

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('market_cap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchCoins = async () => {
    try {
      const response = await axios.get('https://jdwd40.com/api/coins');
      setCoins(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch coins. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCoins = [...coins].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
      case 'symbol':
        comparison = a[sortField].localeCompare(b[sortField]);
        break;
      case 'current_price':
      case 'market_cap':
      case 'supply':
        comparison = parseFloat(a[sortField]) - parseFloat(b[sortField]);
        break;
      case 'date_added':
        comparison = new Date(a.date_added).getTime() - new Date(b.date_added).getTime();
        break;
      default:
        comparison = 0;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" color="var(--neon-cyan)" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={10} bg="rgba(254, 178, 178, 0.1)" color="var(--text-primary)">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUpIcon ml={1} color="var(--neon-cyan)" />
    ) : (
      <ArrowDownIcon ml={1} color="var(--neon-cyan)" />
    );
  };

  return (
    <Box>
      <MarketStats />
      
      <Box className="glass-card" px={{ base: 2, md: 6 }} py={{ base: 4, md: 6 }} rounded="xl">
        <Heading mb={6} className="gradient-text" fontSize={{ base: 'xl', md: '2xl' }}>
          Available Coins
        </Heading>
        <TableContainer>
          <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
            <Thead>
              <Tr>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'symbol', label: 'Symbol' },
                  { key: 'current_price', label: 'Price' },
                  { key: 'supply', label: 'Supply', hideOnMobile: true },
                  { key: 'market_cap', label: 'Market Cap', hideOnMobile: true },
                  { key: 'date_added', label: 'Date Added', hideOnMobile: true },
                ].map(({ key, label, hideOnMobile }) => !hideOnMobile || window.innerWidth > 768 ? (
                  <Th
                    key={key}
                    color="var(--neon-cyan)"
                    cursor="pointer"
                    onClick={() => handleSort(key as SortField)}
                    _hover={{ opacity: 0.8 }}
                    display={{ base: hideOnMobile ? 'none' : 'table-cell', md: 'table-cell' }}
                  >
                    <HStack spacing={1} display="inline-flex">
                      <span>{label}</span>
                      <SortIcon field={key as SortField} />
                    </HStack>
                  </Th>
                ) : null)}
              </Tr>
            </Thead>
            <Tbody>
              {sortedCoins.map((coin) => (
                <Tr
                  key={coin.coin_id}
                  _hover={{ bg: 'rgba(0, 245, 212, 0.05)', cursor: 'pointer' }}
                  onClick={() => setSelectedCoin(coin.coin_id)}
                >
                  <Td color="var(--text-primary)">{coin.name}</Td>
                  <Td color="var(--text-primary)">{coin.symbol}</Td>
                  <Td color="var(--text-primary)" isNumeric>£{parseFloat(coin.current_price).toFixed(2)}</Td>
                  <Td color="var(--text-primary)" isNumeric display={{ base: 'none', md: 'table-cell' }}>
                    {parseInt(coin.supply).toLocaleString()}
                  </Td>
                  <Td color="var(--text-primary)" isNumeric display={{ base: 'none', md: 'table-cell' }}>
                    £{parseInt(coin.market_cap).toLocaleString()}
                  </Td>
                  <Td color="var(--text-primary)" display={{ base: 'none', md: 'table-cell' }}>
                    {new Date(coin.date_added).toLocaleDateString()}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <CoinModal
          isOpen={selectedCoin !== null}
          onClose={() => setSelectedCoin(null)}
          coinId={selectedCoin || 0}
        />
      </Box>
    </Box>
  );
};

export default Home;