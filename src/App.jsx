import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage';
import RepGridPage from './pages/RepGridPage';
import AdminPage from './pages/AdminPage';
import FormPage from './pages/FormPage';
import SimpleFormPage from './pages/SimpleFormPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/reps" element={<RepGridPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/simple-form" element={<SimpleFormPage />} />
      </Routes>
    </Router>
  );
}

export default App;
