import React from 'react';
import InteractiveUSMap from '../components/InteractiveUSMap';
import brandTokens from '../brandTokens';

const MapPage = () => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: brandTokens.colors.bg,
      fontFamily: brandTokens.font,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <InteractiveUSMap />
    </div>
  );
};

export default MapPage;
