import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';

function App() {
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
