import React, { useContext } from 'react';

import BookmarksContext from '../context';

const BookmarksList = () => {
	const { state, dispatch } = useContext(BookmarksContext);

	return (
		<div>
			<ul>
				{state.bookmarks.map(bookmark => (
					<li key={bookmark.id}>
						<span
						onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK',
						payload: bookmark })} className={`cursor-pointer ${bookmark.expanded &&
						"text-red"}`}
						>
							{bookmark.title}</span>
						<span>{bookmark.rating}</span>
						<button
						onClick={() => dispatch({ type: 'DELETE_BOOKMARK',
						payload: bookmark })}
						>

						</button>
					</li>
				))}
			</ul>
		</div>
	)
};

export default BookmarksList;