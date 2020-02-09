import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import ReactDOM from 'react-dom';

test('renders GitHub Repository Researcher site name', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/GH RS/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders the site name search button', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Start Searching/i);
  expect(linkElement).toBeInTheDocument();
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
