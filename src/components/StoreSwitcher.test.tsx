import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STORES } from '../data/stores';
import { StoreSwitcher } from './StoreSwitcher';

describe('StoreSwitcher', () => {
  it('marks the selected store and reports clicks', async () => {
    const onSelect = vi.fn();
    render(<StoreSwitcher stores={STORES} selectedId="2247" onSelect={onSelect} />);
    expect(screen.getByRole('tab', { name: 'Wesbrook Village' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'University Blvd' }));
    expect(onSelect).toHaveBeenCalledWith('2273');
  });
});
