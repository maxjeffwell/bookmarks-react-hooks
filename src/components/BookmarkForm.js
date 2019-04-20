import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

import BookmarksContext from '../context';

export const StyledForm = styled.form`
	font-family: ${props => props.theme.fonts.secondary};
	font-weight: bold;
	padding-left: 10px;
	text-align: center;
	input {
	font-size: 1.5rem;
	border-radius: 5px;
	display: grid;
	grid-template-columns: 1fr;
	width: 100%;
	padding: 0 5px 0 5px;
	cursor: text;
	}
	&::placeholder {
  color: ${props => props.theme.colors.secondary};
  font-size: 1.5rem;
  padding: 5px 5px 5px 5px;
}
textarea {
	display: grid;
	grid-template-columns: 1fr;
	width: 100%;
	font-size: 1.25rem;
	letter-spacing: 1px;
	color: white;
	background: ${props => props.theme.colors.secondary};
	padding: 10px;
	border-radius: 5px;
	line-height: 1.5;
	border: 2px solid ${props => props.theme.colors.secondary};
  box-shadow: 1px 1px 1px #999;
  margin-bottom: 10px;
}
fieldset legend {
	font-weight: normal;
	background: ${props => props.theme.colors.secondary};
	color: white;
	border: 2px solid ${props => props.theme.colors.secondary};
	border-radius: 5px;
	box-shadow: 1px 1px 1px #999;
	padding: 5px 5px 5px 5px;
	margin-top: 10px;
}
fieldset input {
	cursor: pointer;
	outline: none;
	transition: 0.2s all linear;
	border: 2px solid ${props => props.theme.colors.secondary};
	border-radius: 50%;
}
fieldset input:checked {
  border: 6px solid black;
}
button {
	font-size: 1.5rem;
	justify-content: space-evenly;
	margin-top: 10px;
	height: 75%;
	padding: 5px 5px 5px 5px;
} 
button:hover, button:focus {
	box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
}
button:active {
  background: ${props => props.theme.colors.secondary};
  color: white;
  outline: 1px solid black;
}
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

	const title = !!currentBookmark && currentBookmark.title ? 'Edit Bookmark' : 'Create Bookmark';
	const ConditionalButton = currentBookmark.title ? 'Edit Bookmark' : 'Create Bookmark';

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
		<h3>{title}</h3>
		<div>
		<label htmlFor="bookmarkTitle">Title</label>
		<input
			name="bookmarkTitle"
			autoFocus="true"
			type="text"
			aria-label={bookmarkTitle}
			aria-required="true"
			onChange={event => setBookmarkTitle(event.target.value)}
			value={bookmarkTitle}
			placeholder="Bookmark Title (required)"
			minLength="1"
			maxLength="30"
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
				placeholder="Bookmark Url [http(s)://...] (required)"
				minLength="7"
				required
				/>
		</div>
		<div>
		<label htmlFor="bookmarkDescription">Description</label>
				<textarea
					name="bookmarkDescription"
					aria-label={bookmarkDescription}
					aria-required="true"
					onChange={event => setBookmarkDescription(event.target.value)}
					value={bookmarkDescription}
					placeholder="Bookmark Description (optional)"
					rows={5}
					cols={30}
					/>
		</div>
		<div>
			<fieldset>
				<legend>Bookmark Rating</legend>
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
			{ConditionalButton}
		</button>
		</StyledForm>
	);
}