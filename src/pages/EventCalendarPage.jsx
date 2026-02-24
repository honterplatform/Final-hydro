import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import brandTokens from '../brandTokens';
import EventCalendar from '../components/events/EventCalendar';
import EventCard from '../components/events/EventCard';
import { fetchPublishedEvents, fetchSignupCount, subscribeToEventsUpdates } from '../services/eventsApiService';

const EventCalendarPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [signupCounts, setSignupCounts] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [horizontalPadding, setHorizontalPadding] = useState('120px');

  const loadEvents = async () => {
    const data = await fetchPublishedEvents();
    setEvents(data);
    const counts = {};
    await Promise.all(
      data.map(async (ev) => {
        counts[ev.id] = await fetchSignupCount(ev.id);
      })
    );
    setSignupCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();

    let subscription = null;
    const setup = async () => {
      subscription = await subscribeToEventsUpdates(() => loadEvents());
    };
    setup();

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width >= 1440) setHorizontalPadding('120px');
      else if (width >= 1024) setHorizontalPadding('90px');
      else if (width >= 768) setHorizontalPadding('40px');
      else setHorizontalPadding('20px');
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const eventsForDate = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter((e) => e.eventDate === selectedDate);
  }, [events, selectedDate]);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: brandTokens.colors.bg,
      fontFamily: brandTokens.font,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    }}>
      <div style={{ padding: `40px ${horizontalPadding} 60px ${horizontalPadding}` }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h1 style={{
            margin: 0,
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '400',
            color: brandTokens.colors.text,
          }}>
            Events Calendar
          </h1>
          <Link to="/events" style={{
            color: brandTokens.colors.selected,
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '400',
            padding: '8px 16px',
            border: `1px solid ${brandTokens.colors.selected}`,
            borderRadius: '6px',
            transition: 'background-color 160ms ease',
          }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = brandTokens.colors.selected; e.target.style.color = 'white'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = brandTokens.colors.selected; }}
          >
            List View
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            Loading events...
          </div>
        ) : (
          <div style={{
            display: isMobile ? 'flex' : 'grid',
            flexDirection: 'column',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
          }}>
            {/* Calendar */}
            <div>
              <EventCalendar
                events={events}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {/* Events for selected date */}
            <div>
              <h2 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '400',
                color: brandTokens.colors.text,
              }}>
                {selectedDate
                  ? `Events on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : 'All Upcoming Events'}
              </h2>

              {eventsForDate.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  {selectedDate ? 'No events on this date.' : 'No upcoming events.'}
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                  {eventsForDate.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      signupCount={signupCounts[event.id] || 0}
                      onClick={() => navigate(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendarPage;
