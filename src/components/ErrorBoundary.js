import React, { Component } from 'react';
import styled from '@emotion/styled';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 1rem;
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: #c53030;
  margin-bottom: 0.5rem;
  font-family: ${props => props.theme?.fonts?.primary || 'sans-serif'};
`;

const ErrorMessage = styled.p`
  color: #742a2a;
  margin-bottom: 1rem;
  font-family: ${props => props.theme?.fonts?.secondary || 'sans-serif'};
`;

const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #c53030;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: ${props => props.theme?.fonts?.primary || 'sans-serif'};

  &:hover {
    background-color: #9b2c2c;
  }
`;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: FallbackComponent } = this.props;

    if (hasError) {
      if (FallbackComponent) {
        return <FallbackComponent error={error} resetError={this.resetError} />;
      }

      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>{error?.message || 'An unexpected error occurred'}</ErrorMessage>
          <RetryButton onClick={this.resetError}>Try Again</RetryButton>
        </ErrorContainer>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
