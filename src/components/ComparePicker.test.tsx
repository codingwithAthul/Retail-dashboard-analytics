import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STORES, UNIVERSITY, WESBROOK } from '../data/stores';
import { ComparePicker } from './ComparePicker';

describe('ComparePicker', () => {
  it('shows the chosen stores and blocks comparing a store with itself', () => {
    render(<ComparePicker stores={STORES} a={WESBROOK} b={UNIVERSITY} onChange={() => {}} />);
    const [first, second] = screen.getAllByRole('combobox');
    expect(first).toHaveValue(WESBROOK.id);
    expect(second).toHaveValue(UNIVERSITY.id);
    expect(screen.getAllByRole('option', { name: /University Blvd/ })[0]).toBeDisabled();
  });

  it('swaps the two stores', async () => {
    const onChange = vi.fn();
    render(<ComparePicker stores={STORES} a={WESBROOK} b={UNIVERSITY} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Swap stores' }));
    expect(onChange).toHaveBeenCalledWith(UNIVERSITY.id, WESBROOK.id);
  });

  it('says how many stores cannot be compared yet', () => {
    render(<ComparePicker stores={STORES} a={WESBROOK} b={UNIVERSITY} onChange={() => {}} notComparable={29} />);
    expect(screen.getByText(/29 directory stores join once their profiles are generated/)).toBeInTheDocument();
  });
});
