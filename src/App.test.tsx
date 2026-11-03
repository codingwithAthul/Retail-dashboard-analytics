import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Leaflet needs a real browser layout; the map itself is covered by end-to-end tests (v1.1).
vi.mock('./components/MapView', () => ({
  MapView: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <button onClick={() => onSelect('2273')}>map pin University Blvd</button>
  ),
}));

beforeEach(() => window.history.replaceState(null, '', '/'));

describe('App', () => {
  it('renders the dashboard title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Store Insights' })).toBeInTheDocument();
  });

  it('opens on the first store', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'Wesbrook Village' })).toBeInTheDocument();
  });

  it('switches store from the switcher', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: 'University Blvd' }));
    expect(screen.getByRole('heading', { level: 2, name: 'University Blvd' })).toBeInTheDocument();
  });

  it('switches store from a map pin', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'map pin University Blvd' }));
    expect(screen.getByText('5940 University Blvd, Vancouver, BC V6T 1Z3')).toBeInTheDocument();
  });
});

describe('App navigation', () => {
  it('shows Store Leadership and Key Differentiators on the overview', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Store Leadership' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Key Differentiators' })).toBeInTheDocument();
  });

  it('opens an analytics tab from its entry card and returns to the overview', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /^Sales/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Sales' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Wesbrook Village' })).toBeInTheDocument();
  });

  it('keeps the tab when switching store', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /^Demographics/ }));
    await userEvent.click(screen.getByRole('tab', { name: 'University Blvd' }));
    expect(screen.getByText('University Blvd · #2273')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Demographics' })).toBeInTheDocument();
  });
});

describe('App deep links', () => {
  it('opens the store and tab named in the URL', () => {
    window.history.replaceState(null, '', '/#/store/2273/competitors');
    render(<App />);
    expect(screen.getByText('University Blvd · #2273')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Competitors' })).toBeInTheDocument();
  });

  it('writes the current store and tab to the URL', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /^Sales/ }));
    expect(window.location.hash).toBe('#/store/2247/sales');
  });
});

describe('Vancouver directory stores', () => {
  it('finds a store by street and opens its listing panel', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox', { name: /find a store/i }), 'denman');
    await userEvent.click(screen.getByRole('option', { name: /Denman Place Mall/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Denman Place Mall' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/public directory listing/i);
    expect(window.location.hash).toBe('#/store/201');
  });

  it('chooses the highlighted match with the keyboard', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox', { name: /find a store/i }), '2294{Enter}');
    expect(screen.getByRole('heading', { level: 2, name: 'Hastings & Slocan' })).toBeInTheDocument();
  });

  it('says when nothing matches', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox', { name: /find a store/i }), 'zzz');
    expect(screen.getByText(/No store matches/)).toBeInTheDocument();
  });

  it('opens a deep link to a listing on its overview, even for an analytics tab', () => {
    window.history.replaceState(null, '', '/#/store/2279/sales');
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'Vancouver General Hospital' })).toBeInTheDocument();
    expect(screen.getByText(/map position is approximate/i)).toBeInTheDocument();
  });

  it('links a listing to the nearest profiled store', async () => {
    window.history.replaceState(null, '', '/#/store/238');
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /Wesbrook Village/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Wesbrook Village' })).toBeInTheDocument();
  });
});
