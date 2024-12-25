import axios from 'axios';
import { ActorModel, MovieDetailsModel } from '../../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

