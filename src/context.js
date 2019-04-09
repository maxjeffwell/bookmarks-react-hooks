import { createContext } from 'react';

const BookmarksContext = createContext({
	bookmarks: [],
	currentBookmark: {},
});

export default BookmarksContext;