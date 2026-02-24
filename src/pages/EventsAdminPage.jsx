import { Link } from 'react-router-dom';
import EventsAdminPanel from '../components/events/EventsAdminPanel';
import brandTokens from '../brandTokens';

const EventsAdminPage = () => {
  return (
    <div style={{
      width: '100%',
      minHeight: window.parent !== window ? 'auto' : '100vh',
      backgroundColor: brandTokens.colors.bg,
      fontFamily: brandTokens.font,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: `1px solid ${brandTokens.colors.border}`,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '400',
          color: brandTokens.colors.text,
        }}>
          Events Admin
        </h1>
        <Link
          to="/events"
          style={{
            background: brandTokens.colors.selected,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'background-color 160ms ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.target.style.backgroundColor = brandTokens.colors.selected}
        >
          ← Back to Events
        </Link>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <EventsAdminPanel />
      </div>
    </div>
  );
};

export default EventsAdminPage;
