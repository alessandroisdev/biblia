import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ControlPanel } from './components/ControlPanel';
import { ProjectorScreen } from './components/ProjectorScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ControlPanel />} />
        <Route path="/screen" element={<ProjectorScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
