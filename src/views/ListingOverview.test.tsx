import { render, screen } from '@testing-library/react';
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
