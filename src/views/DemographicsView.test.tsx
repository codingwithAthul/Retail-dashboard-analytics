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
});
