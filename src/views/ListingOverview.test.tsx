import { render, screen, within } from '@testing-library/react';
import { VANCOUVER_LISTINGS } from '../data/vancouverListings';
import { ListingOverview } from './ListingOverview';

const DENMAN = VANCOUVER_LISTINGS.find((l) => l.id === '201')!;

describe('ListingOverview', () => {
  it('shows the 2021 census for the store postal area next to Metro Vancouver', () => {
    render(<ListingOverview listing={DENMAN} onSelect={() => {}} />);
    expect(screen.getByRole('heading', { name: /2021 census, postal area V6G/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Metro Vancouver' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Households that rent' })).toBeInTheDocument();
    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0);
  });

  it('links the census to the Statistics Canada page for the postal area', () => {
    render(<ListingOverview listing={DENMAN} onSelect={() => {}} />);
    expect(screen.getByRole('link', { name: '[1]' })).toHaveAttribute('href', expect.stringContaining('2021A0011V6G'));
  });

  it('describes the residents-by-age chart for screen readers', () => {
    render(<ListingOverview listing={DENMAN} onSelect={() => {}} />);
    expect(screen.getByRole('img', { name: /^Residents by age, postal area V6G/ })).toBeInTheDocument();
  });

  it('still says which analytics are not there yet', () => {
    render(<ListingOverview listing={DENMAN} onSelect={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Not yet available' })).toBeInTheDocument();
  });
});

describe('ListingOverview nearby places', () => {
  it('lists pharmacies and supermarkets within a 10-minute walk, linked to OpenStreetMap', () => {
    render(<ListingOverview listing={DENMAN} onSelect={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Within a 10-minute walk' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: /within 800 m/ });
    const rows = within(table).getAllByRole('rowheader');
    expect(rows.length).toBeGreaterThan(0);
    // Each place's name links to OpenStreetMap; a chain may add a [source] link after it.
    for (const row of rows) {
      expect(row.querySelector('a')!.getAttribute('href')).toMatch(/^https:\/\/www\.openstreetmap\.org\/(node|way|relation)\/\d+$/);
    }
  });
});

describe('ListingOverview: what the neighbours sell', () => {
  it('says what each nearby place mainly sells, and marks independents as inferred', () => {
    render(<ListingOverview listing={DENMAN} onSelect={() => {}} />);
    const table = screen.getByRole('table', { name: /within 800 m/ });
    const noFrills = within(table).getByRole('rowheader', { name: /No Frills/ });
    expect(noFrills).toHaveTextContent(/Discount supermarket: produce, meat/);
    expect(within(table).getAllByText(/inferred from the map/).length).toBeGreaterThan(0);
  });

  it('makes a stock call per category from the neighbours', () => {
    render(<ListingOverview listing={DENMAN} onSelect={() => {}} />);
    expect(screen.getByRole('heading', { name: 'What to stock, given the neighbours' })).toBeInTheDocument();
    const calls = screen.getByRole('table', { name: /Stock calls/ });
    const fresh = within(calls).getByRole('rowheader', { name: /Fresh grocery/ }).closest('tr')!;
    expect(fresh).toHaveTextContent('Avoid');
    expect(fresh).toHaveTextContent('No Frills, 51 m');
    const pharmacy = within(calls).getByRole('rowheader', { name: /^Pharmacy/ }).closest('tr')!;
    expect(pharmacy).toHaveTextContent('Compete');
  });
});
