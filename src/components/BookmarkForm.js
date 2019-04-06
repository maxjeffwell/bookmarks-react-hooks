import React, { useState, useContext } from 'react';

import BookmarksContext from '../context';

const BookmarkForm = () => {
	const [bookmark, setBookmark] = useState("");
	const { state, dispatch } = useContext(BookmarksContext);

	const handleSubmit = event => {
		event.preventDefault();
		dispatch({ type: 'ADD_BOOKMARK', payload: bookmark });
		setBookmark('');
	};

	return (
	<form onSubmit={handleSubmit}>
		<input
			type="text"
			className="border-black border-solid border-2"
			onChange={event => setBookmark(event.target.value)}
			value={bookmark}
			/>
	</form>
	);
};

export default BookmarkForm;