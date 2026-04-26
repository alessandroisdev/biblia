export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8084/api/v1';

export interface Verse {
  id: string;
  chapter_id: number;
  number: number;
  text: string;
}

export const searchVerses = async (query: string): Promise<Verse[]> => {
  if (!query) return [];
  const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar versículos');
  }
  
  return await response.json();
};
