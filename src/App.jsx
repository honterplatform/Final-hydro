import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import { initializeHybridStorage } from './services/hybridStorageService';

function App() {
  useEffect(() => {
    // Initialize hybrid storage system
    initializeHybridStorage();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
