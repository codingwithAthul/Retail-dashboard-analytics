import { fireEvent, render, screen, within } from '@testing-library/react';
import { listingNeighbours } from '../data/neighbours';
import { VANCOUVER_LISTINGS } from '../data/vancouverListings';
import { NeighbourPanel } from './NeighbourPanel';

const DENMAN = listingNeighbours(VANCOUVER_LISTINGS.find((l) => l.id === '201')!)!;

describe('NeighbourPanel', () => {
  it('opens on the nearby places, each with what it mainly sells', () => {
    render(<NeighbourPanel data={DENMAN} />);
    expect(screen.getByRole('tab', { name: 'Nearby' })).toHaveAttribute('aria-selected', 'true');
    const list = screen.getByRole('list', { name: 'Nearby places' });
    const noFrills = within(list).getByRole('link', { name: 'No Frills' }).closest('li')!;
    expect(noFrills).toHaveTextContent('Discount supermarket: produce, meat');
    expect(noFrills).toHaveTextContent('Draws shoppers for: Fresh grocery, Household');
    expect(noFrills).toHaveTextContent('Loblaw');
  });

  it('shows the stock calls on their own tab', () => {
    render(<NeighbourPanel data={DENMAN} />);
    fireEvent.click(screen.getByRole('tab', { name: 'What to stock' }));
    const calls = screen.getByRole('table', { name: /Stock calls/ });
    expect(within(calls).getByRole('rowheader', { name: 'Fresh grocery' }).closest('tr')).toHaveTextContent('Avoid');
    expect(screen.queryByRole('list', { name: 'Nearby places' })).not.toBeInTheDocument();
  });

  it('shows census stock notes with the figure behind each', () => {
    render(<NeighbourPanel data={DENMAN} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Stock notes' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('postal area V6G');
    expect(screen.getByText('Most households rent')).toBeInTheDocument();
    expect(screen.getByText(/rent, Metro Vancouver 37\.8%/)).toBeInTheDocument();
  });

  it('moves between tabs with the arrow keys', () => {
    render(<NeighbourPanel data={DENMAN} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Nearby' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'What to stock' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'What to stock' }), { key: 'ArrowLeft' });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Nearby' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Stock notes' })).toHaveAttribute('aria-selected', 'true');
  });

  it('puts the store details first when it shares a phone sheet', () => {
    render(<NeighbourPanel data={DENMAN} store={<p>Store details</p>} />);
    expect(screen.getByRole('tab', { name: 'Store' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Store details')).toBeInTheDocument();
  });
});
