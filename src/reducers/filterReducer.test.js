import filterReducer from './filterReducer';

describe('filterReducer', () => {
  it('returns ALL for SHOW_ALL action', () => {
    const result = filterReducer('FAVORITES', { type: 'SHOW_ALL' });
    expect(result).toBe('ALL');
  });

  it('returns FAVORITES for SHOW_FAVORITES action', () => {
    const result = filterReducer('ALL', { type: 'SHOW_FAVORITES' });
    expect(result).toBe('FAVORITES');
  });

  it('returns RATING for SHOW_BY_RATING action', () => {
    const result = filterReducer('ALL', { type: 'SHOW_BY_RATING' });
    expect(result).toBe('RATING');
  });

  it('returns current state for unknown action', () => {
    const result = filterReducer('FAVORITES', { type: 'UNKNOWN' });
    expect(result).toBe('FAVORITES');
  });
});
