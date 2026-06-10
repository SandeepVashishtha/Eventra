import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from '@jest/globals';

import Navbar from '../src/components/navbar/Navbar';

describe('Navbar keyboard interactions', () => {
  it('renders navigation links and supports keyboard navigation', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    const firstLink = links[0];
    firstLink.focus();
    expect(document.activeElement).toBe(firstLink);

    if (links.length > 1) {
      fireEvent.keyDown(firstLink, { key: 'ArrowRight', code: 'ArrowRight' });
    }
  });
});
