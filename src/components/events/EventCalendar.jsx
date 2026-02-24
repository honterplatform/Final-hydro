import { useState, useMemo } from 'react';
import brandTokens from '../../brandTokens';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EventCalendar = ({ events = [], selectedDate, onDateSelect }) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Build a Set of dates that have events
  const eventDates = useMemo(() => {
    const dates = new Set();
    events.forEach((e) => {
      if (e.eventDate) dates.add(e.eventDate);
    });
    return dates;
  }, [events]);

  // Build the calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    // Previous month days to fill the first row
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const grid = [];
    let dayCounter = 1;
    let nextMonthDay = 1;

    for (let row = 0; row < 6; row++) {
      const week = [];
      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        if (cellIndex < firstDayOfWeek) {
          // Previous month
          const day = prevMonthDays - firstDayOfWeek + cellIndex + 1;
          const m = currentMonth === 0 ? 12 : currentMonth;
          const y = currentMonth === 0 ? currentYear - 1 : currentYear;
          week.push({ day, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`, outside: true });
        } else if (dayCounter <= daysInMonth) {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
          week.push({ day: dayCounter, dateStr, outside: false });
          dayCounter++;
        } else {
          // Next month
          const m = currentMonth + 2 > 12 ? 1 : currentMonth + 2;
          const y = currentMonth + 2 > 12 ? currentYear + 1 : currentYear;
          week.push({ day: nextMonthDay, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`, outside: true });
          nextMonthDay++;
        }
      }
      week._hasCurrentMonth = week.some((d) => !d.outside);
      grid.push(week);
      if (dayCounter > daysInMonth && row >= 4) break;
    }
    return grid;
  }, [currentYear, currentMonth]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const navBtnStyle = {
    background: 'none',
    border: `1px solid ${brandTokens.colors.border}`,
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    padding: 0,
    fontSize: '18px',
    lineHeight: 1,
    cursor: 'pointer',
    color: brandTokens.colors.text,
    fontFamily: brandTokens.font,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: brandTokens.radii.card,
        border: `1px solid ${brandTokens.colors.border}`,
        padding: '20px',
        fontFamily: brandTokens.font,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <button onClick={goToPrevMonth} style={navBtnStyle}>
          &lsaquo;
        </button>
        <span style={{ fontSize: '18px', fontWeight: '400', color: brandTokens.colors.text }}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button onClick={goToNextMonth} style={navBtnStyle}>
          &rsaquo;
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#6b7280',
              padding: '4px 0',
              fontWeight: '500',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {calendarGrid.map((week, rowIdx) => (
        <div
          key={rowIdx}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}
        >
          {week.map((cell, colIdx) => {
            const isSelected = selectedDate === cell.dateStr;
            const isToday = cell.dateStr === todayStr;
            const hasEvents = eventDates.has(cell.dateStr);

            return (
              <div
                key={colIdx}
                onClick={() => !cell.outside && onDateSelect(isSelected ? null : cell.dateStr)}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: cell.outside ? 'default' : 'pointer',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? brandTokens.colors.selected : 'transparent',
                  border: isToday && !isSelected ? `1px solid ${brandTokens.colors.selected}` : '1px solid transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    color: cell.outside
                      ? '#d1d5db'
                      : isSelected
                        ? 'white'
                        : brandTokens.colors.text,
                    fontWeight: isToday ? '600' : '400',
                  }}
                >
                  {cell.day}
                </span>
                {hasEvents && !cell.outside && (
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'white' : brandTokens.colors.selected,
                      marginTop: '2px',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default EventCalendar;
