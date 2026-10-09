import { formatRelative } from '../formatDate';

describe('formatRelative', () => {
  const now = new Date('2026-05-10T12:00:00Z');
  it.each([
    [new Date('2026-05-10T11:59:40Z'), 'justo ahora'],
    [new Date('2026-05-10T11:45:00Z'), 'hace 15 min'],
    [new Date('2026-05-10T09:00:00Z'), 'hace 3 h'],
    [new Date('2026-05-08T12:00:00Z'), 'hace 2 d'],
  ])('%s -> %s', (date, expected) => {
    expect(formatRelative(date, now)).toBe(expected);
  });

  it('usa la fecha absoluta pasada una semana', () => {
    expect(formatRelative(new Date(2026, 3, 1, 12), now)).toBe('1 abr 2026');
  });
});
