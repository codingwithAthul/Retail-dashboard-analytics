import { render, screen, within } from '@testing-library/react';
import { salesKpis, topItems } from '../data/sales';
import { UNIVERSITY, WESBROOK } from '../data/stores';
import { count } from '../lib/format';
import { SalesView } from './SalesView';

describe('SalesView', () => {
  it('labels the numbers as sample data', () => {
    render(<SalesView store={WESBROOK} />);
    expect(screen.getByText('Sample data')).toBeInTheDocument();
    expect(screen.getByText(/not real store sales/i)).toBeInTheDocument();
  });

  it('shows the KPI row', () => {
    render(<SalesView store={WESBROOK} />);
    expect(screen.getByText('Sales, last 12 months')).toBeInTheDocument();
    expect(screen.getByText(count(salesKpis('2247').transactions))).toBeInTheDocument();
    expect(screen.getByText('Pharmacy share')).toBeInTheDocument();
  });

  it('lists the best-selling items in order', () => {
    render(<SalesView store={UNIVERSITY} />);
    const section = screen.getByRole('region', { name: 'Best-selling front-store items' });
    const rows = within(section).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(topItems('2273').length);
    expect(rows[0]).toHaveTextContent(topItems('2273')[0].name);
  });

  it('describes each chart for screen readers', () => {
    render(<SalesView store={UNIVERSITY} />);
    expect(screen.getByRole('img', { name: /line chart of monthly sales/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /bar chart of sales by category/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /bar chart of average daily sales by weekday/i })).toBeInTheDocument();
  });

  it('calls out the busiest day and the weekend gap on campus', () => {
    render(<SalesView store={UNIVERSITY} />);
    const section = screen.getByRole('region', { name: 'Average sales by weekday' });
    expect(within(section).getByText(/weekends run \d+% below weekdays/i)).toBeInTheDocument();
  });
});

describe('SalesView data tables', () => {
  it('offers the numbers behind every chart', () => {
    render(<SalesView store={WESBROOK} />);
    expect(screen.getAllByText('Show data')).toHaveLength(3);
  });
});
