import React, { useState, useEffect } from 'react';
import brandTokens from '../brandTokens';

const SimpleFormPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      // Use URLSearchParams to send data to Zapier webhook
      const params = new URLSearchParams({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email
      });

      // Use no-cors mode for Zapier webhooks
      await fetch('https://hooks.zapier.com/hooks/catch/9970204/uiib0ib/', {
        method: 'POST',
        mode: 'no-cors',
        body: params
      });

      // Since we can't verify the response with no-cors, assume success
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: ''
        });
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(true);
      setIsSubmitting(false);
    }
  };

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
    backgroundColor: 'transparent'
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: brandTokens.colors.bg,
      fontFamily: brandTokens.font,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        maxWidth: isMobile ? '100%' : '520px',
        width: '100%',
        padding: 0
      }}>
        {submitSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h2 style={{
              color: '#509E2E',
              marginBottom: '10px',
              fontFamily: 'Aeonik, sans-serif',
              fontSize: '24px',
              fontWeight: '500'
            }}>
              Thank You!
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#6b7280',
              fontFamily: 'Aeonik, sans-serif'
            }}>
              Your form has been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ padding: 0, margin: 0 }}>
              {/* Row 1: First Name & Last Name */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '16px'
              }}>
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
                />
              </div>

              {/* Row 2: Phone Number & Email */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '8px'
              }}>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
                />
              </div>

              {submitError && (
                <p style={{
                  color: '#e74c3c',
                  fontSize: '14px',
                  marginBottom: '15px',
                  fontFamily: 'Aeonik, sans-serif'
                }}>
                  There was an error submitting your request. Please try again.
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
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#429525')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#509E2E')}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleFormPage;

