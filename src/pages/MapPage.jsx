import React, { useState, useEffect } from 'react';
import InteractiveUSMap from '../components/InteractiveUSMap';
import brandTokens from '../brandTokens';

const MapPage = () => {
  const [horizontalPadding, setHorizontalPadding] = useState('120px');

  useEffect(() => {
    const updatePadding = () => {
      const width = window.innerWidth;
      
      if (width >= 1440) {
        setHorizontalPadding('120px'); // Big screens
      } else if (width >= 1024) {
        setHorizontalPadding('90px'); // Laptops
      } else if (width >= 768) {
        setHorizontalPadding('40px'); // Tablets
      } else {
        setHorizontalPadding('20px'); // Mobile
      }
    };
    
    updatePadding();
    window.addEventListener('resize', updatePadding);
    
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      minHeight: '600px',
      backgroundColor: brandTokens.colors.bg,
      fontFamily: brandTokens.font,
      margin: 0,
      padding: `0 ${horizontalPadding}`,
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <InteractiveUSMap />
    </div>
  );
};

export default MapPage;
