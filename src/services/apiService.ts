import axios from 'axios';

const API_BASE_URL = 'https://your-api-base-url.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});


export const getUserData = async (token: string) => {
    try {
      const response = await api.post('/user', { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  };