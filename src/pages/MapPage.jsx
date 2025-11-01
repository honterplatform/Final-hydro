import React from 'react';
import InteractiveUSMap from '../components/InteractiveUSMap';
import RepGrid from '../components/RepGrid';
import brandTokens from '../brandTokens';
import { reps } from '../data/reps';

const MapPage = () => {
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
      <div style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <InteractiveUSMap />
      </div>
      <RepGrid reps={reps} />
    </div>
  );
};

export default MapPage;
