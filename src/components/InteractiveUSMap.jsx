import React, { useState, useMemo, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { getReps, subscribeToRepsUpdates } from '../services/apiService';
import { nameToCode, codeToName } from '../data/states';
import brandTokens from '../brandTokens';
import Tooltip from './Tooltip';
import RepPopup from './RepPopup';
import MobileStateList from './MobileStateList';
import styles from '../styles/map.module.css';


const InteractiveUSMap = () => {
  const [hoverCode, setHoverCode] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [highlightedStates, setHighlightedStates] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for localStorage changes to refresh data
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from admin panel
    window.addEventListener('repsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('repsUpdated', handleStorageChange);
    };
  }, []);

  // State for storing reps data
  const [repsData, setRepsData] = useState([]);

  // Load reps data and set up real-time subscriptions
  useEffect(() => {
    const loadReps = async () => {
      try {
        const reps = await getReps();
        setRepsData(reps);
      } catch (error) {
        console.error('Error loading reps:', error);
        setRepsData([]);
      }
    };
    
    loadReps();

    // Set up real-time subscription for live updates (with polling fallback)
    let subscription = null;
    
    const setupSubscription = async () => {
      try {
        subscription = await subscribeToRepsUpdates((payload) => {
          console.log('Update received:', payload);
          
          // Refresh data when any change occurs
          loadReps();
        });
      } catch (error) {
        console.error('Failed to set up subscription:', error);
      }
    };
    
    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [refreshKey]);


  // Build repsByState mapping
  const repsByState = useMemo(() => {
    const mapping = {};
    repsData.forEach(repData => {
      if (repData.states && Array.isArray(repData.states)) {
        repData.states.forEach(stateCode => {
          if (!mapping[stateCode]) {
            mapping[stateCode] = [];
          }
          // Add the representative to each state they cover (no duplicate check)
          mapping[stateCode].push({
            rep: repData.rep || repData.rep_name || repData.representative || '',
            states: repData.states,
            ctaUrl: repData.cta_url || repData.ctaUrl || '#',
            profileImage: repData.profileImage || repData.profile_image
          });
        });
      }
    });
    return mapping;
  }, [repsData]);

  const handleStateClick = (stateCode, event) => {
    setSelectedCode(stateCode);
    setClickPos({ x: event.clientX, y: event.clientY });
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedCode(null);
  };

  const handleMobileStateSelect = (stateCode, stateReps) => {
    setSelectedCode(stateCode);
    setShowPopup(true);
  };

  const handleRepCardHover = (repStates) => {
    setHighlightedStates(repStates);
  };

  const handleRepCardLeave = () => {
    setHighlightedStates([]);
  };

  const getStateFill = (stateCode) => {
    if (selectedCode === stateCode) {
      return brandTokens.colors.selected;
    }
    if (hoverCode === stateCode) {
      return brandTokens.colors.hover;
    }
    if (highlightedStates.includes(stateCode)) {
      return '#E8F5E8'; // Light green highlight
    }
    if (repsByState[stateCode] && repsByState[stateCode].length > 0) {
      return brandTokens.colors.assigned;
    }
    return brandTokens.colors.unassigned;
  };

  const getTooltipContent = (stateCode) => {
    const stateName = codeToName[stateCode];
    const stateReps = repsByState[stateCode];
    
    if (stateReps && stateReps.length > 0) {
      const repNames = stateReps.map(r => r.rep).join(', ');
      return `${stateCode} • ${repNames}`;
    }
    return `${stateCode} • No rep assigned`;
  };

  const selectedReps = selectedCode ? repsByState[selectedCode] || [] : [];

  // Render mobile list view on small screens
  if (isMobile) {
    return (
      <div className={styles.mobileListContainer}>
        <MobileStateList 
          onStateSelect={handleMobileStateSelect}
          onRepHover={handleRepCardHover}
          onRepLeave={handleRepCardLeave}
        />
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      {repsData.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading map...
        </div>
      ) : (
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1200,
            translate: [0, 0]
          }}
          className={styles.mapSvg}
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
            {({ geographies }) => 
              geographies
                .filter((geo) => nameToCode[geo.properties.name])
                .map((geo) => {
                  const stateCode = nameToCode[geo.properties.name];
                  
                  const reps = repsByState[stateCode];
                  
                  return (
                    <React.Fragment key={geo.rsmKey}>
                      <Geography
                        geography={geo}
                        fill={getStateFill(stateCode)}
                        stroke="white"
                        strokeWidth={0.8}
                        className={styles.statePath}
                        onMouseEnter={() => setHoverCode(stateCode)}
                        onMouseLeave={() => setHoverCode(null)}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.closest('svg').getBoundingClientRect();
                          setMousePos({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                          });
                        }}
                        onClick={(e) => handleStateClick(stateCode, e)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleStateClick(stateCode, e);
                          }
                        }}
                      />
                    </React.Fragment>
                  );
                })
            }
          </Geographies>
        </ComposableMap>
      )}


      
      <Tooltip
        visible={hoverCode !== null}
        x={mousePos.x}
        y={mousePos.y}
        content={hoverCode ? getTooltipContent(hoverCode) : ''}
      />

      <RepPopup
        visible={showPopup}
        x={clickPos.x}
        y={clickPos.y}
        reps={selectedReps}
        stateName={selectedCode ? codeToName[selectedCode] : ''}
        selectedCode={selectedCode}
        onClose={handleClosePopup}
        onRepHover={handleRepCardHover}
        onRepLeave={handleRepCardLeave}
      />
    </div>
  );
};

export default InteractiveUSMap;
