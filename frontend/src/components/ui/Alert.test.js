import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';  // Import MemoryRouter
import App from './App';  // Assuming your App component is in the same directory

test('renders learn react link', () => {
  // Wrap App inside MemoryRouter for the test
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
