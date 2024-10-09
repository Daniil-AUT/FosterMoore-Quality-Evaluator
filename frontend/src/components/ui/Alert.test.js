import React from 'react';
import { render } from '@testing-library/react';
import { Alert } from './Alert'; 

describe('Alert Component', () => {
  it('renders children content', () => {
    // Render the Alert component with a sample child and variant
    const { getByText } = render(<Alert variant="success">Success Message</Alert>);
    
    // Check if the text 'Success Message' is rendered within the component
    expect(getByText('Success Message')).toBeInTheDocument();
  });
});
