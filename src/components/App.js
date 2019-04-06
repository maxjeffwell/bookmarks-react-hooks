import React, { useContext, useReducer } from 'react';

import BookmarksContext from '../context';
import bookmarksReducer from '../reducer';
import BookmarksList from './BookmarksList';
import BookmarkForm from './BookmarkForm';

const App = () => {
  const initialState = useContext(BookmarksContext);
  const [state, dispatch] = useReducer(bookmarksReducer, initialState);

  return (
    <BookmarksContext.Provider value={{state, dispatch}}>
      <BookmarkForm />
      <BookmarksList />
    </BookmarksContext.Provider>
  )
};

export default App;
