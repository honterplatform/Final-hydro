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
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <EventsAdminPanel />
      </div>
    </div>
  );
};

export default EventsAdminPage;
