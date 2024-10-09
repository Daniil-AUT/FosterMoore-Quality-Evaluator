import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; 
import App from './components/App';  

test('renders the Predictor page by default', () => {
  // Wrap the App in MemoryRouter for Router context and render the component
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  
  // Check if the Predictor component is rendered by default on the "/" route
  const predictorElement = screen.getByText(/Evaluate Quality/i);  
  expect(predictorElement).toBeInTheDocument();
});

test('navigates to the Login page', () => {
  // Wrap the App in MemoryRouter and specify the initial entry as "/login" to test that route
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  );
  
  // Check if the Login component is rendered on the "/login" route
  const loginElement = screen.getByText(/Login/i);  
  expect(loginElement).toBeInTheDocument();
});
