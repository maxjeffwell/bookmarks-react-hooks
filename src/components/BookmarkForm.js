import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

import BookmarksContext from '../context';

export default function BookmarkForm() {
	const [bookmarkTitle, setBookmarkTitle] = useState('');
	const [bookmarkUrl, setBookmarkUrl] = useState('');
	const [bookmarkDescription, setBookmarkDescription] = useState('');
	const [bookmarkRating, setBookmarkRating] = useState(null);
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

	useEffect(() => {
		if (currentBookmark.rating) {
			setBookmarkRating(currentBookmark.rating);
		} else {
			setBookmarkRating(null);
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
					rating: bookmarkRating,
				}
			);
			dispatch({ type: 'UPDATE_BOOKMARK', payload: res.data });
		} else {
			const res = await axios.post(`https://hooks-api.maxjeffwell.now.sh/bookmarks`, {
				id: uuidv4(),
				title: bookmarkTitle,
				url: bookmarkUrl,
				description: bookmarkDescription,
				rating: bookmarkRating,
			});
			dispatch({ type: 'ADD_BOOKMARK', payload: res.data });
			console.log(res.data);
		}
		setBookmarkTitle('');
		setBookmarkUrl('');
		setBookmarkDescription('');
		setBookmarkRating(null);
	};

	return (
	<form onSubmit={handleSubmit}>
		<div>
		<label htmlFor="bookmarkTitle">Title</label>
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
		<label htmlFor="bookmarkUrl">Url</label>
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
		<label htmlFor="bookmarkDescription">Description</label>
				<input
					name="bookmarkDescription"
					type="textarea"
					aria-label={bookmarkDescription}
					aria-required="true"
					onChange={event => setBookmarkDescription(event.target.value)}
					value={bookmarkDescription}
					placeholder="Bookmark Description"
					/>
		</div>
		<div>
			<label htmlFor="bookmarkRating">Rating</label>
			<fieldset>
				<legend>Rating</legend>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
					onChange={event => setBookmarkRating(event.target.value)}
					value="1 star" checked={bookmarkRating === "1 star"}
				/>
				<label htmlFor="bookmarkRating-1">1 star</label>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
				       value="2 stars" checked={bookmarkRating === "2 stars"}
				/>
				<label htmlFor="bookmarkRating-2">2 stars</label>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
				       value="3 stars" checked={bookmarkRating === "3 stars"}
				/>
				<label htmlFor="bookmarkRating-3">3 stars</label>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
				       value="4 stars" checked={bookmarkRating === "4 stars"}
				/>
				<label htmlFor="bookmarkRating-4">4 stars</label>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
				       value="5 stars" checked={bookmarkRating === "5 stars"}
				/>
				<label htmlFor="bookmarkRating-5">5 stars</label>
			</fieldset>
		</div>
		<button type="submit">
			Submit
		</button>
		</form>
	);
};