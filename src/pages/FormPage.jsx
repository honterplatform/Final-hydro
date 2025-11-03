import React, { useState, useEffect } from 'react';
import brandTokens from '../brandTokens';

const FormPage = () => {
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
    email: '',
    companyName: '',
    phoneNumber: '',
    zipCode: '',
    interestedIn: [],
    projectDetails: ''
  });

  const interestedOptions = [
    'Exterior/Stucco/Veneer',
    'Interior/Drywall',
    'Shower Systems',
    'Other'
  ];

  const handleInterestedInToggle = (option) => {
    setFormData(prev => {
      const current = prev.interestedIn || [];
      if (current.includes(option)) {
        return { ...prev, interestedIn: current.filter(item => item !== option) };
      } else {
        return { ...prev, interestedIn: [...current, option] };
      }
    });
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      // Validate at least one interest selected
      if (formData.interestedIn.length === 0) {
        setSubmitError(true);
        setIsSubmitting(false);
        return;
      }
      setSubmitError(false);

      // Use URLSearchParams to send data to Zapier webhook
      const params = new URLSearchParams({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        companyName: formData.companyName,
        phoneNumber: formData.phoneNumber,
        zipCode: formData.zipCode,
        interestedIn: formData.interestedIn.join(', '),
        projectDetails: formData.projectDetails
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
          email: '',
          companyName: '',
          phoneNumber: '',
          zipCode: '',
          interestedIn: [],
          projectDetails: ''
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
      padding: '60px 20px',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        padding: '40px'
      }}>
        {submitSuccess ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
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
            <form onSubmit={handleSubmit}>
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

              {/* Row 2: Email & Company Name */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '16px'
              }}>
                <input
                  type="email"
                  placeholder="email@email.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
                />
              </div>

              {/* Row 3: Phone Number & Zip Code */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '16px'
              }}>
                <input
                  type="tel"
                  placeholder="Phone Numer"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
                />
              </div>

              {/* Interested In Multi-Select */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  padding: '10px 0',
                  fontSize: '14px',
                  color: '#000000',
                  fontFamily: 'Aeonik, sans-serif',
                  marginBottom: '12px',
                  fontWeight: '400'
                }}>
                  Interested In
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '8px'
                }}>
                  {interestedOptions.map((option) => {
                    const isSelected = formData.interestedIn.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleInterestedInToggle(option)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          backgroundColor: isSelected ? 'rgba(80, 158, 46, 0.2)' : 'transparent',
                          color: isSelected ? '#509E2E' : '#6b7280',
                          border: isSelected ? '1px solid #509E2E' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'Aeonik, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.target.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {isSelected && (
                          <span style={{ fontSize: '12px' }}>✓</span>
                        )}
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Details Textarea */}
              <textarea
                placeholder="Tell us about your project"
                required
                value={formData.projectDetails}
                onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '100px',
                  marginBottom: '20px'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#509E2E'}
                onBlur={(e) => e.target.style.borderBottomColor = '#e5e7eb'}
              />

              {submitError && (
                <p style={{
                  color: '#e74c3c',
                  fontSize: '14px',
                  marginBottom: '15px',
                  fontFamily: 'Aeonik, sans-serif'
                }}>
                  {formData.interestedIn.length === 0 
                    ? 'Please select at least one interest option.'
                    : 'There was an error submitting your request. Please try again.'}
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
                  fontFamily: brandTokens.font,
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

export default FormPage;
