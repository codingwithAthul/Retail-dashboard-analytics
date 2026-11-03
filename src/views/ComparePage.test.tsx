import { render, screen, within } from '@testing-library/react';
import { categoryGaps } from '../data/compare';
import { UNIVERSITY, WESBROOK } from '../data/stores';
import { ComparePage } from './ComparePage';

describe('ComparePage', () => {
  it('shows both stores side by side with their headline numbers', () => {
    render(<ComparePage a={WESBROOK} b={UNIVERSITY} />);
    const table = within(screen.getByRole('region', { name: 'Headline numbers' })).getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Wesbrook Village' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'University Blvd' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(7);
  });

  it('says where each store should specialise', () => {
    render(<ComparePage a={WESBROOK} b={UNIVERSITY} />);
    const region = screen.getByRole('region', { name: 'Where each store should specialise' });
    const leadA = categoryGaps(WESBROOK, UNIVERSITY).find((g) => g.leader === 'a')!;
    expect(within(region).getByText(new RegExp(`${leadA.category} \\(\\+\\d+ pts\\)`))).toBeInTheDocument();
    expect(within(region).getByText(/Convenience food \(\+\d+ pts\)/)).toBeInTheDocument();
  });

  it('labels synthetic figures and describes charts for screen readers', () => {
    render(<ComparePage a={WESBROOK} b={UNIVERSITY} />);
    expect(screen.getByText('Sample data')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /bar chart comparing category share/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /line chart of average daily sales by weekday/i })).toBeInTheDocument();
  });

  it('explains that no competitor is close to both stores', () => {
    render(<ComparePage a={WESBROOK} b={UNIVERSITY} />);
    expect(screen.getByText(/no competitor is within 1.2 km of both stores/i)).toBeInTheDocument();
  });
});
