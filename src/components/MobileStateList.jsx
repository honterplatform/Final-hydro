import React, { useState, useMemo, useEffect } from 'react';
import brandTokens from '../brandTokens';
import { getReps } from '../services/repService';
import { codeToName } from '../data/states';

const MobileStateList = ({ onStateSelect, onRepHover, onRepLeave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [repsData, setRepsData] = useState([]);
  const ITEMS_PER_PAGE = 10;

  // Load reps data
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
  }, [refreshKey]);

  // Listen for localStorage changes to refresh data
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('repsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('repsUpdated', handleStorageChange);
    };
  }, []);

  // Create a mapping of states to their representatives
  const stateReps = useMemo(() => {
    const mapping = {};
    repsData.forEach(repData => {
      if (repData.states && Array.isArray(repData.states)) {
        repData.states.forEach(stateCode => {
          if (!mapping[stateCode]) {
            mapping[stateCode] = [];
          }
          if (!mapping[stateCode].find(r => r.rep === repData.rep)) {
            mapping[stateCode].push({
              rep: repData.rep,
              states: repData.states,
              ctaUrl: repData.cta_url,
              profileImage: repData.profile_image
            });
          }
        });
      }
    });
    return mapping;
  }, [repsData]);

  // Get all states that have representatives
  const statesWithReps = useMemo(() => {
    return Object.keys(stateReps).sort();
  }, [stateReps]);

  // Filter states based on search term
  const filteredStates = useMemo(() => {
    if (!searchTerm) return statesWithReps;
    return statesWithReps.filter(stateCode => 
      codeToName[stateCode].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [statesWithReps, searchTerm]);

  // Paginate the filtered states
  const totalPages = Math.ceil(filteredStates.length / ITEMS_PER_PAGE);
  const paginatedStates = filteredStates.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Reset to first page when search changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleStateClick = (stateCode) => {
    setSelectedState(stateCode);
    onStateSelect(stateCode, stateReps[stateCode]);
  };

  const handleRepClick = (repData) => {
    // Split combined names and handle each individually
    const individualReps = repData.rep
      .split(/,\s*|\s+&\s+/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    // For now, just open the first rep's URL
    if (repData.ctaUrl && repData.ctaUrl !== '#') {
      window.open(repData.ctaUrl, '_blank');
    }
  };

  if (selectedState) {
    const reps = stateReps[selectedState];
    return (
      <div style={{
        padding: '16px',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: 'white',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${brandTokens.colors.border}`,
        }}>
          <button
            onClick={() => setSelectedState(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              marginRight: '12px',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ←
          </button>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '400',
            color: brandTokens.colors.text,
          }}>
            {codeToName[selectedState]}
          </h2>
        </div>

        {/* Representatives */}
        <div style={{ paddingBottom: '20px' }}>
          {repsData
            .filter(repData => repData.states && repData.states.includes(selectedState))
            .flatMap((repData, repIndex) => {
              const individualReps = repData.rep
                .split(/,\s*|\s+&\s+/)
                .map(name => name.trim())
                .filter(name => name.length > 0);
              
              return individualReps.map((individualName, nameIndex) => {
                const allStates = repData.states || [];
                const otherStates = allStates.filter(stateCode => stateCode !== selectedState);
              
              return (
                <div 
                  key={`${repIndex}-${nameIndex}`} 
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: `1px solid ${brandTokens.colors.border}`,
                    cursor: 'pointer',
                    transition: 'background-color 160ms ease',
                  }}
                  onMouseEnter={() => onRepHover && onRepHover(allStates)}
                  onMouseLeave={() => onRepLeave && onRepLeave()}
                  onTouchStart={() => onRepHover && onRepHover(allStates)}
                  onTouchEnd={() => onRepLeave && onRepLeave()}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      flex: 1,
                    }}>
                      {repData.profileImage ? (
                        <img
                          src={repData.profileImage}
                          alt={`${individualName} profile`}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{
                            color: '#9ca3af',
                            fontSize: '18px',
                            fontWeight: '500',
                          }}>
                            {individualName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '400',
                          margin: '0 0 4px 0',
                          color: brandTokens.colors.text,
                        }}>
                          {individualName}
                        </h3>
                        {otherStates.length > 0 && (
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            margin: 0,
                          }}>
                            Also available in {otherStates.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRepClick(repData)}
                      style={{
                        background: brandTokens.colors.selected,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'background-color 160ms ease',
                        marginLeft: '12px',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = brandTokens.colors.selected}
                    >
                      Let's Talk
                    </button>
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      height: '100vh',
      overflowY: 'auto',
      backgroundColor: 'white',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${brandTokens.colors.border}`,
      }}>
        <h1 style={{
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: '400',
          color: brandTokens.colors.text,
        }}>
          Find Your Rep
        </h1>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search states..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${brandTokens.colors.border}`,
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: brandTokens.font,
            outline: 'none',
            backgroundColor: 'white',
          }}
          onFocus={(e) => e.target.style.borderColor = brandTokens.colors.selected}
          onBlur={(e) => e.target.style.borderColor = brandTokens.colors.border}
        />
      </div>

      {/* States List */}
      <div>
        {paginatedStates.length > 0 ? (
          <>
            {paginatedStates.map(stateCode => (
              <div
                key={stateCode}
                onClick={() => handleStateClick(stateCode)}
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${brandTokens.colors.border}`,
                  cursor: 'pointer',
                  transition: 'background-color 160ms ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <h3 style={{
                      margin: '0 0 2px 0',
                      fontSize: '15px',
                      fontWeight: '400',
                      color: brandTokens.colors.text,
                    }}>
                      {codeToName[stateCode]}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#6b7280',
                    }}>
                      {stateReps[stateCode].length} rep{stateReps[stateCode].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '14px',
                  }}>
                    →
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px',
                gap: '8px',
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  style={{
                    background: currentPage === 0 ? '#f3f4f6' : brandTokens.colors.selected,
                    color: currentPage === 0 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 0 ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>
                
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  padding: '0 8px',
                }}>
                  {currentPage + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  style={{
                    background: currentPage === totalPages - 1 ? '#f3f4f6' : brandTokens.colors.selected,
                    color: currentPage === totalPages - 1 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280',
          }}>
            {searchTerm ? 'No states found matching your search.' : 'No states available.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileStateList;
