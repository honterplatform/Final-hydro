import brandTokens from '../brandTokens';

const Tooltip = ({ visible, x, y, content }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(8px, -8px)',
        backgroundColor: 'white',
        border: `1px solid ${brandTokens.colors.border}`,
        borderRadius: brandTokens.radii.chip,
        boxShadow: brandTokens.shadow,
        fontSize: '12px',
        padding: '6px 8px',
        pointerEvents: 'none',
        zIndex: 1000,
        fontFamily: brandTokens.font,
        color: brandTokens.colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      {content}
    </div>
  );
};

export default Tooltip;
