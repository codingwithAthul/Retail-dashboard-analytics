import { render, screen } from '@testing-library/react';
import { WESBROOK } from '../data/stores';
import { KeyDifferentiators } from './KeyDifferentiators';

describe('KeyDifferentiators', () => {
  it('lists the most and second most present demographics with confidence', () => {
    render(<KeyDifferentiators facts={WESBROOK.differentiators} />);
    expect(screen.getByText('Most present demographic')).toBeInTheDocument();
    expect(screen.getByText('Second most present demographic')).toBeInTheDocument();
    expect(screen.getByText('Store format')).toBeInTheDocument();
    expect(screen.getAllByText('Inferred').length).toBeGreaterThan(0);
  });
});
