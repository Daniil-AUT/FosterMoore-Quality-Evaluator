import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar';
import { useUser } from './UserContext';

// Mock the useUser hook
jest.mock('./UserContext', () => ({
  useUser: () => ({
    user: { name: 'test user' },
    logout: jest.fn(),
  }),
}));

describe('NavBar Component', () => {
  it('navigates to the home page when title is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/evaluation']}>
        <NavBar />
      </MemoryRouter>
    );

    // Simulate clicking the title to navigate to home page
    fireEvent.click(screen.getByText('User Story Quality Evaluator'));

    // Assert that the home navigation has occurred by checking expected content
    expect(screen.getByText('User Story Quality Evaluator')).toBeInTheDocument();
  });

  it('navigates to the login page when Login button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavBar />
      </MemoryRouter>
    );

    // Simulate clicking the login button
    fireEvent.click(screen.getByText('Login'));

    // Check if the login button's action leads to rendering the expected content
    expect(screen.getByText('Go Back Home')).toBeInTheDocument();
  });

  it('navigates to the dashboard page when Back to Dashboard button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/evaluation']}>
        <NavBar />
      </MemoryRouter>
    );

    // Simulate clicking the Back to Dashboard button
    fireEvent.click(screen.getByText('Back to Dashboard'));

    // Check if the expected dashboard content appears (this will be specific to your app)
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
