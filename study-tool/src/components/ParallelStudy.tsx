import { useState, useEffect } from 'react';
import { useBible } from '../hooks/useBible';
import { type Version, type Chapter } from '../api/client';
import { ChevronDown, Loader2 } from 'lucide-react';

function ParallelColumn({ 
  versions, 
  globalBookName,
  globalChapterNumber,
  initialVersionId
}: { 
  versions: Version[], 
  globalBookName: string, 
  globalChapterNumber: number,
  initialVersionId?: number 
}) {
  const { books, chapters, verses, loading, fetchBooks, fetchChapters, fetchVerses } = useBible();
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  // Define a versão inicial
  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      if (initialVersionId) {
        setSelectedVersion(versions.find(v => v.id === initialVersionId) || versions[0]);
      } else {
        setSelectedVersion(versions[0]);
      }
    }
  }, [versions, initialVersionId]);

  // Quando a versão muda, baixa os livros dela
  useEffect(() => {
    if (selectedVersion) {
      fetchBooks(selectedVersion.id);
    }
  }, [selectedVersion]);

  // Sincroniza o livro global
  useEffect(() => {
    if (books.length > 0 && globalBookName) {
      const book = books.find(b => b.name === globalBookName || b.abbreviation === globalBookName) || books[0];
      fetchChapters(book.id);
    }
  }, [books, globalBookName]);

  // Sincroniza o capítulo global
  useEffect(() => {
    if (chapters.length > 0 && globalChapterNumber) {
      const chapter = chapters.find(c => c.number === globalChapterNumber) || chapters[0];
      fetchVerses(chapter.id);
    }
  }, [chapters, globalChapterNumber]);

  return (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 last:border-0 relative">
      <header className="bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0">
        <div className="relative w-full max-w-[200px]">
          <select 
            className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm py-2 pl-3 pr-8 rounded-lg focus:ring-primary focus:border-primary"
            value={selectedVersion?.id || ''}
            onChange={(e) => {
              const v = versions.find(v => v.id === Number(e.target.value));
              if (v) setSelectedVersion(v);
            }}
          >
            {versions.map(v => (
              <option key={v.id} value={v.id}>{v.abbreviation}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown size={14} />
          </div>
        </div>
        {loading && <Loader2 className="animate-spin text-primary" size={18} />}
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-300">
          {verses.map((verse) => (
            <p key={verse.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 rounded transition-colors cursor-text">
              <sup className="text-primary font-bold mr-2 text-xs select-none opacity-70">
                {verse.number}
              </sup>
              <span dangerouslySetInnerHTML={{ __html: verse.text }} />
            </p>
          ))}
          {!loading && verses.length === 0 && (
            <div className="text-center text-gray-500 italic mt-10 text-sm">
              Nenhum versículo encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ParallelStudy() {
  const { versions, books, chapters, fetchBooks, fetchChapters } = useBible();
  
  const [globalBookName, setGlobalBookName] = useState<string>('Gênesis');
  const [globalChapterNumber, setGlobalChapterNumber] = useState<number>(1);

  // Inicializa pegando as versões e depois os livros da primeira versão como "master" para o select global
  useEffect(() => {
    if (versions.length > 0) {
      fetchBooks(versions[0].id);
    }
  }, [versions]);

  useEffect(() => {
    if (books.length > 0) {
      const b = books.find(b => b.name === globalBookName);
      if (b) fetchChapters(b.id);
    }
  }, [books, globalBookName]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      
      {/* Global Navbar */}
      <header className="bg-dark px-6 py-4 flex flex-wrap gap-4 items-center text-white">
        <h2 className="font-bold text-xl mr-4 flex-shrink-0">Estudo Paralelo</h2>
        
        {/* Master Book Selector */}
        <div className="relative">
          <select 
            className="appearance-none bg-gray-800 border border-gray-700 text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
            value={globalBookName}
            onChange={(e) => {
              setGlobalBookName(e.target.value);
              setGlobalChapterNumber(1); // Reset chapter when book changes
            }}
          >
            {books.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Master Chapter Selector */}
        <div className="relative">
          <select 
            className="appearance-none bg-gray-800 border border-gray-700 text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-[80px]"
            value={globalChapterNumber}
            onChange={(e) => setGlobalChapterNumber(Number(e.target.value))}
          >
            {chapters.map(c => (
              <option key={c.id} value={c.number}>{c.number}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </header>

      {/* Columns Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {versions.length > 0 && (
          <>
            <ParallelColumn 
              versions={versions} 
              globalBookName={globalBookName} 
              globalChapterNumber={globalChapterNumber} 
              initialVersionId={versions[0]?.id}
            />
            <ParallelColumn 
              versions={versions} 
              globalBookName={globalBookName} 
              globalChapterNumber={globalChapterNumber} 
              initialVersionId={versions.length > 1 ? versions[1]?.id : versions[0]?.id}
            />
          </>
        )}
      </div>
    </div>
  );
}
