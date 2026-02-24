import brandTokens from '../../brandTokens';
import DEFAULT_CATEGORIES from '../../data/eventCategories';

const EventFilters = ({ filters, onFiltersChange, categories, showStatusFilter = false }) => {
  const cats = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const sharedStyle = {
    height: '38px',
    boxSizing: 'border-box',
    border: `1px solid ${brandTokens.colors.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: brandTokens.font,
    outline: 'none',
    backgroundColor: 'white',
  };

  const selectStyle = {
    ...sharedStyle,
    padding: '0 32px 0 12px',
    color: brandTokens.colors.text,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23535862' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '24px',
        alignItems: 'center',
      }}
    >
      {/* Search input */}
      <input
        type="text"
        placeholder="Search events..."
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        style={{
          ...sharedStyle,
          flex: 1,
          minWidth: '200px',
          padding: '0 12px',
        }}
        onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)}
        onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)}
      />

      {/* Category filter */}
      <select
        value={filters.category}
        onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
        style={selectStyle}
      >
        <option value="">All Categories</option>
        {cats.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Show past events toggle */}
      {filters.showPast !== undefined && (
        <button
          onClick={() => onFiltersChange({ ...filters, showPast: !filters.showPast })}
          style={{
            ...sharedStyle,
            padding: '0 14px',
            cursor: 'pointer',
            backgroundColor: filters.showPast ? brandTokens.colors.selected : 'white',
            color: filters.showPast ? 'white' : brandTokens.colors.text,
            borderColor: filters.showPast ? brandTokens.colors.selected : brandTokens.colors.border,
            fontWeight: '500',
            transition: 'all 0.15s ease',
          }}
        >
          Past Events
        </button>
      )}

      {/* Status filter (admin only) */}
      {showStatusFilter && (
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      )}
    </div>
  );
};

export default EventFilters;
