import React, { useState, useEffect } from 'react';
import brandTokens from '../brandTokens';
import { codeToName } from '../data/states';
import { getReps, createRep, updateRep, deleteRep, resetReps, subscribeToRepsUpdates } from '../services/apiService';

const AdminPanel = ({ onClose }) => {
  const [reps, setReps] = useState(null);
  const [editingRep, setEditingRep] = useState(null);
  const [formData, setFormData] = useState({
    rep: '',
    states: [],
    profileImage: '',
    email: '',
    phone: ''
  });

  // Load reps from API on component mount and set up real-time subscriptions
  useEffect(() => {
    const loadReps = async () => {
      try {
        const data = await getReps();
        setReps(data);
      } catch (error) {
        console.error('Failed to load representatives:', error);
        // Fallback to original data
        import('../data/reps').then(({ reps: originalReps }) => {
          setReps(originalReps);
        });
      }
    };
    
    loadReps();

    // Set up real-time subscription for live updates (with polling fallback)
    let subscription = null;
    
    const setupSubscription = async () => {
      try {
        subscription = await subscribeToRepsUpdates((payload) => {
          console.log('Admin panel received update:', payload);
          
          // Refresh data when any change occurs
          loadReps();
        });
      } catch (error) {
        console.error('Failed to set up admin subscription:', error);
      }
    };
    
    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Dispatch custom event when reps change
  useEffect(() => {
    if (reps !== null) {
      window.dispatchEvent(new CustomEvent('repsUpdated'));
    }
  }, [reps]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStateToggle = (stateCode) => {
    setFormData(prev => ({
      ...prev,
      states: prev.states.includes(stateCode)
        ? prev.states.filter(s => s !== stateCode)
        : [...prev.states, stateCode]
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rep.trim() || formData.states.length === 0) {
      alert('Representative name and at least one state are required.');
      return;
    }

    try {
      const repData = {
        rep: formData.rep.trim(),
        states: formData.states,
        profileImage: formData.profileImage || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null
      };

      if (editingRep !== null) {
        // Edit existing rep
        const updatedRep = await updateRep(reps[editingRep].id, repData);
        setReps(prev => prev.map((rep, i) => (i === editingRep ? updatedRep : rep)));
      } else {
        // Add new rep
        const newRep = await createRep(repData);
        setReps(prev => [...prev, newRep]);
      }

      // Reset form
      setFormData({ rep: '', states: [], profileImage: '', email: '', phone: '' });
      setEditingRep(null);
    } catch (error) {
      console.error('Error saving representative:', error);
      alert('Failed to save representative. Please try again.');
    }
  };

  const handleEdit = (index) => {
    const rep = reps[index];
    setFormData({
      rep: rep.rep || rep.rep_name || rep.representative || '',
      states: rep.states,
      profileImage: rep.profileImage || rep.profile_image || '',
      email: rep.email || '',
      phone: rep.phone || ''
    });
    setEditingRep(index);
  };

  const handleDelete = async (index) => {
    if (window.confirm('Are you sure you want to delete this representative?')) {
      try {
        await deleteRep(reps[index].id);
        setReps(prev => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error('Error deleting representative:', error);
        alert('Failed to delete representative. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ rep: '', states: [], profileImage: '', email: '', phone: '' });
    setEditingRep(null);
  };

  const resetToOriginal = async () => {
    if (window.confirm('This will reset all data to the original representatives. Are you sure?')) {
      try {
        await resetReps();
        const data = await getReps();
        setReps(data);
      } catch (error) {
        console.error('Error resetting representatives:', error);
        alert('Failed to reset representatives. Please try again.');
      }
    }
  };


  // Get all state codes for the state selector
  const allStates = Object.keys(codeToName).sort();

  // Show loading state while data is being loaded
  if (reps === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontFamily: brandTokens.font,
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: brandTokens.radii.card,
          padding: '40px',
          textAlign: 'center',
          boxShadow: brandTokens.shadow,
          border: `1px solid ${brandTokens.colors.border}`,
        }}>
          <p style={{ margin: 0, color: brandTokens.colors.text }}>Loading representatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: brandTokens.radii.card,
      padding: '20px',
      maxWidth: '800px',
      width: '100%',
      margin: '0 auto',
      fontFamily: brandTokens.font,
      boxShadow: brandTokens.shadow,
      border: `1px solid ${brandTokens.colors.border}`,
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${brandTokens.colors.border}`,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '400',
          color: brandTokens.colors.text,
        }}>
          Manage Representatives
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '400',
            color: brandTokens.colors.text,
          }}>
            Representative Name(s)
          </label>
          <input
            type="text"
            value={formData.rep}
            onChange={(e) => handleInputChange('rep', e.target.value)}
            placeholder="e.g., John Smith, Jane Doe & Bob Johnson"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1px solid ${brandTokens.colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: brandTokens.font,
              outline: 'none',
              backgroundColor: 'white',
            }}
            onFocus={(e) => e.target.style.borderColor = brandTokens.colors.selected}
            onBlur={(e) => e.target.style.borderColor = brandTokens.colors.border}
          />
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '11px',
            color: '#6b7280',
          }}>
            Separate multiple names with commas or "&"
          </p>
        </div>

        {/* Profile Image Upload */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '400',
            color: brandTokens.colors.text,
          }}>
            Profile Image
          </label>
          
          {formData.profileImage ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              border: `1px solid ${brandTokens.colors.border}`,
              borderRadius: '6px',
              backgroundColor: brandTokens.colors.card,
            }}>
              <img
                src={formData.profileImage}
                alt="Profile preview"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `1px solid ${brandTokens.colors.border}`,
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: '0 0 2px 0',
                  fontSize: '12px',
                  color: brandTokens.colors.text,
                }}>
                  Image uploaded
                </p>
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              border: `1px dashed ${brandTokens.colors.border}`,
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: brandTokens.colors.card,
              cursor: 'pointer',
              transition: 'border-color 160ms ease',
            }}
            onClick={() => document.getElementById('imageUpload').click()}
            onMouseEnter={(e) => e.target.style.borderColor = brandTokens.colors.selected}
            onMouseLeave={(e) => e.target.style.borderColor = brandTokens.colors.border}
            >
              <div style={{
                fontSize: '20px',
                color: '#9ca3af',
                marginBottom: '6px',
              }}>
                📷
              </div>
              <p style={{
                margin: '0 0 2px 0',
                fontSize: '12px',
                color: brandTokens.colors.text,
              }}>
                Click to upload profile image
              </p>
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: '#6b7280',
              }}>
                PNG, JPG up to 2MB
              </p>
            </div>
          )}
          
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '400',
            color: brandTokens.colors.text,
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g., john@hydroblok.com"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${brandTokens.colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: brandTokens.colors.background,
              color: brandTokens.colors.text,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Phone Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '400',
            color: brandTokens.colors.text,
          }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="e.g., (555) 123-4567"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${brandTokens.colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: brandTokens.colors.background,
              color: brandTokens.colors.text,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '400',
            color: brandTokens.colors.text,
          }}>
            States Covered
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '6px',
            maxHeight: '180px',
            overflowY: 'auto',
            padding: '10px',
            border: `1px solid ${brandTokens.colors.border}`,
            borderRadius: '6px',
            backgroundColor: brandTokens.colors.card,
          }}>
            {allStates.map(stateCode => (
              <label key={stateCode} style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                color: brandTokens.colors.text,
              }}>
                <input
                  type="checkbox"
                  checked={formData.states.includes(stateCode)}
                  onChange={() => handleStateToggle(stateCode)}
                  style={{ marginRight: '6px' }}
                />
                {codeToName[stateCode]}
              </label>
            ))}
          </div>
        </div>


        <div style={{
          display: 'flex',
          gap: '10px',
        }}>
          <button
            type="submit"
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
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = brandTokens.colors.selected}
          >
            {editingRep !== null ? 'Update Representative' : 'Add Representative'}
          </button>
          
          {editingRep !== null && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '400',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Current Representatives */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '400',
            color: brandTokens.colors.text,
          }}>
            Current Representatives ({reps.length})
          </h3>
          <button
            onClick={resetToOriginal}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Reset to Original
          </button>
        </div>

        <div style={{
          maxHeight: '280px',
          overflowY: 'auto',
          border: `1px solid ${brandTokens.colors.border}`,
          borderRadius: '6px',
          backgroundColor: brandTokens.colors.card,
        }}>
          {reps.map((rep, index) => (
            <div key={index} style={{
              padding: '12px 16px',
              borderBottom: index < reps.length - 1 ? `1px solid ${brandTokens.colors.border}` : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'white',
              margin: index === 0 ? '0' : '0',
              borderRadius: index === 0 ? '6px 6px 0 0' : index === reps.length - 1 ? '0 0 6px 6px' : '0',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                flex: 1 
              }}>
                {(rep.profile_image || rep.profileImage) ? (
                  <img
                    src={rep.profile_image || rep.profileImage}
                    alt={`${rep.rep || rep.rep_name || rep.representative || 'Representative'} profile`}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `1px solid ${brandTokens.colors.border}`,
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
                      fontSize: '16px',
                      fontWeight: '500',
                    }}>
                      {(rep.rep || rep.rep_name || rep.representative || 'R').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 2px 0',
                  fontSize: '14px',
                  fontWeight: '400',
                  color: brandTokens.colors.text,
                }}>
                  {rep.rep || rep.rep_name || rep.representative || 'Unknown Representative'}
                </h4>
                <p style={{
                  margin: '0 0 2px 0',
                  fontSize: '12px',
                  color: '#6b7280',
                }}>
                  States: {rep.states.map(code => codeToName[code]).join(', ')}
                </p>
                {rep.email && (
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '11px',
                    color: '#9ca3af',
                  }}>
                    Email: {rep.email}
                  </p>
                )}
                {rep.phone && (
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '11px',
                    color: '#9ca3af',
                  }}>
                    Phone: {rep.phone}
                  </p>
                )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleEdit(index)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {reps.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              No representatives added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;