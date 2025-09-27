import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the background image import so Jest doesn't try to load a real file
jest.mock('../../assets/hero-farm.jpg', () => 'hero-farm.jpg');

import Hero from '../Hero';

describe('Hero background responsiveness', () => {
  test('uses object-contain on mobile and object-cover from sm breakpoint', () => {
    render(<Hero />);

    const bg = screen.getByAltText('Nareshwadi Farm Background');
    expect(bg).toBeInTheDocument();

    // Mobile: object-contain should be present to avoid zoom-in
    expect(bg).toHaveClass('object-contain');

    // Ensure the responsive class is present; JSDOM won’t compute breakpoints, so we check the raw class string
    expect((bg.getAttribute('class') || '')).toContain('sm:object-cover');
  });
});
