import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionsModal from './SuggestionsModal';

describe('SuggestionsModal Component', () => {
  const mockSuggestions = [
    'Enhancing clarity: Ensure that your user story is clear and concise.\n* Provide specific examples.',
    'Increasing completeness: Make sure all requirements are covered.',
  ];

  test('renders the modal with AI Suggestions title when visible', () => {
    render(
      <SuggestionsModal
        visible={true}
        onClose={() => {}}
        suggestions={[]}
        isLoading={false}
        error={null}
      />
    );

    // Check if the modal title is rendered correctly
    expect(screen.getByText(/AI Suggestions/i)).toBeInTheDocument();
  });

  test('shows loading spinner when isLoading is true', () => {
    render(
      <SuggestionsModal
        visible={true}
        onClose={() => {}}
        suggestions={[]}
        isLoading={true}
        error={null}
      />
    );

    // Check for the loading spinner and loading text
    expect(screen.getByText(/Generating suggestions.../i)).toBeInTheDocument();
  });

  test('displays error message when error is present', () => {
    const errorMessage = 'Failed to fetch suggestions';
    render(
      <SuggestionsModal
        visible={true}
        onClose={() => {}}
        suggestions={[]}
        isLoading={false}
        error={errorMessage}
      />
    );

    // Check for the error alert and the error message
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('closes the modal when onClose is called', () => {
    const handleClose = jest.fn();
    render(
      <SuggestionsModal
        visible={true}
        onClose={handleClose}
        suggestions={[]}
        isLoading={false}
        error={null}
      />
    );

    // Close the modal by simulating a close action
    fireEvent.click(screen.getByLabelText('Close'));

    // Check if the close handler was called
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
