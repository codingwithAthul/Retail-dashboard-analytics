import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DIRECTORY } from '../data/directory';
import { NetworkPage } from './NetworkPage';

describe('NetworkPage', () => {
  it('lists every store with the Shoppers stores and sister banners within 800 m', () => {
    render(<NetworkPage onSelect={() => {}} />);
    const table = screen.getByRole('table', { name: /Shoppers Drug Mart stores and sister Loblaw banners within 800 m/ });
    // Header row plus one row per store.
    expect(within(table).getAllByRole('row')).toHaveLength(DIRECTORY.length + 1);
    const row = (store: string) => within(table).getByRole('rowheader', { name: new RegExp(`^${store}`) }).closest('tr')!;
    const robson = row('Robson & Burrard');
    expect(robson).toHaveTextContent(/Granville 439 m/);
    const denman = row('Denman Place Mall');
    expect(denman).toHaveTextContent(/No Frills 51 m/);
  });

  it('sums up the overlap in three headline numbers', () => {
    render(<NetworkPage onSelect={() => {}} />);
    expect(screen.getByText('Stores near another Shoppers')).toBeInTheDocument();
    expect(screen.getByText('Stores near a sister banner')).toBeInTheDocument();
    expect(screen.getByText('Closest pair')).toBeInTheDocument();
  });

  it('opens a store from its row', async () => {
    const onSelect = vi.fn();
    render(<NetworkPage onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Yaletown' }));
    expect(onSelect).toHaveBeenCalledWith('2246');
  });
});
