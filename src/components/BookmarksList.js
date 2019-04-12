import React, { useContext } from 'react';
import axios from 'axios';

import BookmarksContext from '../context';

export default function BookmarksList() {
	const { state, dispatch } = useContext(BookmarksContext);
	const title = state.bookmarks.length > 0
	? 'Bookmarks' : 'You have not created any bookmarks yet ...';

	const handleShowFavorites = () => {

	};

	return (
		<>
			<h1>{title}</h1>
			<button type="button" onClick={handleShowFavorites}>
				Show Favorites
			</button>
			<ul>
				{state.bookmarks.map(bookmark => (
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
