import { useState, useEffect } from 'react';
import { apiClient, type Version, type Book, type Chapter, type Verse } from '../api/client';

export function useBible() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load versions on mount
  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Version[]>('/versions');
      setVersions(res.data);
    } catch (err) {
      setError('Erro ao carregar versões.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async (versionId?: number) => {
    try {
      setLoading(true);
      const res = await apiClient.get<Book[]>('/books' + (versionId ? `?version_id=${versionId}` : ''));
      setBooks(res.data);
    } catch (err) {
      setError('Erro ao carregar livros.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (bookId: number) => {
    try {
      setLoading(true);
      const res = await apiClient.get<Chapter[]>(`/chapters/${bookId}`);
      setChapters(res.data);
    } catch (err) {
      setError('Erro ao carregar capítulos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerses = async (chapterId: number) => {
    try {
      setLoading(true);
      const res = await apiClient.get<Verse[]>(`/verses/${chapterId}`);
      setVerses(res.data);
    } catch (err) {
      setError('Erro ao carregar versículos.');
    } finally {
      setLoading(false);
    }
  };

  const searchVerses = async (query: string) => {
    try {
      setLoading(true);
      // O backend já faz o MATCH AGAINST (FTS) nativo no MariaDB
      const res = await apiClient.get<Verse[]>(`/search?q=${encodeURIComponent(query)}`);
      setVerses(res.data); // Reaproveitamos o estado 'verses' para exibir os resultados
    } catch (err) {
      setError('Erro na pesquisa.');
    } finally {
      setLoading(false);
    }
  };

  return {
    versions, books, chapters, verses,
    loading, error,
    fetchBooks, fetchChapters, fetchVerses, searchVerses
  };
}
