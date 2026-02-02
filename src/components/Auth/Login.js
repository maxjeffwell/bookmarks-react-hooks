import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from './AuthContext';
import * as style from '../Breakpoints';

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
`;

const AuthForm = styled.form`
  font-family: ${props => props.theme.fonts.secondary};
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: ${props => props.theme.colors.secondary};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: ${style.breakpoint.tablet}) {
    padding: 1.5rem;
    max-width: 100%;
  }

  h2 {
    font-family: ${props => props.theme.fonts.primary};
    color: ${props => props.theme.colors.white};
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.75rem;
  }

  label {
    display: block;
    font-size: 1.25rem;
    color: ${props => props.theme.colors.white};
    margin-bottom: 0.5rem;
  }

  input {
    font-family: ${props => props.theme.fonts.quinary};
    font-size: 1.25rem;
    color: ${props => props.theme.colors.white};
    background: ${props => props.theme.colors.primary};
    border: 2px solid ${props => props.theme.colors.primary};
    border-radius: 5px;
    padding: 0.75rem;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 1.5rem;

    &::placeholder {
      color: ${props => props.theme.colors.white};
      opacity: 0.4;
    }

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.tertiary};
    }
  }

  button {
    font-family: ${props => props.theme.fonts.secondary};
    font-size: 1.25rem;
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.white};
    border: none;
    border-radius: 5px;
    padding: 0.75rem 1.5rem;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: ${props => props.theme.colors.tertiary};
      color: ${props => props.theme.colors.white};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: ${style.breakpoint.tablet}) {
      min-height: 44px;
      font-size: 1.1rem;
    }
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.tertiary};
  color: ${props => props.theme.colors.white};
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1rem;
`;

const AuthLink = styled.p`
  color: ${props => props.theme.colors.white};
  text-align: center;
  margin-top: 1.5rem;
  font-size: 1rem;

  a {
    color: ${props => props.theme.colors.tertiary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const DemoInfo = styled.div`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
  opacity: 0.8;

  strong {
    color: ${props => props.theme.colors.tertiary};
  }
`;

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login: authLogin, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      await authLogin(login.trim(), password);
      navigate('/bookmarks');
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthContainer>
      <AuthForm onSubmit={handleSubmit}>
        <h2>Sign In</h2>

        <DemoInfo>
          Demo account: <strong>demo</strong> / <strong>demo123</strong>
        </DemoInfo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div>
          <label htmlFor="login">Username or Email</label>
          <input
            id="login"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Enter username or email"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <AuthLink>
          Don't have an account? <Link to="/register">Create one</Link>
        </AuthLink>
      </AuthForm>
    </AuthContainer>
  );
}
