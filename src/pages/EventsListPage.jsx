import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import brandTokens from '../brandTokens';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import EventCalendar from '../components/events/EventCalendar';
import { fetchPublishedEvents, fetchSignupCount, fetchCategories, subscribeToEventsUpdates } from '../services/eventsApiService';

const EventsListPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [signupCounts, setSignupCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '', showPast: false });
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('list');
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
    fetchCategories().then(setCategories);

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

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Hide past events unless toggled on
      if (!filters.showPast && event.eventDate < todayStr) return false;
      if (selectedDate && event.eventDate !== selectedDate) return false;
      if (filters.category && event.category !== filters.category) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !event.title.toLowerCase().includes(q) &&
          !(event.description || '').toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [events, filters, selectedDate, todayStr]);

  const toggleBtnStyle = (active) => ({
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: brandTokens.font,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: active ? brandTokens.colors.selected : 'transparent',
    color: active ? 'white' : '#6b7280',
    transition: 'all 0.15s ease',
  });

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
            {filters.showPast ? 'All Events' : 'Upcoming Events'}
          </h1>
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '3px',
          }}>
            <button onClick={() => { setView('list'); setSelectedDate(null); }} style={toggleBtnStyle(view === 'list')}>
              List
            </button>
            <button onClick={() => setView('calendar')} style={toggleBtnStyle(view === 'calendar')}>
              Calendar
            </button>
          </div>
        </div>

        {/* Filters */}
        <EventFilters filters={filters} onFiltersChange={setFilters} categories={categories} />

        {/* Calendar view */}
        {view === 'calendar' && (
          <div style={{
            display: isMobile ? 'flex' : 'grid',
            gridTemplateColumns: '1fr 1fr',
            flexDirection: 'column',
            gap: '32px',
            marginBottom: '32px',
          }}>
            <EventCalendar
              events={events}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <div>
              {selectedDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setSelectedDate(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: brandTokens.colors.selected,
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: '2px 6px',
                      fontFamily: brandTokens.font,
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
              {loading ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading events...</p>
              ) : filteredEvents.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  {selectedDate ? 'No events on this date.' : 'No upcoming events.'}
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                  {filteredEvents.map((event) => (
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

        {/* List view */}
        {view === 'list' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                Loading events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                {events.length === 0 ? 'No upcoming events.' : 'No events match your filters.'}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
              }}>
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    signupCount={signupCounts[event.id] || 0}
                    onClick={() => navigate(`/events/${event.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsListPage;
