import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

import BookmarksContext from '../context';

const StyledForm = styled.form`
	display: grid;
`;

export default function BookmarkForm() {
	const [bookmarkTitle, setBookmarkTitle] = useState('');
	const [bookmarkUrl, setBookmarkUrl] = useState('');
	const [bookmarkDescription, setBookmarkDescription] = useState('');
	const [bookmarkRating, setBookmarkRating] = useState('');
	const [bookmarkChecked, setBookmarkChecked] = useState(false);
	const [toggleRadioButton, setToggleRadioButton] = useState(false);

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
		if (currentBookmark.rating && currentBookmark.toggledRadioButton === true ) {
			setBookmarkRating(currentBookmark.rating);
		} else if (currentBookmark.toggledRadioButton === false) {
			setBookmarkRating('');
		} else {
			setBookmarkRating('');
		}
	}, [currentBookmark.id]);

	useEffect(() => {
		if (currentBookmark.toggledRadioButton) {
			setToggleRadioButton(currentBookmark.toggledRadioButton);
		} else {
			setToggleRadioButton(false);
		}
	}, [currentBookmark.id]);

	useEffect(() => {
		if (currentBookmark.checked) {
			setBookmarkChecked(currentBookmark.checked);
		} else {
			setBookmarkChecked(false);
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
					toggledRadioButton: toggleRadioButton,
					checked: bookmarkChecked,
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
				toggledRadioButton: toggleRadioButton,
				checked: bookmarkChecked,
			});
			dispatch({ type: 'ADD_BOOKMARK', payload: res.data });
		}
		setBookmarkTitle('');
		setBookmarkUrl('');
		setBookmarkDescription('');
		setBookmarkRating('');
		setToggleRadioButton(false);
		setBookmarkChecked(false);
	};

	return (
	<StyledForm onSubmit={handleSubmit}>
		<h1>Create A Bookmark</h1>
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
			minLength="1"
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
				placeholder="Bookmark Url (http(s)://...)"
				minLength="7"
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
			<fieldset>
				<legend>Rating</legend>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
					     onClick={() => setToggleRadioButton(toggleRadioButton === false)}
					     value="1 star"
					     checked={bookmarkRating === "1 star" && !toggleRadioButton}
				       required
				/>
				<label htmlFor="bookmarkRating-1">1 star</label>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
				       onClick={() => setToggleRadioButton(toggleRadioButton)}
				       value="2 stars"
				       checked={bookmarkRating === "2 stars" && !toggleRadioButton}
				/>
				<label htmlFor="bookmarkRating-2">2 stars</label>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
				       onClick={() => setToggleRadioButton(toggleRadioButton)}
				       value="3 stars"
				       checked={bookmarkRating === "3 stars" && !toggleRadioButton}
				/>
				<label htmlFor="bookmarkRating-3">3 stars</label>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
				       onClick={() => setToggleRadioButton(toggleRadioButton)}
				       value="4 stars"
				       checked={bookmarkRating === "4 stars" && !toggleRadioButton}
				/>
				<label htmlFor="bookmarkRating-4">4 stars</label>
				<input name="bookmarkRating" type="radio" aria-label={bookmarkRating}
				       onChange={event => setBookmarkRating(event.target.value)}
				       onClick={() => setToggleRadioButton(toggleRadioButton)}
				       value="5 stars"
				       checked={bookmarkRating === "5 stars" && !toggleRadioButton}
				/>
				<label htmlFor="bookmarkRating-5">5 stars</label>
			</fieldset>
		</div>
		<button type="submit">
			Create Bookmark
		</button>
		</StyledForm>
	);
};