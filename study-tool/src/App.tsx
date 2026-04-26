import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, Search, BookMarked, Settings } from 'lucide-react';

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

function ReadingView() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Gênesis 1</h2>
        <p className="text-gray-500 mt-2">Almeida Revista e Atualizada (ARA)</p>
      </header>
      <div className="space-y-4 text-lg leading-relaxed font-serif">
        <p><sup className="text-primary font-bold mr-2 text-sm">1</sup> No princípio, criou Deus os céus e a terra.</p>
        <p><sup className="text-primary font-bold mr-2 text-sm">2</sup> A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.</p>
        <p><sup className="text-primary font-bold mr-2 text-sm">3</sup> Disse Deus: Haja luz; e houve luz.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-light dark:bg-[#111827]">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<ReadingView />} />
            <Route path="/search" element={<div className="p-8">Em construção...</div>} />
            <Route path="/parallel" element={<div className="p-8">Em construção...</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
