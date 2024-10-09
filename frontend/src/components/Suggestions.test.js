import React from 'react';
import { render, screen } from '@testing-library/react';
import Suggestions from './Suggestions';

describe('Suggestions Component', () => {
  
  it('shows loading spinner when isLoading is true', () => {
    render(<Suggestions suggestions={[]} isLoading={true} />);
    
    expect(screen.getByText('Looking for suggestions...')).toBeInTheDocument();
  });

  it('displays no suggestions alert when suggestions array is empty', () => {
    render(<Suggestions suggestions={[]} isLoading={false} />);
    
    expect(screen.getByText('No suggestions available')).toBeInTheDocument();
  });

  it('renders suggestions when provided', () => {
    const mockSuggestions = [
      'Enhancing clarity: Make the user story more specific.',
      'Increasing completeness: Add missing details to the user story.'
    ];

    render(<Suggestions suggestions={mockSuggestions} isLoading={false} />);

    expect(screen.getByText('Enhancing clarity')).toBeInTheDocument();
    expect(screen.getByText('Increasing completeness')).toBeInTheDocument();
  });
});
