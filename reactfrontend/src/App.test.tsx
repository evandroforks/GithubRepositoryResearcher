import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import ReactDOM from 'react-dom';

test('renders GitHub Repository Researcher site name', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/GH RRS/i);
  expect(linkElement).toBeInTheDocument();
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
