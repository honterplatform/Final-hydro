import React from 'react';
import InteractiveUSMap from '../components/InteractiveUSMap';
import RepGrid from '../components/RepGrid';
import brandTokens from '../brandTokens';
import { reps } from '../data/reps';

const MapPage = () => {
  return (
    <div style={{
      width: '100%',
      height: 'auto',
      backgroundColor: brandTokens.colors.bg,
      fontFamily: brandTokens.font,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        width: '100%',
        height: '800px',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0
      }}>
        <InteractiveUSMap />
      </div>
      <RepGrid reps={reps} />
    </div>
  );
};

export default MapPage;
