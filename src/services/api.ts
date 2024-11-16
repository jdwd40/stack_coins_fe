import axios from 'axios';

const API_URL = 'https:jdwd40/com'; // Replace with your actual API URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data
const mockCoins = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 50000, supply: 21000000 },
  { id: '2', name: 'Ethereum', symbol: 'ETH', price: 3000, supply: 120000000 },
  { id: '3', name: 'Cardano', symbol: 'ADA', price: 1.5, supply: 45000000000 },
];

const mockPortfolio = [
  { coinId: '1', coinName: 'Bitcoin', amount: 0.5, currentValue: 25000 },
  { coinId: '2', coinName: 'Ethereum', amount: 10, currentValue: 30000 },
];

const mockUsers = [
  { email: 'user@example.com', password: 'password123' },
];

const useMockData = true; // Set to false when ready to use real API

let currentUser: string | null = null;

export const register = async (email: string, password: string) => {
  if (useMockData) {
    if (mockUsers.some(user => user.email === email)) {
      throw new Error('User already exists');
    }
    mockUsers.push({ email, password });
    return { message: 'User registered successfully' };
  }
  const response = await api.post('/api/users/register', { email, password });
  return response.data;
};

export const login = async (email: string, password: string) => {
  if (useMockData) {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      currentUser = email;
      return { user: { email } };
    }
    throw new Error('Invalid credentials');
  }
  const response = await api.post('/api/users/login', { email, password });
  currentUser = email;
  return response.data;
};

export const logout = () => {
  currentUser = null;
};

export const getCoinList = async () => {
  const response = await api.get('/api/coins');
  return response.data;
};

export const createTransaction = async (transactionData: {
  coinId: string;
  amount: number;
  type: 'buy' | 'sell';
}) => {
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  if (useMockData) {
    return { message: 'Transaction created successfully' };
  }
  const response = await api.post('/api/transactions', transactionData);
  return response.data;
};

export const getUserPortfolio = async () => {
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  if (useMockData) {
    return mockPortfolio;
  }
  const response = await api.get('/api/portfolios/user');
  return response.data;
};

export const isAuthenticated = () => {
  return currentUser !== null;
};

export default api;