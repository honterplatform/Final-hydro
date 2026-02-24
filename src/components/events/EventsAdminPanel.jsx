import { useState, useEffect, useMemo } from 'react';
import brandTokens from '../../brandTokens';
import {
  fetchEvents,
  addEvent,
  editEvent,
  removeEvent,
  fetchSignupsForEvent,
  fetchSignupCount,
  removeSignup,
  subscribeToEventsUpdates,
  subscribeToSignupsUpdates,
  fetchCategories,
  addCategory,
  editCategory,
  removeCategory,
} from '../../services/eventsApiService';

const emptyForm = {
  title: '',
  description: '',
  coverImage: '',
  eventDate: '',
  eventTime: '',
  location: '',
  category: 'general',
  capacity: '',
  signupEnabled: true,
  status: 'draft',
};

const EventsAdminPanel = () => {
  const [events, setEvents] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [activeTab, setActiveTab] = useState('events');
  const [signupCounts, setSignupCounts] = useState({});
  const [selectedEventForSignups, setSelectedEventForSignups] = useState('');
  const [signups, setSignups] = useState([]);
  const [loadingSignups, setLoadingSignups] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ value: '', label: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // Load categories
  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  // Load events
  const loadEvents = async () => {
    const data = await fetchEvents();
    setEvents(data);
    // Load signup counts
    const counts = {};
    await Promise.all(
      data.map(async (ev) => {
        counts[ev.id] = await fetchSignupCount(ev.id);
      })
    );
    setSignupCounts(counts);
  };

  useEffect(() => {
    loadEvents();
    loadCategories();

    let evSub = null;
    let sigSub = null;

    const setup = async () => {
      evSub = await subscribeToEventsUpdates(() => loadEvents());
      sigSub = await subscribeToSignupsUpdates(() => loadEvents());
    };
    setup();

    return () => {
      if (evSub && typeof evSub.unsubscribe === 'function') evSub.unsubscribe();
      if (sigSub && typeof sigSub.unsubscribe === 'function') sigSub.unsubscribe();
    };
  }, []);

  // Load signups when selecting an event in the signups tab
  useEffect(() => {
    if (!selectedEventForSignups) {
      setSignups([]);
      return;
    }
    setLoadingSignups(true);
    fetchSignupsForEvent(Number(selectedEventForSignups)).then((data) => {
      setSignups(data);
      setLoadingSignups(false);
    });
  }, [selectedEventForSignups]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, coverImage: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.eventDate) {
      alert('Title and date are required.');
      return;
    }

    try {
      const data = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        coverImage: formData.coverImage || null,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime || null,
        location: formData.location.trim() || null,
        category: formData.category,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        signupEnabled: formData.signupEnabled,
        status: formData.status,
      };

      if (editingIndex !== null) {
        const updated = await editEvent(events[editingIndex].id, data);
        setEvents((prev) => prev.map((ev, i) => (i === editingIndex ? updated : ev)));
      } else {
        const created = await addEvent(data);
        setEvents((prev) => [...prev, created]);
      }

      setFormData({ ...emptyForm });
      setEditingIndex(null);
    } catch (error) {
      alert('Failed to save event. Please try again.');
    }
  };

  const handleEdit = (index) => {
    const ev = events[index];
    setFormData({
      title: ev.title || '',
      description: ev.description || '',
      coverImage: ev.coverImage || '',
      eventDate: ev.eventDate || '',
      eventTime: ev.eventTime || '',
      location: ev.location || '',
      category: ev.category || 'general',
      capacity: ev.capacity || '',
      signupEnabled: ev.signupEnabled !== undefined ? ev.signupEnabled : true,
      status: ev.status || 'draft',
    });
    setEditingIndex(index);
    setActiveTab('events');
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Delete this event? This will also delete all signups for it.')) return;
    try {
      await removeEvent(events[index].id);
      setEvents((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      alert('Failed to delete event.');
    }
  };

  const handleDeleteSignup = async (signupId) => {
    if (!window.confirm('Remove this signup?')) return;
    try {
      await removeSignup(signupId);
      setSignups((prev) => prev.filter((s) => s.id !== signupId));
      // Refresh counts
      loadEvents();
    } catch (error) {
      alert('Failed to remove signup.');
    }
  };

  const exportCSV = () => {
    if (signups.length === 0) return;
    const eventTitle = events?.find((e) => e.id === Number(selectedEventForSignups))?.title || 'event';
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Signed Up At'];
    const rows = signups.map((s) => [s.firstName, s.lastName, s.email, s.phone || '', s.signedUpAt || '']);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '-')}-signups.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Analytics
  const analytics = useMemo(() => {
    if (!events) return null;
    const total = events.length;
    const published = events.filter((e) => e.status === 'published').length;
    const totalSignups = Object.values(signupCounts).reduce((a, b) => a + b, 0);
    return { total, published, totalSignups };
  }, [events, signupCounts]);

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '400',
    color: brandTokens.colors.text,
  };

  const fieldInputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${brandTokens.colors.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: brandTokens.font,
    outline: 'none',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  };

  const tabStyle = (isActive) => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: brandTokens.font,
    backgroundColor: isActive ? brandTokens.colors.selected : '#f3f4f6',
    color: isActive ? 'white' : '#6b7280',
    transition: 'background-color 160ms ease',
  });

  if (events === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', fontFamily: brandTokens.font }}>
        <div style={{ backgroundColor: 'white', borderRadius: brandTokens.radii.card, padding: '40px', textAlign: 'center', boxShadow: brandTokens.shadow, border: `1px solid ${brandTokens.colors.border}` }}>
          <p style={{ margin: 0, color: brandTokens.colors.text }}>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: brandTokens.radii.card, padding: '20px', maxWidth: '900px', width: '100%', margin: '0 auto', fontFamily: brandTokens.font, boxShadow: brandTokens.shadow, border: `1px solid ${brandTokens.colors.border}` }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid ${brandTokens.colors.border}` }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '400', color: brandTokens.colors.text }}>
          Manage Events
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button style={tabStyle(activeTab === 'events')} onClick={() => setActiveTab('events')}>Events</button>
        <button style={tabStyle(activeTab === 'signups')} onClick={() => setActiveTab('signups')}>Signups</button>
        <button style={tabStyle(activeTab === 'analytics')} onClick={() => setActiveTab('analytics')}>Analytics</button>
        <button style={tabStyle(activeTab === 'categories')} onClick={() => setActiveTab('categories')}>Categories</button>
      </div>

      {/* ============ EVENTS TAB ============ */}
      {activeTab === 'events' && (
        <>
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Title *</label>
              <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Event title" style={fieldInputStyle} onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)} onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Event description" rows={3} style={{ ...fieldInputStyle, resize: 'vertical', minHeight: '80px' }} onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)} onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)} />
            </div>

            {/* Cover Image */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Cover Image</label>
              {formData.coverImage ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: `1px solid ${brandTokens.colors.border}`, borderRadius: '6px', backgroundColor: brandTokens.colors.card }}>
                  <img src={formData.coverImage} alt="Cover preview" style={{ width: '80px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: `1px solid ${brandTokens.colors.border}` }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: brandTokens.colors.text }}>Image uploaded</p>
                    <button type="button" onClick={() => handleInputChange('coverImage', '')} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              ) : (
                <div style={{ border: `1px dashed ${brandTokens.colors.border}`, borderRadius: '6px', padding: '16px', textAlign: 'center', backgroundColor: brandTokens.colors.card, cursor: 'pointer', transition: 'border-color 160ms ease' }} onClick={() => document.getElementById('eventImageUpload').click()} onMouseEnter={(e) => (e.currentTarget.style.borderColor = brandTokens.colors.selected)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = brandTokens.colors.border)}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: brandTokens.colors.text }}>Click to upload cover image</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>PNG, JPG up to 2MB</p>
                </div>
              )}
              <input id="eventImageUpload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>

            {/* Date + Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Date *</label>
                <input type="date" value={formData.eventDate} onChange={(e) => handleInputChange('eventDate', e.target.value)} style={fieldInputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Time</label>
                <input type="time" value={formData.eventTime} onChange={(e) => handleInputChange('eventTime', e.target.value)} style={fieldInputStyle} />
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Location</label>
              <input type="text" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="e.g., Convention Center, Room 201" style={fieldInputStyle} onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)} onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)} />
            </div>

            {/* Category + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} style={fieldInputStyle}>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} style={fieldInputStyle}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Capacity */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Capacity</label>
              <input type="number" value={formData.capacity} onChange={(e) => handleInputChange('capacity', e.target.value)} placeholder="Leave empty for unlimited" min="1" style={fieldInputStyle} onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)} onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)} />
            </div>

            {/* Signup Enabled */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: '400', color: brandTokens.colors.text }}>
                <input type="checkbox" checked={formData.signupEnabled} onChange={(e) => handleInputChange('signupEnabled', e.target.checked)} style={{ marginRight: '8px' }} />
                Enable Signups
              </label>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ background: brandTokens.colors.selected, color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '14px', fontWeight: '400', cursor: 'pointer', transition: 'background-color 160ms ease' }} onMouseEnter={(e) => (e.target.style.backgroundColor = '#15803d')} onMouseLeave={(e) => (e.target.style.backgroundColor = brandTokens.colors.selected)}>
                {editingIndex !== null ? 'Update Event' : 'Add Event'}
              </button>
              {editingIndex !== null && (
                <button type="button" onClick={() => { setFormData({ ...emptyForm }); setEditingIndex(null); }} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '14px', fontWeight: '400', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Events list */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '400', color: brandTokens.colors.text }}>
              Current Events ({events.length})
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: `1px solid ${brandTokens.colors.border}`, borderRadius: '6px', backgroundColor: brandTokens.colors.card }}>
              {events.map((ev, index) => (
                <div key={ev.id} style={{ padding: '12px 16px', borderBottom: index < events.length - 1 ? `1px solid ${brandTokens.colors.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: index === 0 ? '6px 6px 0 0' : index === events.length - 1 ? '0 0 6px 6px' : '0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '400', color: brandTokens.colors.text }}>{ev.title}</h4>
                      <span style={{ padding: '1px 8px', borderRadius: '4px', fontSize: '11px', backgroundColor: ev.status === 'published' ? '#dcfce7' : '#f3f4f6', color: ev.status === 'published' ? '#166534' : '#6b7280' }}>{ev.status}</span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                      {new Date(ev.eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {ev.eventTime && ` at ${new Date('2000-01-01T' + ev.eventTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                      {' · '}{ev.category.replace('-', ' ')}
                      {' · '}{signupCounts[ev.id] || 0} signups
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleEdit(index)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(index)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No events yet.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============ SIGNUPS TAB ============ */}
      {activeTab === 'signups' && (
        <div>
          {/* Event selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Select Event</label>
            <select value={selectedEventForSignups} onChange={(e) => setSelectedEventForSignups(e.target.value)} style={fieldInputStyle}>
              <option value="">-- Choose an event --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title} ({signupCounts[ev.id] || 0} signups)</option>
              ))}
            </select>
          </div>

          {selectedEventForSignups && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '400', color: brandTokens.colors.text }}>
                  Signups ({signups.length})
                </h3>
                {signups.length > 0 && (
                  <button onClick={exportCSV} style={{ background: brandTokens.colors.selected, color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                    Export CSV
                  </button>
                )}
              </div>

              {loadingSignups ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Loading signups...</p>
              ) : signups.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No signups for this event yet.</p>
              ) : (
                <div style={{ border: `1px solid ${brandTokens.colors.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 80px', padding: '10px 16px', backgroundColor: brandTokens.colors.card, fontSize: '12px', fontWeight: '500', color: '#6b7280', borderBottom: `1px solid ${brandTokens.colors.border}` }}>
                    <span>Name</span>
                    <span>Email</span>
                    <span>Phone</span>
                    <span>Date</span>
                    <span></span>
                  </div>
                  {signups.map((s) => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 80px', padding: '10px 16px', borderBottom: `1px solid ${brandTokens.colors.border}`, fontSize: '13px', color: brandTokens.colors.text, backgroundColor: 'white', alignItems: 'center' }}>
                      <span>{s.firstName} {s.lastName}</span>
                      <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</span>
                      <span style={{ color: '#6b7280' }}>{s.phone || '-'}</span>
                      <span style={{ color: '#6b7280' }}>{s.signedUpAt ? new Date(s.signedUpAt).toLocaleDateString() : '-'}</span>
                      <button onClick={() => handleDeleteSignup(s.id)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', cursor: 'pointer', justifySelf: 'end' }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ============ ANALYTICS TAB ============ */}
      {activeTab === 'analytics' && analytics && (
        <div>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Events', value: analytics.total },
              { label: 'Published', value: analytics.published },
              { label: 'Total Signups', value: analytics.totalSignups },
            ].map((card) => (
              <div key={card.label} style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${brandTokens.colors.border}`, textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '400', color: brandTokens.colors.text }}>{card.value}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Per-event breakdown */}
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '400', color: brandTokens.colors.text }}>Event Breakdown</h3>
          <div style={{ border: `1px solid ${brandTokens.colors.border}`, borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr 0.8fr', padding: '10px 16px', backgroundColor: brandTokens.colors.card, fontSize: '12px', fontWeight: '500', color: '#6b7280', borderBottom: `1px solid ${brandTokens.colors.border}` }}>
              <span>Title</span>
              <span>Date</span>
              <span>Category</span>
              <span>Signups</span>
              <span>Capacity</span>
              <span>Fill Rate</span>
            </div>
            {events.map((ev) => {
              const count = signupCounts[ev.id] || 0;
              const fill = ev.capacity ? Math.round((count / ev.capacity) * 100) + '%' : 'N/A';
              return (
                <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr 0.8fr', padding: '10px 16px', borderBottom: `1px solid ${brandTokens.colors.border}`, fontSize: '13px', color: brandTokens.colors.text, backgroundColor: 'white' }}>
                  <span>{ev.title}</span>
                  <span style={{ color: '#6b7280' }}>{new Date(ev.eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>{ev.category.replace('-', ' ')}</span>
                  <span>{count}</span>
                  <span style={{ color: '#6b7280' }}>{ev.capacity || 'Unlimited'}</span>
                  <span style={{ color: fill !== 'N/A' && parseInt(fill) >= 80 ? '#dc2626' : '#6b7280' }}>{fill}</span>
                </div>
              );
            })}
            {events.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No events to analyze.</div>
            )}
          </div>
        </div>
      )}

      {/* ============ CATEGORIES TAB ============ */}
      {activeTab === 'categories' && (
        <div>
          {/* Add / Edit category form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!categoryForm.value.trim() || !categoryForm.label.trim()) {
                alert('Both value and label are required.');
                return;
              }
              try {
                if (editingCategoryId !== null) {
                  await editCategory(editingCategoryId, {
                    value: categoryForm.value.trim().toLowerCase().replace(/\s+/g, '-'),
                    label: categoryForm.label.trim(),
                  });
                } else {
                  await addCategory({
                    value: categoryForm.value.trim().toLowerCase().replace(/\s+/g, '-'),
                    label: categoryForm.label.trim(),
                    sortOrder: categories.length,
                  });
                }
                setCategoryForm({ value: '', label: '' });
                setEditingCategoryId(null);
                await loadCategories();
              } catch (error) {
                alert('Failed to save category. It may already exist.');
              }
            }}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Value (slug)</label>
                <input
                  type="text"
                  value={categoryForm.value}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., lunch-and-learn"
                  style={fieldInputStyle}
                  onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)}
                  onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)}
                />
              </div>
              <div>
                <label style={labelStyle}>Label (display name)</label>
                <input
                  type="text"
                  value={categoryForm.label}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Lunch & Learn"
                  style={fieldInputStyle}
                  onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)}
                  onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{
                    background: brandTokens.colors.selected,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '400',
                    cursor: 'pointer',
                    transition: 'background-color 160ms ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = brandTokens.colors.selected)}
                >
                  {editingCategoryId !== null ? 'Update' : 'Add'}
                </button>
                {editingCategoryId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryForm({ value: '', label: '' });
                      setEditingCategoryId(null);
                    }}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: '400',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Categories list */}
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '400', color: brandTokens.colors.text }}>
            Current Categories ({categories.length})
          </h3>
          <div style={{ border: `1px solid ${brandTokens.colors.border}`, borderRadius: '6px', backgroundColor: brandTokens.colors.card }}>
            {categories.map((cat, index) => (
              <div
                key={cat.id || cat.value}
                style={{
                  padding: '12px 16px',
                  borderBottom: index < categories.length - 1 ? `1px solid ${brandTokens.colors.border}` : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: index === 0 ? '6px 6px 0 0' : index === categories.length - 1 ? '0 0 6px 6px' : '0',
                }}
              >
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '400', color: brandTokens.colors.text }}>{cat.label}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>({cat.value})</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      setCategoryForm({ value: cat.value, label: cat.label });
                      setEditingCategoryId(cat.id);
                    }}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Delete category "${cat.label}"? Events using this category will keep their current value.`)) return;
                      try {
                        await removeCategory(cat.id);
                        await loadCategories();
                      } catch (error) {
                        alert('Failed to delete category.');
                      }
                    }}
                    style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No categories yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsAdminPanel;
