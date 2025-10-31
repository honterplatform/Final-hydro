import { useState, useEffect, useRef } from 'react';
import brandTokens from '../brandTokens';

const RepPopup = ({ visible, x, y, reps, stateName, selectedCode, onClose, onRepHover, onRepLeave }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showingContactInfo, setShowingContactInfo] = useState(null);
  const popupRef = useRef(null);
  const contactTimerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Reset contact info state when popup opens
      setShowingContactInfo(null);
      // Clear any existing timer
      if (contactTimerRef.current) {
        clearTimeout(contactTimerRef.current);
        contactTimerRef.current = null;
      }
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

    const handleResize = () => {
      // Force re-render on window resize to recalculate positioning
      if (visible) {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 10);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [visible, onClose]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (contactTimerRef.current) {
        clearTimeout(contactTimerRef.current);
      }
    };
  }, []);

  const handleLetsTalkClick = (repData, repIndex) => {
    // Clear any existing timer
    if (contactTimerRef.current) {
      clearTimeout(contactTimerRef.current);
    }

    // Set showing contact info for this specific rep
    setShowingContactInfo(repIndex);

    // Set timer to revert after 10 seconds
    contactTimerRef.current = setTimeout(() => {
      setShowingContactInfo(null);
    }, 10000);
  };

  const handleHideContact = () => {
    // Clear any existing timer
    if (contactTimerRef.current) {
      clearTimeout(contactTimerRef.current);
      contactTimerRef.current = null;
    }
    
    // Immediately hide contact info
    setShowingContactInfo(null);
  };

  if (!isVisible) return null;

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;
  
  // Smart positioning logic for desktop/tablet
  const getSmartPosition = () => {
    if (isMobile) {
      return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90vw',
        minWidth: '280px',
        maxHeight: '80vh',
        overflowY: 'auto',
      };
    }

    const popupWidth = 400; // maxWidth
    const popupHeight = 300; // estimated max height
    const margin = 20; // margin from edges
    
    let adjustedX = x;
    let adjustedY = y;
    let transformX = '-50%';
    let transformY = '-100%';
    
    // Check if popup would go off the right edge
    if (x + (popupWidth / 2) > window.innerWidth - margin) {
      adjustedX = window.innerWidth - margin - (popupWidth / 2);
    }
    
    // Check if popup would go off the left edge
    if (x - (popupWidth / 2) < margin) {
      adjustedX = margin + (popupWidth / 2);
    }
    
    // Check if popup would go off the top edge
    if (y - popupHeight < margin) {
      // Position below the click point instead of above
      adjustedY = y + 20; // small offset below the click
      transformY = '0%';
    }
    
    // Check if popup would go off the bottom edge when positioned below
    if (y + popupHeight > window.innerHeight - margin) {
      // Position above the click point
      adjustedY = y - 10;
      transformY = '-100%';
    }

    return {
      left: adjustedX,
      top: adjustedY,
      transform: `translate(${transformX}, ${transformY})`,
      maxWidth: '400px',
      minWidth: '360px',
    };
  };

  const mobileStyle = getSmartPosition();

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
        transition: 'opacity 200ms ease, transform 200ms ease',
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
                   fontWeight: '200',
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
          const repName = repData.rep || repData.rep_name || repData.representative || '';
          const individualReps = repName
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
                             {showingContactInfo === repIndex ? (
                               <>
                                 <h4 style={{
                                   fontSize: isMobile ? '14px' : '16px',
                                   fontWeight: '400',
                                   margin: '0 0 2px 0',
                                   color: brandTokens.colors.text,
                                 }}>
                                   {repData.email || 'No email available'}
                                 </h4>
                                 <p style={{
                                   fontSize: isMobile ? '11px' : '12px',
                                   color: '#6b7280',
                                   margin: 0,
                                 }}>
                                   {repData.phone || 'No phone available'}
                                 </p>
                               </>
                             ) : (
                               <>
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
                               </>
                             )}
                           </div>
                         </div>
                         {showingContactInfo === repIndex ? (
                           <button
                             onClick={handleHideContact}
                             style={{
                               background: brandTokens.colors.selected,
                               color: 'white',
                               border: 'none',
                               borderRadius: '50%',
                               width: isMobile ? '28px' : '32px',
                               height: isMobile ? '28px' : '32px',
                               fontSize: isMobile ? '16px' : '18px',
                               fontWeight: '400',
                               cursor: 'pointer',
                               marginLeft: isMobile ? '8px' : '12px',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               padding: 0,
                             }}
                             title="Hide contact info"
                           >
                             ×
                           </button>
                         ) : (
                           <button
                             onClick={() => handleLetsTalkClick(repData, repIndex)}
                             style={{
                               background: brandTokens.colors.selected,
                               color: 'white',
                               border: 'none',
                               borderRadius: '6px',
                               padding: isMobile ? '6px 12px' : '8px 16px',
                               fontSize: isMobile ? '12px' : '14px',
                               fontWeight: '400',
                               cursor: 'pointer',
                               marginLeft: isMobile ? '8px' : '12px',
                             }}
                           >
                             Let's Talk
                           </button>
                         )}
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
