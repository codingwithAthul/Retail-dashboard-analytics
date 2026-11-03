import { render, screen } from '@testing-library/react';
import { UNIVERSITY, WESBROOK } from '../data/stores';
import { DemographicsView } from './DemographicsView';

describe('DemographicsView', () => {
  it('marks shares as estimates', () => {
    render(<DemographicsView store={WESBROOK} />);
    expect(screen.getByRole('note')).toHaveTextContent(/estimates/i);
    expect(screen.getAllByText('Estimate').length).toBeGreaterThanOrEqual(2);
  });

  it('names the most and second most present segments', () => {
    render(<DemographicsView store={UNIVERSITY} />);
    expect(screen.getByText('Most present').nextElementSibling).toHaveTextContent('Undergraduate students');
    expect(screen.getByText('Second most present').nextElementSibling).toHaveTextContent('Faculty and staff');
  });

  it('links verified area facts to their sources', () => {
    render(<DemographicsView store={UNIVERSITY} />);
    const link = screen.getAllByRole('link', { name: '[1]' })[0];
    expect(link).toHaveAttribute('href', expect.stringContaining('ubc.ca'));
  });

  it('describes both charts for screen readers', () => {
    render(<DemographicsView store={WESBROOK} />);
    expect(screen.getByRole('img', { name: /^Customer segments:/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^Age profile:/ })).toBeInTheDocument();
  });

  it('shows the 2021 census next to Metro Vancouver, with sources', () => {
    render(<DemographicsView store={UNIVERSITY} />);
    const table = screen.getByRole('table', { name: /2021 census, Metro Vancouver A/ });
    expect(table).toHaveTextContent('Median age31.440.8');
    expect(screen.getByRole('heading', { name: /2021 census: Metro Vancouver A/ })).toHaveTextContent('Verified');
    const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(links.some((h) => h?.includes('2021A00055915020'))).toBe(true);
    expect(screen.getByRole('img', { name: /^Residents by age, 2021 census:/ })).toBeInTheDocument();
  });
});
