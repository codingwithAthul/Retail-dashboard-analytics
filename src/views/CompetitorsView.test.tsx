import { render, screen, within } from '@testing-library/react';
import { competitorsNear } from '../data/competition';
import { UNIVERSITY, WESBROOK } from '../data/stores';
import { formatDistance } from '../lib/geo';
import { CompetitorsView } from './CompetitorsView';

vi.mock('../components/MapView', () => ({ MapView: () => <div>map</div> }));

describe('CompetitorsView', () => {
  it('lists nearby competitors nearest first with distance', () => {
    render(<CompetitorsView store={WESBROOK} />);
    const list = screen.getByRole('region', { name: 'Nearby competitors' });
    const rows = within(list).getAllByRole('row').slice(1);
    const near = competitorsNear(WESBROOK);
    expect(rows).toHaveLength(near.length);
    expect(rows[0]).toHaveTextContent(near[0].name);
    expect(rows[0]).toHaveTextContent(formatDistance(near[0].km));
  });

  it('tells Wesbrook to avoid fresh grocery because of Save-On-Foods', () => {
    render(<CompetitorsView store={WESBROOK} />);
    const section = screen.getByRole('region', { name: 'Where to compete' });
    const row = within(section).getByText('Fresh grocery').closest('tr')!;
    expect(row).toHaveTextContent('Avoid');
    expect(row).toHaveTextContent('Save-On-Foods');
  });

  it('shows the overlap matrix with ticks', () => {
    render(<CompetitorsView store={UNIVERSITY} />);
    const matrix = screen.getByRole('region', { name: 'Who sells what' });
    expect(within(matrix).getAllByLabelText('Yes').length).toBeGreaterThan(0);
  });

  it('counts other pharmacies nearby', () => {
    render(<CompetitorsView store={UNIVERSITY} />);
    expect(screen.getByText('Other pharmacies nearby').nextElementSibling).toHaveTextContent('2');
  });
});
