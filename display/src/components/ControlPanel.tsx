import { useState, useEffect, useMemo } from 'react';
import { useBible } from '../hooks/useBible';
import { type Book, type Chapter, type Version, type Verse } from '../api/client';
import { ChevronDown, Loader2, MonitorPlay, BookOpen, Music, Image as ImageIcon, MessageSquareWarning } from 'lucide-react';
import axios from 'axios';

export function ControlPanel() {
  const { versions, books, chapters, verses, loading, fetchBooks, fetchChapters, fetchVerses } = useBible();
  
  const [activeTab, setActiveTab] = useState<'bible' | 'lyrics' | 'media' | 'marquee'>('bible');
  const channel = useMemo(() => new BroadcastChannel('bible_projector'), []);

  // --- BIBLE STATE ---
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeVerseId, setActiveVerseId] = useState<string | null>(null);

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
    setActiveLyricsIndex(null);
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

  // --- LYRICS STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingSuggest, setIsSearchingSuggest] = useState(false);

  const [songSlides, setSongSlides] = useState<string[]>([]);
  const [isSearchingSong, setIsSearchingSong] = useState(false);
  const [activeLyricsIndex, setActiveLyricsIndex] = useState<number | null>(null);

  // --- LIBRARY STATE ---
  const [librarySongs, setLibrarySongs] = useState<any[]>([]);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get('http://localhost:8084/api/v1/songs');
      setLibrarySongs(res.data);
    } catch (e) {
      console.error('Erro ao carregar biblioteca', e);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const buildSlides = (lyrics: string) => {
    const raw = lyrics.replace(/\r\n/g, '\n');
    const lines = raw.split('\n').filter((l: string) => l.trim() !== '');
    
    const slides = [];
    let currentSlide = [];
    for (let i = 0; i < lines.length; i++) {
      currentSlide.push(lines[i]);
      if (currentSlide.length === 4 || i === lines.length - 1) { 
        slides.push(currentSlide.join('<br/>'));
        currentSlide = [];
      }
    }
    setSongSlides(slides);
    setActiveLyricsIndex(null);
  };

  // Debounce para sugestões
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearchingSuggest(true);
        try {
          const res = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(searchQuery)}`);
          if (res.data && res.data.data) {
            // Filtrar duplicados por nome+artista
            const unique = res.data.data.filter((v:any,i:number,a:any[])=>a.findIndex(v2=>(v2.title===v.title && v2.artist.name===v.artist.name))===i);
            setSuggestions(unique.slice(0, 5));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearchingSuggest(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSong = async (artistName: string, songTitle: string) => {
    setIsSearchingSong(true);
    setSuggestions([]);
    try {
      // Usando nosso backend Laravel como Proxy Cache!
      const res = await axios.post(`http://localhost:8084/api/v1/songs/fetch`, {
        artist: artistName,
        title: songTitle
      });

      if (res.data && res.data.data && res.data.data.lyrics) {
        buildSlides(res.data.data.lyrics);
        fetchLibrary(); // Atualiza a biblioteca para incluir a nova música
      }
    } catch (err) {
      alert('Erro ao buscar letra. Verifique o nome do artista e música.');
    } finally {
      setIsSearchingSong(false);
    }
  };

  const handleProjectLyrics = (slideText: string, index: number) => {
    setActiveLyricsIndex(index);
    setActiveVerseId(null);
    channel.postMessage({
      type: 'DISPLAY_LYRICS',
      payload: { text: slideText }
    });
  };

  // --- MEDIA STATE ---
  const [bgType, setBgType] = useState<'color' | 'image' | 'video'>('color');
  const [bgColor, setBgColor] = useState('#000000');
  const [bgUrl, setBgUrl] = useState('');

  const applyBackground = () => {
    channel.postMessage({
      type: 'SET_BACKGROUND',
      payload: { type: bgType, color: bgColor, url: bgUrl }
    });
  };

  // --- MARQUEE STATE ---
  const [marqueeText, setMarqueeText] = useState('');
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);

  const toggleMarquee = () => {
    const newState = !isMarqueeActive;
    setIsMarqueeActive(newState);
    channel.postMessage({
      type: 'SET_MARQUEE',
      payload: { text: marqueeText, show: newState }
    });
  };

  // --- GLOBAL CONTROLS ---
  const handleClearText = () => {
    setActiveVerseId(null);
    setActiveLyricsIndex(null);
    channel.postMessage({ type: 'CLEAR_TEXT' });
  };

  const handleBlackout = () => {
    setActiveVerseId(null);
    setActiveLyricsIndex(null);
    setIsMarqueeActive(false);
    channel.postMessage({ type: 'CLEAR_SCREEN' });
  };

  const handleOpenProjector = () => {
    window.open('/screen', 'ProjectorWindow', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950 font-sans">
      
      {/* Top Navbar */}
      <header className="bg-dark text-white px-6 py-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-3">
          <MonitorPlay className="text-primary" size={28} />
          <h1 className="text-xl font-bold">Painel de Controle</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleClearText}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Limpar Texto
          </button>
          <button 
            onClick={handleBlackout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Blackout Total
          </button>
          <button 
            onClick={handleOpenProjector}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm ml-4"
          >
            Abrir Projetor
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Tabs */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col h-full overflow-hidden">
          <div className="flex flex-col gap-2 shrink-0">
            <button 
              onClick={() => setActiveTab('bible')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'bible' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <BookOpen size={20} /> Bíblia Sagrada
            </button>
            <button 
              onClick={() => setActiveTab('lyrics')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'lyrics' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Music size={20} /> Louvor (Letras)
            </button>
            <button 
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'media' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <ImageIcon size={20} /> Backgrounds
            </button>
            <button 
              onClick={() => setActiveTab('marquee')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'marquee' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <MessageSquareWarning size={20} /> Avisos
            </button>
          </div>

          {/* Acervo de Músicas na Lateral */}
          {activeTab === 'lyrics' && (
            <div className="mt-6 flex-1 flex flex-col min-h-0 border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Acervo ({librarySongs.length})</div>
              <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                {librarySongs.map(song => (
                  <button
                    key={song.id}
                    onClick={() => {
                      setSearchQuery(`${song.artist} - ${song.title}`);
                      buildSlides(song.lyrics);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                  >
                    <Music size={16} className="text-primary shrink-0 opacity-70" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{song.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          
          {/* TAB: BIBLE */}
          {activeTab === 'bible' && (
            <>
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
                  <div className="grid grid-cols-1 gap-3">
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
            </>
          )}

          {/* TAB: LYRICS */}
          {activeTab === 'lyrics' && (
            <div className="flex flex-col h-full gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Busca Inteligente (Letras)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Busque por artista ou música (Ex: Aline Barros Ressuscita-me)"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200 text-lg"
                  />
                  {isSearchingSuggest && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="animate-spin text-gray-400" size={24} />
                    </div>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute z-50 w-[calc(100%-3rem)] mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(`${item.artist.name} - ${item.title}`);
                          fetchSong(item.artist.name, item.title);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3 transition-colors"
                      >
                        <Music className="text-primary" size={18} />
                        <div>
                          <div className="font-bold text-gray-800 dark:text-gray-200">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.artist.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isSearchingSong && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="animate-spin mb-4" size={48} />
                  <p className="text-lg">Baixando e processando música no Backend...</p>
                </div>
              )}

              {songSlides.length > 0 && !isSearchingSong && (
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-y-auto p-6">
                  <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-white">Slides da Música</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {songSlides.map((slide, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleProjectLyrics(slide, idx)}
                        className={`p-6 rounded-xl cursor-pointer border-2 transition-all flex items-center justify-center text-center min-h-[150px] ${
                          activeLyricsIndex === idx 
                            ? 'bg-primary text-white border-primary-dark shadow-lg scale-[1.02]' 
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: slide }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MEDIA */}
          {activeTab === 'media' && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Plano de Fundo (Background)</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tipo de Fundo</label>
                  <select 
                    value={bgType}
                    onChange={(e) => setBgType(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                  >
                    <option value="color">Cor Sólida</option>
                    <option value="image">Imagem (URL)</option>
                    <option value="video">Vídeo MP4 Animado (URL)</option>
                  </select>
                </div>

                {bgType === 'color' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Seletor de Cor</label>
                    <input 
                      type="color" 
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                  </div>
                )}

                {(bgType === 'image' || bgType === 'video') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL do Arquivo</label>
                    <input 
                      type="text" 
                      value={bgUrl}
                      onChange={(e) => setBgUrl(e.target.value)}
                      placeholder={bgType === 'image' ? "Ex: https://site.com/fundo.jpg" : "Ex: https://site.com/motion.mp4"}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-2">Dica: Use links diretos para imagens (.jpg, .png) ou vídeos (.mp4).</p>
                  </div>
                )}

                <button 
                  onClick={applyBackground}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-bold shadow-md w-full"
                >
                  Aplicar Background no Telão
                </button>
              </div>
            </div>
          )}

          {/* TAB: AVISOS */}
          {activeTab === 'marquee' && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Letreiro Rotativo (Avisos)</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Texto do Aviso</label>
                  <textarea 
                    value={marqueeText}
                    onChange={(e) => setMarqueeText(e.target.value)}
                    placeholder="Ex: Culto da Família neste domingo às 19h..."
                    rows={4}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200 resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={toggleMarquee}
                    className={`flex-1 px-6 py-3 rounded-lg font-bold shadow-md text-white transition-colors ${
                      isMarqueeActive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'
                    }`}
                  >
                    {isMarqueeActive ? 'Ocultar Letreiro' : 'Exibir Letreiro no Telão'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
