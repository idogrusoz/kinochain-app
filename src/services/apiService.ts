import axios from 'axios';
import { ActorModel, MovieDetailsModel } from '../../types';

const API_BASE_URL = 'https://your-api-base-url.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});


