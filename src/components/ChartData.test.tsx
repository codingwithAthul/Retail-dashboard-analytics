import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartData } from './ChartData';

describe('ChartData', () => {
  it('reveals the numbers behind a chart', async () => {
    render(<ChartData caption="Segments" headers={['Segment', 'Share']} rows={[['Students', '52%']]} />);
    await userEvent.click(screen.getByText('Show data'));
    expect(screen.getByRole('table', { name: 'Segments' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '52%' })).toBeInTheDocument();
  });
});
