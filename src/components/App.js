import React, { useReducer, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Global, css } from '@emotion/react';
import WebFont from 'webfontloader';

import BookmarksContext from '../context';
import bookmarksReducer from '../reducers/bookmarksReducer';
import { apiUrl, apiEndpoint } from '../config';

import Landing from './Landing';
import BookmarksList from './BookmarksList';

WebFont.load({
	custom: {
		families: [
			'ITCAvantGardeStd-Demi',
			'HelveticaNeueLTStd-BdOu',
			'HelveticaNeueLTStd-Roman',
			'GaramondPremrPro-MedDisp'
		]
	},
	timeout: 2000
});

const globalStyles = css`
	@font-face {
		font-family: ITCAvantGardeStd-Demi;
		src: url('../../public/fonts/ITCAvantGardeStd-Demi.otf') format('opentype');
		font-weight: normal;
		font-style: normal;
	}
	@font-face {
		font-family: HelveticaNeueLTStd-Roman;
		src: url('../../public/fonts/HelveticaNeueLTStd-Roman.otf') format('opentype');
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
		src: url('../../public/fonts/GaramondPremrPro-MedDisp.otf') format('opentype');
		font-weight: bold;
		font-style: normal;
	}
	html {
		box-sizing: border-box;
		font-size: clamp(12px, 2.5vw, 16px);
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
		background-color: #ecf0f1;
	}
`;

const useAPI = endpoint => {
	const [data, setData] = useState([]);

	const getData = React.useCallback(async () => {
		try {
			const res = await axios.get(endpoint);
			setData(res.data)
		} catch (error) {
			console.error('Failed to fetch data:', error);
			setData([]);
		}
	}, [endpoint]);

	useEffect(() => {
		getData();
	}, [getData]);

	return data;
};

export default function App() {
	const initialState = {
		bookmarks: [],
		currentBookmark: {},
	};
	const [state, dispatch] = useReducer(bookmarksReducer, initialState);
	const savedBookmarks = useAPI(`${apiUrl}/${apiEndpoint}`);

	useEffect(() => {
			dispatch({ type: 'GET_BOOKMARKS', payload: savedBookmarks })
		},
		[savedBookmarks]
	);

	return (
		<BrowserRouter>
			<Global styles={globalStyles} />
			<BookmarksContext.Provider value={{ state, dispatch }}>
				<Routes>
					<Route path='/' element={<Landing />} />
					<Route path='/bookmarks' element={<BookmarksList />} />
				</Routes>
			</BookmarksContext.Provider>
		</BrowserRouter>
	);
}

