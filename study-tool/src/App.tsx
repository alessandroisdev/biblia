import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, Search, BookMarked, Settings } from 'lucide-react';
import { BibleReader } from './components/BibleReader';
import { SearchFTS } from './components/SearchFTS';
import { ParallelStudy } from './components/ParallelStudy';

function Sidebar() {
  return (
    <div className="w-64 bg-dark min-h-screen text-light p-6 flex flex-col border-r border-gray-800">
      <div className="flex items-center gap-3 mb-10">
        <BookOpen className="text-primary" size={32} />
        <h1 className="text-2xl font-bold tracking-tight">StudyTool</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
          <BookOpen size={20} />
          <span>Leitura</span>
        </Link>
        <Link to="/search" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
          <Search size={20} />
          <span>Pesquisa FTS</span>
        </Link>
        <Link to="/parallel" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
          <BookMarked size={20} />
          <span>Leitura Paralela</span>
        </Link>
      </nav>

      <div className="pt-6 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-gray-800 transition-colors text-gray-400">
          <Settings size={20} />
          <span>Configurações</span>
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-light dark:bg-[#111827]">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<BibleReader />} />
            <Route path="/search" element={<SearchFTS />} />
            <Route path="/parallel" element={<ParallelStudy />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
