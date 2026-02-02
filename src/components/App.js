import React, { useReducer, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Global, css } from '@emotion/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

import BookmarksContext from '../context';
import bookmarksReducer from '../reducers/bookmarksReducer';
import { apiUrl, apiEndpoint } from '../config';

import { AuthProvider, useAuth, ProtectedRoute, Login, Register } from './Auth';
import Landing from './Landing';
import BookmarksList from './BookmarksList';

// Configure axios to send cookies globally
axios.defaults.withCredentials = true;

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
		font-family: GaramondPremrPro-MedDisp;
		src: url('../../public/fonts/GaramondPremrPro-MedDisp.otf') format('opentype');
		font-weight: bold;
		font-style: normal;
	}
	html {
		box-sizing: border-box;
		font-size: clamp(12px, 2.5vw, 16px);
		color: #272727;
		overflow-x: hidden;
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
		overflow-x: hidden;
	}
	#root {
		overflow-x: hidden;
		width: 100%;
		max-width: 100%;
	}
`;

const useAPI = (endpoint, enabled = true) => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const getData = React.useCallback(async () => {
		if (!enabled) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			setError(null);
			const res = await axios.get(endpoint);
			setData(res.data);
		} catch (error) {
			console.error('Failed to fetch data:', error);
			setError(error);
			setData([]);
		} finally {
			setLoading(false);
		}
	}, [endpoint, enabled]);

	useEffect(() => {
		getData();
	}, [getData]);

	return { data, loading, error, refetch: getData };
};

// Bookmarks provider that fetches data only when authenticated
function BookmarksProvider({ children }) {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const initialState = {
		bookmarks: [],
		currentBookmark: {},
	};
	const [state, dispatch] = useReducer(bookmarksReducer, initialState);
	const { data: savedBookmarks, loading, error, refetch } = useAPI(
		`${apiUrl}/${apiEndpoint}`,
		isAuthenticated && !authLoading
	);

	useEffect(() => {
		if (!loading && !error && isAuthenticated) {
			dispatch({ type: 'GET_BOOKMARKS', payload: savedBookmarks });
		}
	}, [savedBookmarks, loading, error, isAuthenticated]);

	// Refetch bookmarks when user logs in
	useEffect(() => {
		if (isAuthenticated && !authLoading) {
			refetch();
		}
	}, [isAuthenticated, authLoading, refetch]);

	return (
		<BookmarksContext.Provider value={{ state, dispatch, loading: loading || authLoading, error }}>
			{children}
		</BookmarksContext.Provider>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<Global styles={globalStyles} />
			<AuthProvider>
				<BookmarksProvider>
					<Routes>
						<Route path='/' element={<Landing />} />
						<Route path='/login' element={<Login />} />
						<Route path='/register' element={<Register />} />
						<Route
							path='/bookmarks'
							element={
								<ProtectedRoute>
									<BookmarksList />
								</ProtectedRoute>
							}
						/>
					</Routes>
					<SpeedInsights />
					<Analytics />
				</BookmarksProvider>
			</AuthProvider>
		</BrowserRouter>
	);
}

