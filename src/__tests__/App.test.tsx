import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders header and form', () => {
    render(<App />);
    expect(screen.getByText(/URL Crawler & Deconstructor/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/https:\/\/example.com/i)).toBeInTheDocument();
  });

  test('shows error on empty submit', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /crawl url/i }));
    expect(screen.getByText(/Please enter a URL/i)).toBeInTheDocument();
  });

  test('handles valid URL parsing', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/https:\/\/example.com/i);
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /crawl url/i }));
  });
});
