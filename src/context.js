import { createContext } from 'react';

const BookmarksContext = createContext({
	bookmarks: [
		{ id: 1,
		title: 'Google',
		url: 'https://www.google.com',
		description: 'Google search engine',
		rating: '',
		expanded: false,
		},
		{
			id: 2,
			title: 'Bing',
			url: 'https://www.bing.com',
			description: 'Bing search engine',
			rating: '',
			expanded: false,
		},
	],
});

export default BookmarksContext;