export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8084/api/v1';

export interface Version {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Book {
  id: number;
  version_id: number;
  name: string;
  abbreviation: string;
  testament: 'OT' | 'NT';
}

export interface Chapter {
  id: number;
  book_id: number;
  number: number;
}

export interface Verse {
  id: string;
  chapter_id: number;
  number: number;
  text: string;
}

const fetchJSON = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar dados de ${url}`);
  }
  return response.json();
};

export const searchVerses = async (query: string): Promise<Verse[]> => {
  if (!query) return [];
  return fetchJSON<Verse[]>(`${API_URL}/search?q=${encodeURIComponent(query)}`);
};

export const getVersions = async (): Promise<Version[]> => {
  return fetchJSON<Version[]>(`${API_URL}/versions`);
};

export const getBooks = async (versionId?: number): Promise<Book[]> => {
  const url = versionId ? `${API_URL}/books?version_id=${versionId}` : `${API_URL}/books`;
  return fetchJSON<Book[]>(url);
};

export const getChapters = async (bookId: number): Promise<Chapter[]> => {
  return fetchJSON<Chapter[]>(`${API_URL}/chapters/${bookId}`);
};

export const getChapterVerses = async (chapterId: number): Promise<Verse[]> => {
  return fetchJSON<Verse[]>(`${API_URL}/verses/${chapterId}`);
};
