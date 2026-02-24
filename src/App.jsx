import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage';
import RepGridPage from './pages/RepGridPage';
import AdminPage from './pages/AdminPage';
import FormPage from './pages/FormPage';
import SimpleFormPage from './pages/SimpleFormPage';
import EventsListPage from './pages/EventsListPage';
import EventsAdminPage from './pages/EventsAdminPage';
import EventDetailPage from './pages/EventDetailPage';

function App() {
  // Auto-resize when embedded in an iframe (e.g. Framer)
  useEffect(() => {
    if (window.parent === window) return;
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'resize', height }, '*');
    };
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    sendHeight();
    return () => observer.disconnect();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/reps" element={<RepGridPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/simple-form" element={<SimpleFormPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/admin" element={<EventsAdminPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
