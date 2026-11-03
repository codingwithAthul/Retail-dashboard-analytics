import { render, screen } from '@testing-library/react';
import { ConfidenceBadge } from './ConfidenceBadge';

describe('ConfidenceBadge', () => {
  it('labels sample data clearly', () => {
    render(<ConfidenceBadge level="sample" />);
    expect(screen.getByText('Sample data')).toHaveAttribute('title', expect.stringMatching(/not real/i));
  });

  it('labels verified facts', () => {
    render(<ConfidenceBadge level="verified" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });
});
