import { useState } from 'react';
import { createPortal } from 'react-dom';
import brandTokens from '../../brandTokens';
import { addSignup } from '../../services/eventsApiService';

const inputStyle = {
  width: '100%',
  padding: '10px 0',
  marginBottom: '16px',
  border: 'none',
  borderBottom: '1px solid #e5e7eb',
  borderRadius: '0',
  fontSize: '14px',
  fontFamily: 'Aeonik, sans-serif',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: 'transparent',
};

const EventSignupForm = ({ event, visible, onClose, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await addSignup({
        eventId: event.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      });

      setSubmitSuccess(true);
      if (onSignupSuccess) onSignupSuccess();

      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setFormData({ firstName: '', lastName: '', email: '', phone: '' });
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      setSubmitError(error.message || 'There was an error. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '0 32px 32px 32px',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e7eb',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {submitSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2
              style={{
                color: '#509E2E',
                marginBottom: '10px',
                fontFamily: 'Aeonik, sans-serif',
                fontSize: '24px',
                fontWeight: '500',
              }}
            >
              Thank You!
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: '#6b7280',
                fontFamily: 'Aeonik, sans-serif',
              }}
            >
              You're signed up for {event.title}
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingTop: '25px',
                paddingBottom: '25px',
                borderBottom: `1px solid ${brandTokens.colors.border}`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '400',
                  color: brandTokens.colors.text,
                  fontFamily: 'Aeonik, sans-serif',
                }}
              >
                Sign Up
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  fontWeight: '200',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ paddingTop: '20px' }}>
              <input
                type="text"
                placeholder="First Name *"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderBottomColor = '#509E2E')}
                onBlur={(e) => (e.target.style.borderBottomColor = '#e5e7eb')}
              />

              <input
                type="text"
                placeholder="Last Name *"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderBottomColor = '#509E2E')}
                onBlur={(e) => (e.target.style.borderBottomColor = '#e5e7eb')}
              />

              <input
                type="email"
                placeholder="Email *"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderBottomColor = '#509E2E')}
                onBlur={(e) => (e.target.style.borderBottomColor = '#e5e7eb')}
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderBottomColor = '#509E2E')}
                onBlur={(e) => (e.target.style.borderBottomColor = '#e5e7eb')}
              />

              {submitError && (
                <p
                  style={{
                    color: '#e74c3c',
                    fontSize: '14px',
                    marginBottom: '15px',
                    fontFamily: 'Aeonik, sans-serif',
                  }}
                >
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#509E2E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'Aeonik, sans-serif',
                  opacity: isSubmitting ? 0.6 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#429525')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#509E2E')}
              >
                {isSubmitting ? 'Submitting...' : 'Sign Up'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default EventSignupForm;
