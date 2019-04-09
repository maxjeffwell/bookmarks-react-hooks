import React, { useContext, useReducer, useState, useEffect } from 'react';
import axios from 'axios';

import BookmarksContext from '../context';
import bookmarksReducer from '../reducer';
import BookmarksList from './BookmarksList';
import BookmarkForm from './BookmarkForm';

const useAPI = endpoint => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const res = await axios.get(endpoint);
    setData(res.data)
  };

  return data;
};

export default function App() {
  const initialState = useContext(BookmarksContext);
  const [state, dispatch] = useReducer(bookmarksReducer, initialState);
  const savedBookmarks = useAPI('https://hooks-api.maxjeffwell.now.sh/bookmarks');

  useEffect(() => {
    dispatch({ type: 'GET_BOOKMARKS', payload: savedBookmarks })
  },
    [savedBookmarks]
  );

  return (
    <BookmarksContext.Provider value={{ state, dispatch }}>
      <BookmarkForm />
      <BookmarksList />
    </BookmarksContext.Provider>
  )
};

