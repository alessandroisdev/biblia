import { useState, useEffect } from 'react';
import { useBible } from '../hooks/useBible';
import { type Book, type Chapter, type Version } from '../api/client';
import { ChevronDown, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';

export function BibleReader() {
  const { versions, books, chapters, verses, loading, fetchBooks, fetchChapters, fetchVerses } = useBible();
  
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Initialize defaults
  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0]);
    }
  }, [versions]);

  useEffect(() => {
    if (selectedVersion) {
      fetchBooks(selectedVersion.id);
    }
  }, [selectedVersion]);

  useEffect(() => {
    if (books.length > 0) {
      setSelectedBook(books[0]);
    } else {
      setSelectedBook(null);
    }
  }, [books]);

  useEffect(() => {
    if (selectedBook) {
      fetchChapters(selectedBook.id);
    }
  }, [selectedBook]);

  useEffect(() => {
    if (chapters.length > 0) {
      setSelectedChapter(chapters[0]);
    } else {
      setSelectedChapter(null);
    }
  }, [chapters]);

  useEffect(() => {
    if (selectedChapter) {
      fetchVerses(selectedChapter.id);
    }
  }, [selectedChapter]);

  // Paginação Lógica
  const chapterIdx = selectedChapter ? chapters.findIndex(c => c.id === selectedChapter.id) : -1;
  const bookIdx = selectedBook ? books.findIndex(b => b.id === selectedBook.id) : -1;

  const canGoPrevChapter = chapterIdx > 0;
  const canGoNextChapter = chapterIdx >= 0 && chapterIdx < chapters.length - 1;
  const canGoPrevBook = bookIdx > 0;
  const canGoNextBook = bookIdx >= 0 && bookIdx < books.length - 1;

  const handlePrevChapter = () => canGoPrevChapter && setSelectedChapter(chapters[chapterIdx - 1]);
  const handleNextChapter = () => canGoNextChapter && setSelectedChapter(chapters[chapterIdx + 1]);
  const handlePrevBook = () => canGoPrevBook && setSelectedBook(books[bookIdx - 1]);
  const handleNextBook = () => canGoNextBook && setSelectedBook(books[bookIdx + 1]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Navbar de Seleção */}
      <header className="bg-gray-50 dark:bg-gray-950 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 items-center">
        
        {/* Seletor de Versão */}
        <div className="relative">
          <select 
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium"
            value={selectedVersion?.id || ''}
            onChange={(e) => {
              const v = versions.find(v => v.id === Number(e.target.value));
              if (v) setSelectedVersion(v);
            }}
          >
            {versions.map(v => (
              <option key={v.id} value={v.id}>{v.abbreviation} - {v.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Seletor de Livro */}
        <div className="relative">
          <select 
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium min-w-[160px]"
            value={selectedBook?.id || ''}
            onChange={(e) => {
              const b = books.find(b => b.id === Number(e.target.value));
              if (b) setSelectedBook(b);
            }}
          >
            <option value="" disabled>Selecione o Livro</option>
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Seletor de Capítulo */}
        <div className="relative">
          <select 
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium min-w-[80px]"
            value={selectedChapter?.id || ''}
            onChange={(e) => {
              const c = chapters.find(c => c.id === Number(e.target.value));
              if (c) setSelectedChapter(c);
            }}
          >
            <option value="" disabled>Cap.</option>
            {chapters.map(c => (
              <option key={c.id} value={c.id}>{c.number}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>

        {loading && <Loader2 className="animate-spin text-primary ml-auto" size={24} />}
      </header>

      {/* Área de Leitura */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16">
        <div className="max-w-3xl mx-auto">
          {selectedBook && selectedChapter && (
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-10 text-center">
              {selectedBook.name} {selectedChapter.number}
            </h1>
          )}

          <div className="space-y-4 font-serif text-xl leading-loose text-gray-800 dark:text-gray-300">
            {verses.map((verse) => (
              <p key={verse.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors cursor-text group">
                <sup className="text-primary font-bold mr-3 text-sm select-none opacity-70 group-hover:opacity-100 transition-opacity">
                  {verse.number}
                </sup>
                <span dangerouslySetInnerHTML={{ __html: verse.text }} />
              </p>
            ))}
            
            {!loading && verses.length === 0 && (
              <div className="text-center text-gray-500 italic mt-20">
                Nenhum versículo encontrado. Selecione um capítulo válido.
              </div>
            )}
          </div>

          {/* Paginação */}
          {selectedBook && selectedChapter && verses.length > 0 && (
            <div className="flex flex-wrap items-center justify-between mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevBook}
                  disabled={!canGoPrevBook}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Livro Anterior"
                >
                  <ChevronsLeft size={18} /> Livro
                </button>
                <button 
                  onClick={handlePrevChapter}
                  disabled={!canGoPrevChapter}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} /> Capítulo Anterior
                </button>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleNextChapter}
                  disabled={!canGoNextChapter}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próximo Capítulo <ChevronRight size={18} />
                </button>
                <button 
                  onClick={handleNextBook}
                  disabled={!canGoNextBook}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Próximo Livro"
                >
                  Livro <ChevronsRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
