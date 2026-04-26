import { useState, KeyboardEvent } from 'react';
import { useBible } from '../hooks/useBible';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export function SearchFTS() {
  const { verses, loading, searchVerses } = useBible();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim().length > 2) {
      searchVerses(query);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      
      {/* Header Search */}
      <header className="bg-gray-50 dark:bg-gray-950 px-6 py-8 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Pesquisa Full-Text (FTS)</h1>
        
        <div className="relative max-w-2xl">
          <input 
            type="text"
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-4 pl-12 pr-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg"
            placeholder="Ex: No princípio criou Deus..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <SearchIcon size={24} />
          </div>
          <button 
            onClick={handleSearch}
            className="absolute inset-y-2 right-2 bg-primary hover:bg-primary-dark text-white px-6 rounded-lg font-medium transition-colors"
          >
            Buscar
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">A pesquisa utiliza engine nativa para consultar mais de 400.000 versículos instantaneamente.</p>
      </header>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="animate-spin mb-4 text-primary" size={48} />
              <p>Vasculhando os textos originais...</p>
            </div>
          )}

          {!loading && verses.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-gray-500 font-medium mb-4">{verses.length} Resultados encontrados:</h2>
              
              {verses.map(verse => (
                <div key={verse.id} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {verse.chapter?.book?.version?.abbreviation || 'N/A'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {verse.chapter?.book?.name} {verse.chapter?.number}:{verse.number}
                    </span>
                  </div>
                  <p 
                    className="font-serif text-lg leading-relaxed text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: verse.text }}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && verses.length === 0 && query && (
             <div className="text-center text-gray-500 py-20">
               Nenhum resultado encontrado para "{query}".
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
