import React, { useContext, useReducer, useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import axios from 'axios';
import { injectGlobal } from 'emotion';
import WebFont from 'webfontloader';

import BookmarksContext from '../context';
import bookmarksReducer from '../reducers/bookmarksReducer';

import Landing from './Landing';
import BookmarksList from './BookmarksList';

WebFont.load({
	custom: {
		families: ['ITCAvantGardeStd-Demi',
			'GillSansStd-Shadowed',
			'WarnockPro-SemiboldIt',
			'HelveticaNeueLTStd-BdOu',
			'GaramondPremrPro-MedDisp'
		]
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
	@font-face {
		font-family: HelveticaNeueLTStd-BdOu;
		src: url('../../public/fonts/HelveticaNeueLTStd-BdOu.otf') format('opentype');
		font-weight: bold;
		font-style: normal;
	}
		@font-face {
		font-family: GaramondPremrPro-MedDisp;
		src: url('../../public/fonts/HelveticaNeueLTStd-BdOu.otf') format('opentype');
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
		padding: 0;
		margin: 0;
		font-size: 1.5rem;
		line-height: 2;
		height: 100%;
		width: 100%;
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
				<Switch>
					<Route exact path='/' component={Landing} />
					<Route exact path='/bookmarks' component={BookmarksList} />
				</Switch>
			</BookmarksContext.Provider>
		</BrowserRouter>
	);
}

