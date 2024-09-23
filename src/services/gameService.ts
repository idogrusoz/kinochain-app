import axios from 'axios';
import { Game } from '../../types';
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://kinochain-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});



export const startNewGame = async () => {
  try {
    const response = await api.post<Game>('/create-game?level=1'); //TODO add code to get the level from the user
    return response.data;
  } catch (error) {
    throw error;
  }
};
