import { useState, useEffect } from 'react';
import brandTokens from '../brandTokens';
import { LeadForm } from './LeadForm';

const RepGrid = ({ reps }) => {
  const [selectedRep, setSelectedRep] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [horizontalPadding, setHorizontalPadding] = useState('120px');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [titleFontSize, setTitleFontSize] = useState('46px');
  const [topPadding, setTopPadding] = useState('90px');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // Set responsive padding
      if (width >= 1440) {
        setHorizontalPadding('120px'); // Big screens
        setTitleFontSize('46px');
        setTopPadding('20px');
      } else if (width >= 1024) {
        setHorizontalPadding('90px'); // Laptops
        setTitleFontSize('42px');
        setTopPadding('20px');
      } else if (width >= 768) {
        setHorizontalPadding('40px'); // Tablets
        setTitleFontSize('36px');
        setTopPadding('20px');
      } else {
        setHorizontalPadding('40px'); // Small tablets (won't show due to mobile check)
        setTitleFontSize('36px');
        setTopPadding('20px');
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLetsTalkClick = (rep) => {
    setSelectedRep(rep);
    setShowLeadForm(true);
  };

  const handleCloseLeadForm = () => {
    setShowLeadForm(false);
    setSelectedRep(null);
  };

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <div style={{
      width: '100%',
      backgroundColor: brandTokens.colors.bg,
      padding: `${topPadding} ${horizontalPadding} 60px ${horizontalPadding}`,
      boxSizing: 'border-box'
    }}>
      <h2 style={{
        textAlign: 'center',
        fontSize: titleFontSize,
        fontWeight: '400',
        marginBottom: '50px',
        color: brandTokens.colors.text,
        fontFamily: brandTokens.font
      }}>
        Meet Our Reps
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {reps.map((rep, index) => {
          const initials = rep.rep
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: hoveredCard === index ? '#F5F5F5' : 'white',
                borderRadius: '12px',
                border: '1px solid #d9d9d9',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: hoveredCard === index ? 'white' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                transition: 'background-color 0.2s ease'
              }}>
                <span style={{
                  color: '#000000',
                  fontSize: '18px',
                  fontWeight: '400',
                  fontFamily: brandTokens.font
                }}>
                  {initials}
                </span>
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: '400',
                margin: 0,
                textAlign: 'center',
                color: brandTokens.colors.text,
                fontFamily: brandTokens.font
              }}>
                {rep.rep}
              </h3>

              <div style={{
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: rep.states.length > 6 ? 'flex-start' : 'center'
              }}>
                {rep.states.length > 6 ? (
                  <div style={{
                    display: 'flex',
                    animation: 'ticker 40s linear infinite',
                    whiteSpace: 'nowrap'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      margin: 0,
                      fontFamily: brandTokens.font,
                      fontWeight: '300',
                      paddingRight: '40px'
                    }}>
                      {rep.states.join(', ')}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      margin: 0,
                      fontFamily: brandTokens.font,
                      fontWeight: '300',
                      paddingRight: '40px'
                    }}>
                      {rep.states.join(', ')}
                    </p>
                  </div>
                ) : (
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: 0,
                    fontFamily: brandTokens.font,
                    fontWeight: '300'
                  }}>
                    {rep.states.join(', ')}
                  </p>
                )}
                <style>{`
                  @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                `}</style>
              </div>

              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: 0,
                textAlign: 'center',
                fontFamily: brandTokens.font,
                fontWeight: '300'
              }}>
                {rep.phone || 'No phone available'}
              </p>

              <button
                onClick={() => handleLetsTalkClick(rep)}
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  backgroundColor: '#509E2E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginTop: '8px',
                  fontFamily: brandTokens.font,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#429525'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#509E2E'}
              >
                Let's Talk
              </button>
            </div>
          );
        })}
      </div>

      {selectedRep && (
        <LeadForm
          rep={selectedRep}
          visible={showLeadForm}
          onClose={handleCloseLeadForm}
        />
      )}
    </div>
  );
};

export default RepGrid;

