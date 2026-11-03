import { count, money, moneyShort, monthYear, percent, signedPercent } from './format';

describe('format', () => {
  it('formats Canadian dollars without cents', () => {
    expect(money(1234567)).toBe('$1,234,567');
  });

  it('formats counts and percents', () => {
    expect(count(12345.6)).toBe('12,346');
    expect(percent(0.254)).toBe('25%');
    expect(percent(0.254, 1)).toBe('25.4%');
  });

  it('signs percent changes', () => {
    expect(signedPercent(0.061)).toBe('+6.1%');
    expect(signedPercent(-0.02)).toBe('−2.0%');
  });

  it('shortens axis values', () => {
    expect(moneyShort(610000)).toBe('$610K');
    expect(moneyShort(7_300_000)).toBe('$7.3M');
    expect(moneyShort(500)).toBe('$500');
  });

  it('names a data month', () => {
    expect(monthYear('2026-10')).toBe('October 2026');
    expect(monthYear('2025-01')).toBe('January 2025');
  });
});
