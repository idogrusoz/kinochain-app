import axios from 'axios';
import { ActorModel, Game, MovieDetailsModel } from '../../types';
import { api } from './apiService';

export const startNewGame = async () => {
  try {
    const response = await api.post<Game>('/create-game?level=1'); //TODO add code to get the level from the user
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserData = async (token: string) => {
  try {
    const response = await api.post('/user', { token });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchMovieDetails = async (movieId: number): Promise<MovieDetailsModel> => {
  const response = await api.get(`/movies/${movieId}`);
  return response.data;
};

export const fetchActorDetails = async (actorId: number): Promise<ActorModel> => {
  const response = await api.get(`/actors/${actorId}`);
  return response.data;
};
