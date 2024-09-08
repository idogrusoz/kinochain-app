import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://kinochain-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});



export const startNewGame = async () => {
  try {
    const response = await api.post('/create-game');
    return response.data;
  } catch (error) {
    throw error;
  }
};
