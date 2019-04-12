import React, { useContext , useReducer, useState } from 'react';
import axios from 'axios';

import BookmarksContext from '../context';
import filterReducer from '../reducers/filterReducer';

export default function BookmarksList() {
	const { state, dispatch } = useContext(BookmarksContext);
	const [filter, dispatchFilter] = useReducer(filterReducer, 'ALL');
	const [rating, setRating] = useState('');
	const title = state.bookmarks.length > 0
	? 'Bookmarks' : 'You have not created any bookmarks yet ...';

	const handleShowFavorites = () => {
		dispatchFilter({ type: 'SHOW_FAVORITES' });
	};

	const handleShowAll = () => {
		dispatchFilter({ type: 'SHOW_ALL' });
	};

	const handleShowByRating = (event) => {
		setRating(event.target.value);
		dispatchFilter({ type: 'SHOW_BY_RATING'});
	};

	const filteredBookmarks = state.bookmarks.filter(b => {
		if (filter === 'ALL') {
			return true;
		}
		if (filter === 'FAVORITES' && b.checked) {
			return true;
		}
		return filter === 'RATING' && b.rating === rating;
	});

	return (
		<>
			<h1>{title}</h1>
			<button type="button" onClick={handleShowAll}>
				Show All Bookmarks
			</button>
			<button type="button" onClick={handleShowFavorites}>
				Show Favorites
			</button>
			<label>
				Sort By Rating
			</label>
			<select onChange={handleShowByRating}>
				<option value="" />>
				<option value="5 stars">5 stars</option>
				<option value="4 stars">4 stars</option>
				<option value="3 stars">3 stars</option>
				<option value="2 stars">2 stars</option>
				<option value="1 star">1 star</option>
		</select>
			<ul>
				{filteredBookmarks.map(bookmark => (
					<li key={bookmark.id}
					>
						<span
						onClick={async () => {
							const res = await axios.patch(
								`https://hooks-api.maxjeffwell.now.sh/bookmarks/${bookmark.id}`, {
									toggled: !bookmark.toggled
								}
							);
							dispatch({ type: 'TOGGLE_BOOKMARK',
								payload: res.data })
						}}
						>
							{bookmark.title}
						</span>
						<span>
							{bookmark.url}
						</span>
						<span>
							{bookmark.description}
						</span>
						<span>
							{bookmark.rating}
						</span>
						<button
							type="button"
							onClick={() => dispatch({ type: 'SET_CURRENT_BOOKMARK',
							payload: bookmark })}
						>
							Edit
						</button>
						<button
							type="button"
							onClick={async () => {
							await axios.delete(
								`https://hooks-api.maxjeffwell.now.sh/bookmarks/${bookmark.id}`
							);
							dispatch({ type: 'DELETE_BOOKMARK',
								payload: bookmark })
						}}
						>
							Delete
						</button>
						<label htmlFor="checkbox-favorite">Add to Favorites
							<input
								name="checkbox-favorite"
								aria-label="checkbox-favorite"
								type="checkbox"
								onChange={async () => {
									const res = await axios.patch(
										`https://hooks-api.maxjeffwell.now.sh/bookmarks/${bookmark.id}`, {
											checked: !bookmark.checked
										});
									dispatch({ type: 'ADD_BOOKMARK_TO_FAVORITES',
										payload: res.data })
								}}
								checked={bookmark.checked}
							/>
						</label>
					</li>
				))}
			</ul>
		</>
	)
};
