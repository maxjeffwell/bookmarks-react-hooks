import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

import BookmarksContext from '../context';

export default function BookmarkForm() {
	const [bookmarkTitle, setBookmarkTitle] = useState('');
	const [bookmarkUrl, setBookmarkUrl] = useState('');
	const [bookmarkDescription, setBookmarkDescription] = useState('');
	const { state: { currentBookmark = {} }, dispatch } = useContext(BookmarksContext);

	useEffect(() => {
		if (currentBookmark.title) {
			setBookmarkTitle(currentBookmark.title);
		} else {
			setBookmarkTitle('');
		}
	}, [currentBookmark.id]);

	useEffect(() => {
		if (currentBookmark.url) {
			setBookmarkUrl(currentBookmark.url);
		} else {
			setBookmarkUrl('');
		}
	}, [currentBookmark.id]);

	useEffect(() => {
		if (currentBookmark.description) {
			setBookmarkDescription(currentBookmark.description);
		} else {
			setBookmarkDescription('');
		}
	}, [currentBookmark.id]);

	const handleSubmit = async event => {
		event.preventDefault();
		if (currentBookmark.title) {
			const res = await axios.patch(
				`https://hooks-api.maxjeffwell.now.sh/bookmarks/${currentBookmark.id}`, {
					title: bookmarkTitle,
					url: bookmarkUrl,
					description: bookmarkDescription,
				}
			);
			dispatch({ type: 'UPDATE_BOOKMARK', payload: res.data });
		} else {
			const res = await axios.post(`https://hooks-api.maxjeffwell.now.sh/bookmarks`, {
				id: uuidv4(),
				title: bookmarkTitle,
				url: bookmarkUrl,
				description: bookmarkDescription,
			});
			dispatch({ type: 'ADD_BOOKMARK', payload: res.data });
			console.log(res.data);
		}
		setBookmarkTitle('');
		setBookmarkUrl('');
		setBookmarkDescription('');
	};

	return (
	<form onSubmit={handleSubmit}>
		<div>
		<label htmlFor="namedInput">Title</label>
		<input
			name="bookmarkTitle"
			type="text"
			aria-label={bookmarkTitle}
			aria-required="true"
			onChange={event => setBookmarkTitle(event.target.value)}
			value={bookmarkTitle}
			placeholder="Bookmark Title"
			required
			/>
		</div>
		<div>
		<label htmlFor="namedInput">Url</label>
			<input
				name="bookmarkUrl"
				type="url"
				aria-label={bookmarkUrl}
				aria-required="true"
				onChange={event => setBookmarkUrl(event.target.value)}
				value={bookmarkUrl}
				placeholder="Bookmark Url (https://...)"
				required
				/>
		</div>
		<div>
		<label htmlFor="namedInput">Description</label>
				<input
					name="bookmarkDescription"
					type="text"
					aria-label={bookmarkDescription}
					aria-required="true"
					onChange={event => setBookmarkDescription(event.target.value)}
					value={bookmarkDescription}
					placeholder="Bookmark Description"
					/>
		</div>
		<button type="submit">Submit
		</button>
		</form>
	);
};