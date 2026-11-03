import { render, screen } from '@testing-library/react';
import { StoreLeadership } from './StoreLeadership';

describe('StoreLeadership', () => {
  it('shows every role with a placeholder when no name is set', () => {
    render(<StoreLeadership roles={[{ role: 'Associate-Owner', name: null }, { role: 'Pharmacy Manager', name: null }]} />);
    expect(screen.getByText('Associate-Owner')).toBeInTheDocument();
    expect(screen.getAllByText('Not yet added')).toHaveLength(2);
  });

  it('shows a name once one is filled in', () => {
    render(<StoreLeadership roles={[{ role: 'Front Store Manager', name: 'A. Person' }]} />);
    expect(screen.getByText('A. Person')).toBeInTheDocument();
  });
});
