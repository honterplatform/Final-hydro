import React from 'react';
import RepGrid from '../components/RepGrid';
import brandTokens from '../brandTokens';
import { reps } from '../data/reps';

const RepGridPage = () => {
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

