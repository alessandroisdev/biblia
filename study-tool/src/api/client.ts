import axios from 'axios';

// Usamos a porta 8084 que mapeamos no docker-compose para o backend Laravel
const API_URL = 'http://localhost:8084/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface Version {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Book {
  id: number;
  name: string;
  abbreviation: string;
  testament: string;
  version_id: number;
}

export interface Chapter {
  id: string;
  number: number;
  book_id: number;
}

export interface Verse {
  id: string;
  number: number;
  text: string;
  chapter_id: string;
}
