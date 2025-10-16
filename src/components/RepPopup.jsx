import { useState, useEffect, useRef } from 'react';
import brandTokens from '../brandTokens';

const RepPopup = ({ visible, x, y, reps, stateName, selectedCode, onClose, onRepHover, onRepLeave }) => {
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, onClose]);

  if (!isVisible) return null;

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;
  
  // Adjust popup positioning for mobile
  const mobileStyle = isMobile ? {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '90vw',
    minWidth: '280px',
    maxHeight: '80vh',
    overflowY: 'auto',
  } : {
    left: x,
    top: y,
    transform: 'translate(-50%, -100%)',
    maxWidth: '400px',
    minWidth: '360px',
  };

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        backgroundColor: 'white',
        border: `1px solid ${brandTokens.colors.border}`,
        borderRadius: brandTokens.radii.card,
        boxShadow: brandTokens.shadow,
        padding: isMobile ? '12px 16px 8px 16px' : '16px 20px 12px 20px',
        zIndex: 1000,
        fontFamily: brandTokens.font,
        color: brandTokens.colors.text,
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
        ...mobileStyle,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${brandTokens.colors.border}`,
      }}>
               <h3 style={{
                 margin: 0,
                 fontSize: '18px',
                 fontWeight: '400',
                 color: brandTokens.colors.text,
               }}>
          {stateName}
        </h3>
               <button
                 onClick={onClose}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '20px',
                   fontWeight: '300',
                   cursor: 'pointer',
                   color: '#6b7280',
                   padding: '0',
                   width: '24px',
                   height: '24px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                 }}
               >
          ×
        </button>
      </div>
      
      {reps.length > 0 ? (
        reps.flatMap((repData, repIndex) => {
          // Split names by comma and "&" to separate individual representatives
          const individualReps = repData.rep
            .split(/,\s*|\s+&\s+/)
            .map(name => name.trim())
            .filter(name => name.length > 0);
          
          return individualReps.map((individualName, nameIndex) => {
            // Get all states this rep covers, excluding the current state
            const allStates = repData.states || [];
            const otherStates = allStates.filter(stateCode => stateCode !== selectedCode);
            
                   return (
                     <div 
                       key={`${repIndex}-${nameIndex}`} 
                       style={{
                         marginBottom: '8px',
                         paddingBottom: '8px',
                         borderBottom: (repIndex < reps.length - 1 || nameIndex < individualReps.length - 1) ? `1px solid ${brandTokens.colors.border}` : 'none',
                         cursor: 'pointer',
                         borderRadius: '4px',
                         padding: '4px',
                         transition: 'background-color 160ms ease',
                       }}
                       onMouseEnter={() => onRepHover && onRepHover(allStates)}
                       onMouseLeave={() => onRepLeave && onRepLeave()}
                       onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                       onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                     >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                         <div style={{ 
                           flex: 1, 
                           display: 'flex', 
                           alignItems: 'center', 
                           gap: isMobile ? '8px' : '10px' 
                         }}>
                           {repData.profileImage ? (
                             <img
                               src={repData.profileImage}
                               alt={`${individualName} profile`}
                               style={{
                                 width: isMobile ? '40px' : '48px',
                                 height: isMobile ? '40px' : '48px',
                                 borderRadius: '50%',
                                 objectFit: 'cover',
                                 flexShrink: 0,
                               }}
                             />
                           ) : (
                             <div style={{
                               width: isMobile ? '40px' : '48px',
                               height: isMobile ? '40px' : '48px',
                               borderRadius: '50%',
                               backgroundColor: '#e5e7eb',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0,
                             }}>
                               <span style={{
                                 color: '#9ca3af',
                                 fontSize: isMobile ? '14px' : '16px',
                                 fontWeight: '500',
                               }}>
                                 {individualName.charAt(0).toUpperCase()}
                               </span>
                             </div>
                           )}
                           <div>
                             <h4 style={{
                               fontSize: isMobile ? '14px' : '16px',
                               fontWeight: '400',
                               margin: '0 0 2px 0',
                               color: brandTokens.colors.text,
                             }}>
                               {individualName}
                             </h4>
                             {otherStates.length > 0 && (
                               <p style={{
                                 fontSize: isMobile ? '11px' : '12px',
                                 color: '#6b7280',
                                 margin: 0,
                               }}>
                                 Also available in {otherStates.join(', ')}
                               </p>
                             )}
                           </div>
                         </div>
                         <a 
                           href={repData.ctaUrl} 
                           style={{
                             background: brandTokens.colors.selected,
                             color: 'white',
                             border: 'none',
                             borderRadius: '6px',
                             padding: isMobile ? '6px 12px' : '8px 16px',
                             fontSize: isMobile ? '12px' : '14px',
                             fontWeight: '400',
                             cursor: 'pointer',
                             textDecoration: 'none',
                             display: 'inline-block',
                             transition: 'background-color 160ms ease',
                             marginLeft: isMobile ? '8px' : '12px',
                           }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = brandTokens.colors.selected}
                  >
                    Let's Talk
                  </a>
                </div>
              </div>
            );
          });
        })
      ) : (
        <div style={{
          color: '#6b7280',
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '20px',
        }}>
          No representative assigned
        </div>
      )}
    </div>
  );
};

export default RepPopup;
