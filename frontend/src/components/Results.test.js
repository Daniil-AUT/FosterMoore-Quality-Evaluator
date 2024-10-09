import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Result from './Result';

describe('Result Component', () => {
  const mockPredictions = {
    'ambiguity': 0, // Ambiguous
    'well-formed': 2, // Well-formed
    'poorly-formed': 3, // Poorly formed
  };

  test('displays correct text for ambiguity, well-formed, and poorly-formed predictions', () => {
    render(<Result predictions={mockPredictions} />);
  
    // Search for prediction text inside individual spans instead of whole text in h2
    expect(screen.getByText('Ambiguous')).toBeInTheDocument();
    expect(screen.getByText('Well-formed')).toBeInTheDocument();
    expect(screen.getByText('Poorly formed')).toBeInTheDocument();
  });

  test('toggles visibility of ambiguity definition on button click', () => {
    render(<Result predictions={mockPredictions} />);
  
    // Select the specific button near the Ambiguity Prediction
    const ambiguityButton = screen.getByText('Ambiguous').closest('h2').querySelector('button');
    const definition = screen.getByText(/A user story is considered ambiguous if it contains vague language or lacks clarity/i);
  
    // Initially, the aria-expanded attribute should be false
    expect(ambiguityButton).toHaveAttribute('aria-expanded', 'false');
  
    // Click to show definition (expanding)
    fireEvent.click(ambiguityButton);
    expect(ambiguityButton).toHaveAttribute('aria-expanded', 'true');
  
    // Click to hide definition (collapsing)
    fireEvent.click(ambiguityButton);
    expect(ambiguityButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('applies the correct class name based on prediction result', () => {
    render(<Result predictions={mockPredictions} />);

    const ambiguityResult = screen.getByText('Ambiguous');
    const wellFormedResult = screen.getByText('Well-formed');
    const poorlyFormedResult = screen.getByText('Poorly formed');

    // Check that the correct class names are applied for good and bad results
    expect(ambiguityResult).toHaveClass('badResult');
    expect(wellFormedResult).toHaveClass('goodResult');
    expect(poorlyFormedResult).toHaveClass('badResult');
  });
});
