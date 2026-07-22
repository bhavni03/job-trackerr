import { useState } from 'react';
import { signup, login } from '../api';

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = isLogin
        ? await login({ email, password })
        : await signup({ email, password });

      localStorage.setItem('token', res.data.token);
      onAuthSuccess(res.data.user);
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <p className="toggle-auth">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button className="link-button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Sign Up' : 'Log In'}
        </button>
      </p>
    </div>
  );
}

export default Auth;