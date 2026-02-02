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
  min-height: 100vh;
  padding: 2rem;
  background-color: #fa625f;
  box-sizing: border-box;
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

const FieldHint = styled.small`
  display: block;
  color: ${props => props.theme.colors.white};
  opacity: 0.6;
  font-size: 0.85rem;
  margin-top: -1rem;
  margin-bottom: 1rem;
`;

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const error = localError || authError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setLocalError('All fields are required');
      return;
    }

    if (username.length < 3 || username.length > 50) {
      setLocalError('Username must be 3-50 characters');
      return;
    }

    if (password.length < 7 || password.length > 72) {
      setLocalError('Password must be 7-72 characters');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthContainer>
      <AuthForm onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            autoComplete="username"
            minLength={3}
            maxLength={50}
            required
          />
          <FieldHint>3-50 characters</FieldHint>
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
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
            placeholder="Choose a password"
            autoComplete="new-password"
            minLength={7}
            maxLength={72}
            required
          />
          <FieldHint>7-72 characters</FieldHint>
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>

        <AuthLink>
          Already have an account? <Link to="/login">Sign in</Link>
        </AuthLink>
      </AuthForm>
    </AuthContainer>
  );
}
