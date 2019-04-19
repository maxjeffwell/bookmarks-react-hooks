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
		families: ['ITCAvantGardeStd-Demi', 'GillSansStd-Shadowed', 'WarnockPro-SemiboldIt']
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
	@font-face {
	font-family: GillSansStd-Shadowed;
	src: url('../../public/fonts/GillSansStd-Shadowed.otf') format('opentype');
	font-weight: normal;
	font-style: normal;
	}
	@font-face {
	font-family: WarnockPro-SemiboldIt;
	src: url('../../public/fonts/WarnockPro-SemiboldIt.otf') format('opentype');
	font-weight: normal;
	font-style: normal;
	}
	html {
		box-sizing: border-box;
		font-size: 14px;
		color: #272727;
	}
	*, *:before, *:after {
		box-sizing: inherit;
	}
	body {
		display: grid;
		grid-template-columns: auto 2fr;
		grid-template-rows: 1fr 10fr 1fr;
		grid-template-areas:
			"header header"
			"main"
			"footer	footer";
		grid-gap: 10px;
		grid-auto-flow: column;
		height: 100vh;
		padding: 0;
		margin: 0;
		text-shadow: 0 2px 0 rgba(0, 0, 0, 0.07);
		font-size: 1.5rem;
		line-height: 2;
	}
	header {
		grid-area: header;
	}
	main {
		grid-area: main;
	}
	footer {
		grid-area: footer;
	}
	button {
		background: ${props => props.theme.colors.secondary};
		color: white;
		border-radius: 5px;
		cursor: pointer;
		font-size: 1.2rem;
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
}

