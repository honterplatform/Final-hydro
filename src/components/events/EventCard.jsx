import { useState } from 'react';
import brandTokens from '../../brandTokens';

const categoryColors = {
  training: '#2563eb',
  'trade-show': '#7c3aed',
  webinar: '#0891b2',
  'lunch-and-learn': '#ea580c',
  conference: '#be185d',
  general: '#535862',
};

const EventCard = ({ event, signupCount = 0, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const isPast = event.eventDate < todayStr;

  const dateStr = new Date(event.eventDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeStr = event.eventTime
    ? new Date(`2000-01-01T${event.eventTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  const catColor = categoryColors[event.category] || categoryColors.general;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: 'white',
        transform: hovered && !isPast ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.2s ease',
        opacity: isPast ? 0.6 : 1,
        fontFamily: brandTokens.font,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cover image or placeholder */}
      <div
        style={{
          aspectRatio: '4 / 3',
          backgroundColor: event.coverImage ? 'transparent' : catColor + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '40px', opacity: 0.3 }}>&#128197;</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1 }}>
        {/* Category chip */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: brandTokens.radii.chip,
              backgroundColor: '#509E2E',
              color: 'white',
              fontSize: '11px',
              fontWeight: '500',
              textTransform: 'capitalize',
            }}
          >
            {event.category.replace('-', ' ')}
          </span>

          {isPast && (
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: brandTokens.radii.chip,
                backgroundColor: '#f3f4f6',
                color: '#535862',
                fontSize: '11px',
                fontWeight: '500',
              }}
            >
              Past
            </span>
          )}
          {event.status === 'draft' && (
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: brandTokens.radii.chip,
                backgroundColor: '#f3f4f6',
                color: '#535862',
                fontSize: '11px',
                fontWeight: '500',
              }}
            >
              Draft
            </span>
          )}
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: brandTokens.colors.text,
            lineHeight: 1.3,
          }}
        >
          {event.title}
        </h3>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '0 16px' }} />

      {/* Info rows — date & time, then location */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#535862" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: '13px', color: '#535862' }}>{dateStr}</span>
          </div>
          {timeStr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#535862" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{ fontSize: '13px', color: '#535862' }}>{timeStr}</span>
            </div>
          )}
        </div>
        {event.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#535862" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ fontSize: '13px', color: '#535862' }}>{event.location}</span>
          </div>
        )}
      </div>

      {/* Signup section */}
      <div style={{
        backgroundColor: '#f1f7ee',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: '0 0 12px 12px',
      }}>
        {!isPast && event.signupEnabled && event.status === 'published' && !(event.capacity && signupCount >= event.capacity) ? (
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#509E2E',
            cursor: 'pointer',
          }}>
            Sign Up →
          </span>
        ) : event.capacity && signupCount >= event.capacity ? (
          <span style={{
            fontSize: '11px',
            fontWeight: '500',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            padding: '3px 8px',
            borderRadius: '20px',
          }}>
            Full
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default EventCard;
