import React, { useContext } from 'react';
import axios from 'axios';

import BookmarksContext from '../context';

export default function BookmarksList() {
	const { state, dispatch } = useContext(BookmarksContext);
	const title = state.bookmarks.length > 0
	? 'Bookmarks' : 'You have not created any bookmarks yet ...';

	return (
		<>
			<h1>{title}</h1>
			<select>
				<option value="">Sort By Rating</option>
				<option value="5">5 stars</option>
				<option value="4">4 stars +</option>
				<option value="3">3 stars +</option>
				<option value="2">2 stars +</option>
				<option value="1">1 star +</option>
		</select>
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
						onClick={() => dispatch({ type: 'SET_CURRENT_BOOKMARK',
							payload: bookmark })}
						>
							Edit
						</button>
						<button
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
					</li>
				))}
			</ul>
		</>
	)
};
