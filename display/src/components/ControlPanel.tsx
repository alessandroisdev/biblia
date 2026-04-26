import { useState, useEffect, useMemo } from 'react';
import { useBible } from '../hooks/useBible';
import { type Book, type Chapter, type Version, type Verse } from '../api/client';
import { ChevronDown, Loader2, MonitorPlay } from 'lucide-react';

export function ControlPanel() {
  const { versions, books, chapters, verses, loading, fetchBooks, fetchChapters, fetchVerses } = useBible();
  
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeVerseId, setActiveVerseId] = useState<string | null>(null);

  const channel = useMemo(() => new BroadcastChannel('bible_projector'), []);

  // Initialize defaults
  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) setSelectedVersion(versions[0]);
  }, [versions]);

  useEffect(() => {
    if (selectedVersion) fetchBooks(selectedVersion.id);
  }, [selectedVersion]);

  useEffect(() => {
    if (books.length > 0) setSelectedBook(books[0]);
    else setSelectedBook(null);
  }, [books]);

  useEffect(() => {
    if (selectedBook) fetchChapters(selectedBook.id);
  }, [selectedBook]);

  useEffect(() => {
    if (chapters.length > 0) setSelectedChapter(chapters[0]);
    else setSelectedChapter(null);
  }, [chapters]);

  useEffect(() => {
    if (selectedChapter) {
      fetchVerses(selectedChapter.id);
      setActiveVerseId(null);
    }
  }, [selectedChapter]);

  const handleProjectVerse = (verse: Verse) => {
    setActiveVerseId(verse.id);
    if (!selectedBook || !selectedChapter || !selectedVersion) return;
    
    channel.postMessage({
      type: 'DISPLAY_VERSE',
      payload: {
        text: verse.text,
        reference: `${selectedBook.name} ${selectedChapter.number}:${verse.number}`,
        version: selectedVersion.abbreviation
      }
    });
  };

  const handleClearScreen = () => {
    setActiveVerseId(null);
    channel.postMessage({ type: 'CLEAR_SCREEN' });
  };

  const handleOpenProjector = () => {
    window.open('/screen', 'ProjectorWindow', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950 font-sans">
      
      {/* Top Navbar */}
      <header className="bg-dark text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <MonitorPlay className="text-primary" size={28} />
          <h1 className="text-xl font-bold">Painel de Projeção</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleClearScreen}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Limpar Telão
          </button>
          <button 
            onClick={handleOpenProjector}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Abrir Janela do Projetor
          </button>
        </div>
      </header>

      {/* Control Area */}
      <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full">
        
        {/* Selectors */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 items-center mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Versão</label>
            <select 
              className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-3 pr-8 rounded focus:ring-primary"
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
            <ChevronDown size={16} className="absolute right-2 bottom-3 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Livro</label>
            <select 
              className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-3 pr-8 rounded focus:ring-primary"
              value={selectedBook?.id || ''}
              onChange={(e) => {
                const b = books.find(b => b.id === Number(e.target.value));
                if (b) setSelectedBook(b);
              }}
            >
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-2 bottom-3 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative w-24">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Capítulo</label>
            <select 
              className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-3 pr-8 rounded focus:ring-primary"
              value={selectedChapter?.id || ''}
              onChange={(e) => {
                const c = chapters.find(c => c.id === Number(e.target.value));
                if (c) setSelectedChapter(c);
              }}
            >
              {chapters.map(c => (
                <option key={c.id} value={c.id}>{c.number}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-2 bottom-3 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Verses Grid */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-bold text-gray-700 dark:text-gray-200">
              {selectedBook?.name} {selectedChapter?.number}
            </h2>
            {loading && <Loader2 className="animate-spin text-primary" size={20} />}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {verses.map(verse => (
                <div 
                  key={verse.id}
                  onClick={() => handleProjectVerse(verse)}
                  className={`p-4 rounded-lg cursor-pointer border transition-all ${
                    activeVerseId === verse.id 
                      ? 'bg-primary/10 border-primary shadow-inner' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className={`font-bold text-lg ${activeVerseId === verse.id ? 'text-primary' : 'text-gray-400'}`}>
                      {verse.number}
                    </span>
                    <span 
                      className="text-gray-800 dark:text-gray-200"
                      dangerouslySetInnerHTML={{ __html: verse.text }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
