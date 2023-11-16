import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders RoadSafe Sweden header', () => {
  render(<App />);
  const headerElement = screen.getByText(/RoadSafe Sweden/i);
  expect(headerElement).toBeInTheDocument();
});

