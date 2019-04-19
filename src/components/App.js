import React, { useContext, useReducer, useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import axios from 'axios';
import { injectGlobal } from 'emotion';
import WebFont from 'webfontloader';

import BookmarksContext from '../context';
import bookmarksReducer from '../reducers/bookmarksReducer';

import Landing from './Landing';
import Header from './Header';
import Footer from './Footer';
import BookmarksList from './BookmarksList';

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
		font-weight: normal;
		color: #272727;
		text-shadow: 0 2px 0 rgba(0, 0, 0, 0.07);
	}
	
	*, *:before, *:after {
		box-sizing: inherit;
	}
	
	body {
		display: grid;
		grid-template-rows: auto 1fr 1fr auto;
		grid-template-columns: repeat(3, 1fr);
		height: 100vh;
		padding: 0;
		margin: 0;
		font-family: ITCAvantGardeStd-Demi, monospace;
		font-size: 1.5rem;
		line-height: 1.2;
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
		<BrowserRouter>
		<BookmarksContext.Provider value={{ state, dispatch }}>
			<Header />
			<Switch>
				<Route exact path='/' component={Landing} />
				<Route exact path='/bookmarks' component={BookmarksList} />
			</Switch>
			<Footer />
		</BookmarksContext.Provider>
		</BrowserRouter>
	)
};

