import { useState, useEffect } from 'react';
import EventsAdminPanel from '../components/events/EventsAdminPanel';
import brandTokens from '../brandTokens';
import { signIn, signOut, getSession, checkAdminAccess, onAuthStateChange } from '../services/authService';

const EventsAdminPage = () => {
  const [authState, setAuthState] = useState('loading'); // loading | login | denied | admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const verifyAdmin = async (session) => {
    if (!session) {
      setAuthState('login');
      return;
    }
    try {
      const isAdmin = await checkAdminAccess(session.user.email);
      setUserEmail(session.user.email);
      setAuthState(isAdmin ? 'admin' : 'denied');
    } catch (err) {
      console.error('Admin check failed:', err);
      setAuthState('denied');
    }
  };

  useEffect(() => {
    getSession().then(verifyAdmin).catch(() => setAuthState('login'));

    const subscription = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setAuthState('login');
        setUserEmail('');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        verifyAdmin(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { session } = await signIn(email.trim(), password);
      setPassword('');
      await verifyAdmin(session);
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthState('login');
    setUserEmail('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const pageStyle = {
    width: '100%',
    minHeight: window.parent !== window ? 'auto' : '100vh',
    backgroundColor: brandTokens.colors.bg,
    fontFamily: brandTokens.font,
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  };

  const headerStyle = {
    backgroundColor: 'white',
    borderBottom: `1px solid ${brandTokens.colors.border}`,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle = {
    margin: 0,
    fontSize: '24px',
    fontWeight: '400',
    color: brandTokens.colors.text,
  };

  const inputStyle = {
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

  const buttonStyle = {
    width: '100%',
    padding: '10px 16px',
    background: brandTokens.colors.selected,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: submitting ? 'default' : 'pointer',
    fontFamily: brandTokens.font,
    opacity: submitting ? 0.7 : 1,
  };

  // Loading
  if (authState === 'loading') {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Events Admin</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <p style={{ color: brandTokens.colors.text }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Login form
  if (authState === 'login') {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Events Admin</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', padding: '20px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: brandTokens.radii.card,
            padding: '32px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: brandTokens.shadow,
            border: `1px solid ${brandTokens.colors.border}`,
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '400', color: brandTokens.colors.text, textAlign: 'center' }}>
              Admin Login
            </h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: brandTokens.colors.text }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)}
                  onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: brandTokens.colors.text }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = brandTokens.colors.selected)}
                  onBlur={(e) => (e.target.style.borderColor = brandTokens.colors.border)}
                />
              </div>
              {error && (
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={submitting} style={buttonStyle}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Access denied
  if (authState === 'denied') {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Events Admin</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', padding: '20px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: brandTokens.radii.card,
            padding: '32px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: brandTokens.shadow,
            border: `1px solid ${brandTokens.colors.border}`,
            textAlign: 'center',
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '400', color: brandTokens.colors.text }}>
              Access Denied
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>
              {userEmail} is not authorized to access the admin panel.
            </p>
            <button
              onClick={handleSignOut}
              style={{ ...buttonStyle, background: '#6b7280' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated admin
  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Events Admin</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{userEmail}</span>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: `1px solid ${brandTokens.colors.border}`,
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              color: brandTokens.colors.text,
              cursor: 'pointer',
              fontFamily: brandTokens.font,
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <EventsAdminPanel />
      </div>
    </div>
  );
};

export default EventsAdminPage;
