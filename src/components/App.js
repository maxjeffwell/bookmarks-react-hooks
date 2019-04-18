import React, { useContext, useReducer, useState, useEffect } from 'react';
import axios from 'axios';
import { injectGlobal } from 'emotion';
import WebFont from 'webfontloader';

import BookmarksContext from '../context';
import bookmarksReducer from '../reducers/bookmarksReducer';

import Landing from './Landing';
import BookmarksList from './BookmarksList';
import BookmarkForm from './BookmarkForm';

WebFont.load({
	custom: {
		families: ['ITCAvantGardeStd-Demi']
	},
	timeout: 2000
});

injectGlobal`
	@font-face {
	font-family: ITCAvantGardeStd-Demi;
	src: url('../../public/fonts/ITCAvantGardeStd-Demi.otf') format('opentype');
	font-weight: normal;
	font-style: normal;
}
	html {
		box-sizing: border-box;
		font-size: 14px;
	}
	
	*, *:before, *:after {
		box-sizing: inherit;
	}
	
	body {
		padding: 0;
		margin: 0;
		font-family: ITCAvantGardeStd-Demi, serif;
		font-size: 1.5rem;
		line-height: 2;
	}
`;

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
	const savedBookmarks = useAPI(`https://hooks-api.maxjeffwell.now.sh/bookmarks`);

	useEffect(() => {
			dispatch({ type: 'GET_BOOKMARKS', payload: savedBookmarks })
		},
		[savedBookmarks]
	);

	return (
		<BookmarksContext.Provider value={{ state, dispatch }}>
			<Landing />
			<BookmarkForm />
			<BookmarksList />
		</BookmarksContext.Provider>
	)
};

