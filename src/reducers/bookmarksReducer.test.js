import bookmarksReducer from './bookmarksReducer';

describe('bookmarksReducer', () => {
  const initialState = {
    bookmarks: [],
    currentBookmark: {},
  };

  const sampleBookmarks = [
    { id: '1', title: 'Google', url: 'https://google.com', favorite: false },
    { id: '2', title: 'GitHub', url: 'https://github.com', favorite: true },
    { id: '3', title: 'React', url: 'https://reactjs.org', favorite: false },
  ];

  describe('GET_BOOKMARKS', () => {
    it('replaces bookmarks array with payload', () => {
      const action = { type: 'GET_BOOKMARKS', payload: sampleBookmarks };
      const result = bookmarksReducer(initialState, action);

      expect(result.bookmarks).toEqual(sampleBookmarks);
      expect(result.bookmarks).toHaveLength(3);
    });

    it('does not modify currentBookmark', () => {
      const stateWithCurrent = { ...initialState, currentBookmark: { id: '1' } };
      const action = { type: 'GET_BOOKMARKS', payload: sampleBookmarks };
      const result = bookmarksReducer(stateWithCurrent, action);

      expect(result.currentBookmark).toEqual({ id: '1' });
    });
  });

  describe('ADD_BOOKMARK', () => {
    it('prepends new bookmark to bookmarks array', () => {
      const stateWithBookmarks = { ...initialState, bookmarks: sampleBookmarks };
      const newBookmark = { id: '4', title: 'New Site', url: 'https://new.com' };
      const action = { type: 'ADD_BOOKMARK', payload: newBookmark };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.bookmarks).toHaveLength(4);
      expect(result.bookmarks[0]).toEqual(newBookmark);
    });

    it('adds first bookmark to empty array', () => {
      const newBookmark = { id: '1', title: 'First', url: 'https://first.com' };
      const action = { type: 'ADD_BOOKMARK', payload: newBookmark };
      const result = bookmarksReducer(initialState, action);

      expect(result.bookmarks).toHaveLength(1);
      expect(result.bookmarks[0]).toEqual(newBookmark);
    });
  });

  describe('ADD_BOOKMARK_TO_FAVORITES', () => {
    it('updates favorite status of matching bookmark', () => {
      const stateWithBookmarks = { ...initialState, bookmarks: sampleBookmarks };
      const updatedBookmark = { ...sampleBookmarks[0], favorite: true };
      const action = { type: 'ADD_BOOKMARK_TO_FAVORITES', payload: updatedBookmark };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.bookmarks[0].favorite).toBe(true);
      expect(result.bookmarks[1].favorite).toBe(true); // unchanged
      expect(result.bookmarks[2].favorite).toBe(false); // unchanged
    });
  });

  describe('SET_CURRENT_BOOKMARK', () => {
    it('sets currentBookmark to payload', () => {
      const action = { type: 'SET_CURRENT_BOOKMARK', payload: sampleBookmarks[1] };
      const result = bookmarksReducer(initialState, action);

      expect(result.currentBookmark).toEqual(sampleBookmarks[1]);
    });
  });

  describe('TOGGLE_BOOKMARK', () => {
    it('updates bookmark in array by id', () => {
      const stateWithBookmarks = { ...initialState, bookmarks: sampleBookmarks };
      const toggledBookmark = { ...sampleBookmarks[0], favorite: true };
      const action = { type: 'TOGGLE_BOOKMARK', payload: toggledBookmark };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.bookmarks[0].favorite).toBe(true);
    });
  });

  describe('UPDATE_BOOKMARK', () => {
    it('updates bookmark with matching id', () => {
      const stateWithBookmarks = {
        bookmarks: sampleBookmarks,
        currentBookmark: sampleBookmarks[0]
      };
      const updatedBookmark = { id: '1', title: 'Updated Google', url: 'https://google.com' };
      const action = { type: 'UPDATE_BOOKMARK', payload: updatedBookmark };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.bookmarks[0].title).toBe('Updated Google');
      expect(result.currentBookmark).toEqual({});
    });

    it('clears currentBookmark after update', () => {
      const stateWithBookmarks = {
        bookmarks: sampleBookmarks,
        currentBookmark: sampleBookmarks[1]
      };
      const updatedBookmark = { id: '2', title: 'Updated GitHub', url: 'https://github.com' };
      const action = { type: 'UPDATE_BOOKMARK', payload: updatedBookmark };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.currentBookmark).toEqual({});
    });
  });

  describe('UPDATE_BOOKMARK_TAGS', () => {
    it('updates only tags for matching bookmark', () => {
      const stateWithBookmarks = { ...initialState, bookmarks: sampleBookmarks };
      const action = {
        type: 'UPDATE_BOOKMARK_TAGS',
        payload: { id: '1', tags: ['search', 'productivity'] }
      };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.bookmarks[0].tags).toEqual(['search', 'productivity']);
      expect(result.bookmarks[0].title).toBe('Google'); // other fields unchanged
    });
  });

  describe('DELETE_BOOKMARK', () => {
    it('removes bookmark with matching id from array', () => {
      const stateWithBookmarks = { ...initialState, bookmarks: sampleBookmarks };
      const action = { type: 'DELETE_BOOKMARK', payload: { id: '2' } };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.bookmarks).toHaveLength(2);
      expect(result.bookmarks.find(b => b.id === '2')).toBeUndefined();
    });

    it('clears currentBookmark if deleted bookmark was current', () => {
      const stateWithBookmarks = {
        bookmarks: sampleBookmarks,
        currentBookmark: sampleBookmarks[1]
      };
      const action = { type: 'DELETE_BOOKMARK', payload: { id: '2' } };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.currentBookmark).toEqual({});
    });

    it('preserves currentBookmark if different bookmark deleted', () => {
      const stateWithBookmarks = {
        bookmarks: sampleBookmarks,
        currentBookmark: sampleBookmarks[0]
      };
      const action = { type: 'DELETE_BOOKMARK', payload: { id: '2' } };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result.currentBookmark).toEqual(sampleBookmarks[0]);
    });
  });

  describe('default case', () => {
    it('returns state unchanged for unknown action', () => {
      const stateWithBookmarks = { ...initialState, bookmarks: sampleBookmarks };
      const action = { type: 'UNKNOWN_ACTION' };
      const result = bookmarksReducer(stateWithBookmarks, action);

      expect(result).toEqual(stateWithBookmarks);
    });
  });
});
