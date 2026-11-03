import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UNIVERSITY, WESBROOK } from '../data/stores';
import { StoreBrief } from './StoreBrief';

describe('StoreBrief', () => {
  it('puts the store summary on one sheet', () => {
    render(<StoreBrief store={WESBROOK} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Wesbrook Village' })).toBeInTheDocument();
    for (const title of ['Summary', 'Key differentiators', 'Main customers', 'Top categories', 'Where to compete', 'Competitors within 1.2 km', 'Store leadership']) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
    }
    expect(screen.getByText(/Sales data to \w+ \d{4}/)).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('synthetic sample data');
  });

  it('lists every category call and leaves leadership names empty', () => {
    render(<StoreBrief store={UNIVERSITY} onBack={vi.fn()} />);
    expect(screen.getAllByRole('row')).toHaveLength(UNIVERSITY.categoryCalls.length + 1);
    expect(screen.getAllByText('Not yet added')).toHaveLength(UNIVERSITY.leadership.length);
  });

  it('prints and goes back', async () => {
    const onBack = vi.fn();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<StoreBrief store={WESBROOK} onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Print or save as PDF' }));
    expect(print).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Back to store/ }));
    expect(onBack).toHaveBeenCalled();
    print.mockRestore();
  });
});
