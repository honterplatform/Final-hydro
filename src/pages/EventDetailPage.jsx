import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import brandTokens from '../brandTokens';
import { fetchEventById, fetchSignupCount, subscribeToSignupsUpdates, addSignup } from '../services/eventsApiService';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signupForm, setSignupForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const load = async () => {
      const ev = await fetchEventById(id);
      setEvent(ev);
      if (ev) {
        const count = await fetchSignupCount(ev.id);
        setSignupCount(count);
      }
      setLoading(false);
    };
    load();

    let subscription = null;
    const setup = async () => {
      subscription = await subscribeToSignupsUpdates(async () => {
        const count = await fetchSignupCount(Number(id));
        setSignupCount(count);
      });
    };
    setup();

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: brandTokens.colors.bg, fontFamily: brandTokens.font, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: brandTokens.colors.bg, fontFamily: brandTokens.font, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>Event not found</p>
        <Link to="/events" style={{ color: brandTokens.colors.selected, textDecoration: 'none', fontSize: '14px' }}>← Back to Events</Link>
      </div>
    );
  }

  const dateStr = new Date(event.eventDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const timeStr = event.eventTime
    ? new Date(`2000-01-01T${event.eventTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const isPast = event.eventDate < todayStr;

  const isFull = event.capacity && signupCount >= event.capacity;
  const canSignUp = event.signupEnabled && event.status === 'published' && !isFull && !isPast;

  const categoryColors = {
    training: '#2563eb',
    'trade-show': '#7c3aed',
    webinar: '#0891b2',
    'lunch-and-learn': '#ea580c',
    conference: '#be185d',
    general: '#6b7280',
  };
  const catColor = categoryColors[event.category] || categoryColors.general;

  // Calendar helpers
  const formatDateForCal = (dateStr, timeStr) => {
    const clean = dateStr.replace(/-/g, '');
    if (timeStr) {
      const t = timeStr.replace(/:/g, '');
      return `${clean}T${t.length === 4 ? t + '00' : t}`;
    }
    return clean;
  };

  const getGoogleCalendarUrl = () => {
    const start = formatDateForCal(event.eventDate, event.eventTime);
    // Default 1 hour duration if time provided, otherwise all-day
    let end;
    if (event.eventTime) {
      const [h, m] = event.eventTime.split(':').map(Number);
      const endH = String(h + 1).padStart(2, '0');
      const endM = String(m).padStart(2, '0');
      end = `${event.eventDate.replace(/-/g, '')}T${endH}${endM}00`;
    } else {
      const d = new Date(event.eventDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      end = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    }
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
      ...(event.description && { details: event.description }),
      ...(event.location && { location: event.location }),
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const downloadIcs = () => {
    const start = formatDateForCal(event.eventDate, event.eventTime);
    let end;
    if (event.eventTime) {
      const [h, m] = event.eventTime.split(':').map(Number);
      const endH = String(h + 1).padStart(2, '0');
      const endM = String(m).padStart(2, '0');
      end = `${event.eventDate.replace(/-/g, '')}T${endH}${endM}00`;
    } else {
      const d = new Date(event.eventDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      end = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    }
    const dtProp = event.eventTime ? 'DTSTART' : 'DTSTART;VALUE=DATE';
    const dtEndProp = event.eventTime ? 'DTEND' : 'DTEND;VALUE=DATE';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HydroBlok//Events//EN',
      'BEGIN:VEVENT',
      `${dtProp}:${start}`,
      `${dtEndProp}:${end}`,
      `SUMMARY:${event.title}`,
      ...(event.description ? [`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`] : []),
      ...(event.location ? [`LOCATION:${event.location}`] : []),
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: brandTokens.font,
    cursor: 'pointer',
    color: brandTokens.colors.text,
    textDecoration: 'none',
    transition: 'border-color 0.15s ease',
  };

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
      <div style={{ padding: 0 }}>
        {/* Back link */}
        <Link to="/events" style={{
          color: brandTokens.colors.selected,
          textDecoration: 'none',
          fontSize: '14px',
          display: 'inline-block',
          marginBottom: '24px',
        }}>
          ← Back to Events
        </Link>

        {/* Two-column layout: image left, copy right */}
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          gridTemplateColumns: '1fr 1fr',
          flexDirection: 'column',
          gap: isMobile ? '24px' : '40px',
        }}>
          {/* Left — Cover image */}
          <div>
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={event.title}
                style={{
                  width: '100%',
                  height: isMobile ? '240px' : '100%',
                  minHeight: isMobile ? undefined : '360px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: isMobile ? '240px' : '100%',
                minHeight: isMobile ? undefined : '360px',
                backgroundColor: '#e5e7eb',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: '48px',
              }}>
                &#128197;
              </div>
            )}
          </div>

          {/* Right — Event details + signup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Category chip */}
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: brandTokens.radii.chip,
              backgroundColor: '#509E2E',
              color: 'white',
              fontSize: '12px',
              fontWeight: '500',
              textTransform: 'capitalize',
              alignSelf: 'flex-start',
            }}>
              {event.category.replace('-', ' ')}
            </span>

            {isPast && (
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: brandTokens.radii.chip,
                backgroundColor: '#f3f4f6',
                color: '#535862',
                fontSize: '12px',
                fontWeight: '500',
                alignSelf: 'flex-start',
              }}>
                Past Event
              </span>
            )}

            {/* Title */}
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '400',
              color: brandTokens.colors.text,
              lineHeight: 1.3,
            }}>
              {event.title}
            </h1>

            {/* Info row — date + location side by side */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p style={{ margin: 0, fontSize: '15px', color: brandTokens.colors.text, fontWeight: '400' }}>
                  {dateStr}
                </p>
              </div>
              {timeStr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p style={{ margin: 0, fontSize: '15px', color: brandTokens.colors.text, fontWeight: '400' }}>
                    {timeStr}
                  </p>
                </div>
              )}
              {event.location && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <p style={{ margin: 0, fontSize: '15px', color: brandTokens.colors.text, fontWeight: '400' }}>
                    {event.location}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: '#535862',
                whiteSpace: 'pre-wrap',
              }}>
                {event.description}
              </div>
            )}

            {/* Sign Up section — subtle green container */}
            <div style={{
              backgroundColor: '#F4F3F2',
              border: 'none',
              borderRadius: '12px',
              padding: '24px',
              marginTop: '4px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: '500',
                  color: '#509E2E',
                }}>
                  Reserve Your Spot
                </h3>
                {event.capacity ? (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '400',
                    color: isFull ? '#dc2626' : '#509E2E',
                    backgroundColor: isFull ? '#fef2f2' : '#509E2E15',
                    padding: '4px 10px',
                    borderRadius: '20px',
                  }}>
                    {isFull ? 'Full' : `${event.capacity - signupCount} spots left`}
                  </span>
                ) : signupCount > 0 ? (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '400',
                    color: '#509E2E',
                    backgroundColor: '#509E2E15',
                    padding: '4px 10px',
                    borderRadius: '20px',
                  }}>
                    {signupCount} attending
                  </span>
                ) : null}
              </div>

              {isPast ? (
                <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', fontWeight: '400' }}>
                  This event has already passed.
                </p>
              ) : event.signupEnabled && event.status === 'published' ? (
                submitSuccess ? (
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#509E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#14532d' }}>
                        You're signed up!
                      </p>
                    </div>
                    <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#535862' }}>
                      Add this event to your calendar:
                    </p>
                    <div style={{ display: 'flex' }}>
                      <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={calBtnStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#509E2E')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                      >
                        <svg width="16" height="16" viewBox="0 0 48 48">
                          <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
                          <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Add to Google Calendar
                      </a>
                    </div>
                  </div>
                ) : isFull ? (
                  <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', fontWeight: '400' }}>
                    This event is at full capacity.
                  </p>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSubmitting(true);
                      setSubmitError('');
                      try {
                        await addSignup({
                          eventId: event.id,
                          firstName: signupForm.firstName,
                          lastName: signupForm.lastName,
                          email: signupForm.email,
                          phone: signupForm.phone,
                        });
                        setSubmitSuccess(true);
                        setSignupCount((prev) => prev + 1);
                        setSignupForm({ firstName: '', lastName: '', email: '', phone: '' });
                      } catch (error) {
                        setSubmitError(error.message || 'Something went wrong. Please try again.');
                      }
                      setIsSubmitting(false);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="First Name *"
                        required
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        style={{
                          padding: '16px 14px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: brandTokens.font,
                          outline: 'none',
                          backgroundColor: 'white',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #509E2E40')}
                        onBlur={(e) => (e.target.style.boxShadow = 'none')}
                      />
                      <input
                        type="text"
                        placeholder="Last Name *"
                        required
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        style={{
                          padding: '16px 14px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: brandTokens.font,
                          outline: 'none',
                          backgroundColor: 'white',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #509E2E40')}
                        onBlur={(e) => (e.target.style.boxShadow = 'none')}
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email *"
                      required
                      value={signupForm.email}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                      style={{
                        padding: '16px 14px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: brandTokens.font,
                        outline: 'none',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #509E2E40')}
                      onBlur={(e) => (e.target.style.boxShadow = 'none')}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, phone: e.target.value }))}
                      style={{
                        padding: '16px 14px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: brandTokens.font,
                        outline: 'none',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #509E2E40')}
                      onBlur={(e) => (e.target.style.boxShadow = 'none')}
                    />

                    {submitError && (
                      <p style={{ margin: 0, fontSize: '13px', color: '#dc2626' }}>
                        {submitError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: '12px 28px',
                        backgroundColor: '#509E2E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontFamily: brandTokens.font,
                        transition: 'background-color 0.2s',
                        opacity: isSubmitting ? 0.7 : 1,
                        alignSelf: 'flex-start',
                      }}
                      onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#429525')}
                      onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#509E2E')}
                    >
                      {isSubmitting ? 'Submitting...' : 'Sign Up'}
                    </button>
                  </form>
                )
              ) : !event.signupEnabled ? (
                <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', fontWeight: '400' }}>
                  Registration is closed for this event.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
