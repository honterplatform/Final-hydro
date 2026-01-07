import React, { useState, useEffect } from 'react';
import RepGrid from '../components/RepGrid';
import brandTokens from '../brandTokens';
import { getReps } from '../services/apiService';

const RepGridPage = () => {
  const [reps, setReps] = useState([]);

  useEffect(() => {
    const loadReps = async () => {
      try {
        const data = await getReps();
        console.log('RepGridPage: Loaded reps from API:', data?.length || 0, data);
        
        if (!data || data.length === 0) {
          console.warn('RepGridPage: No data returned, using fallback');
          const { reps: originalReps } = await import('../data/reps.js');
          setReps(originalReps);
          return;
        }
        
        // Normalize data structure (Supabase uses snake_case, components expect camelCase)
        const normalizedData = data.map(rep => ({
          ...rep,
          rep: rep.rep || rep.rep_name || rep.representative || '',
          states: rep.states || [],
          phone: rep.phone || '',
          showInGrid: rep.showInGrid !== undefined && rep.showInGrid !== null ? rep.showInGrid : 
                      (rep.show_in_grid !== undefined && rep.show_in_grid !== null ? rep.show_in_grid : true)
        }));
        
        // Filter to only show reps that should appear in grid
        const gridReps = normalizedData.filter(rep => rep.showInGrid);
        console.log('RepGridPage: Filtered grid reps:', gridReps.length, gridReps);
        setReps(gridReps);
      } catch (error) {
        console.error('RepGridPage: Failed to load representatives:', error);
        // Fallback to original data
        try {
          const { reps: originalReps } = await import('../data/reps.js');
          console.log('RepGridPage: Using fallback data:', originalReps.length);
          setReps(originalReps);
        } catch (fallbackError) {
          console.error('RepGridPage: Fallback also failed:', fallbackError);
          setReps([]);
        }
      }
    };
    
    loadReps();
  }, []);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: brandTokens.colors.bg,
      fontFamily: brandTokens.font,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <RepGrid reps={reps} />
    </div>
  );
};

export default RepGridPage;

