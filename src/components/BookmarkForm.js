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
	label {
		font-size: 1.5rem;
	}
	input {
		font-size: 1.5rem;
		color: white;
		border: 2 px solid ${props => props.theme.colors.primary};
		border-radius: 5px;
		display: grid;
		background: ${props => props.theme.colors.secondary};
		grid-template-columns: 1fr;
		width: 100%;
		padding: 5px;
		cursor: text;
		margin-bottom: 10px;
		margin-top: 10px;
	}
	input::placeholder {
  	color: white;
  	opacity: 0.4;
  	font-size: 1.5rem;
}
	input:focus {
		outline: none;
}
	textarea {
		display: grid;
		grid-template-columns: 1fr;
		width: 100%;
		font-size: 1.25rem;
		font-family: ${props => props.theme.fonts.secondary};
		letter-spacing: 1px;
		color: white;
		background: ${props => props.theme.colors.secondary};
		padding: 5px;
		border-radius: 5px;
		line-height: 1.5;
		border: 2px solid ${props => props.theme.colors.primary};
  	box-shadow: 1px 1px 1px #999;
  	margin-bottom: 10px;
  	margin-top: 10px;
}	
	textarea::placeholder {
  	color: white;
  	opacity: 0.4;
  	font-size: 1.5rem;
  	white-space: nowrap;
}
	fieldset legend {
		font-weight: normal;
		background: ${props => props.theme.colors.secondary};
		color: white;
		border: 2px solid ${props => props.theme.colors.secondary};
		border-radius: 5px;
		box-shadow: 1px 1px 1px #999;
		padding: 2px 5px 2px 5px;
		margin-top: 10px;
}
	fieldset input {
		cursor: pointer;
		outline: none;
		transition: 0.2s all linear;
		border: 2px solid ${props => props.theme.colors.secondary};
		border-radius: 50%;
		margin-bottom: -2px;
}
	fieldset input:checked {
  	border: 2px solid black;
}
	button {
		display: grid;
		font-size: 1.5rem;
		justify-content: space-evenly;
		margin: 10px auto;
		height: 75%;
		width: 75%;
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
	const ConditionalButton = currentBookmark.title ? 'Update Bookmark' : 'Create Bookmark';

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

	const handleReset = () => {
		setBookmarkTitle('');
		setBookmarkUrl('');
		setBookmarkDescription('');
		setBookmarkRating('');
	};

	return (
	<StyledForm onSubmit={handleSubmit} onReset={handleReset}>
		<h3>{title}</h3>
		<div>
		<label htmlFor="bookmarkTitle">Bookmark Title</label>
		<input
			name="bookmarkTitle"
			autoFocus={true}
			type="text"
			aria-label={bookmarkTitle}
			aria-required="true"
			onChange={event => setBookmarkTitle(event.target.value)}
			value={bookmarkTitle}
			placeholder="Title"
			minLength="1"
			maxLength="30"
			required
			/>
		</div>
		<div>
		<label htmlFor="bookmarkUrl">Bookmark Url</label>
			<input
				name="bookmarkUrl"
				type="url"
				aria-label={bookmarkUrl}
				aria-required="true"
				onChange={event => setBookmarkUrl(event.target.value)}
				value={bookmarkUrl}
				placeholder="http(s)://"
				minLength="7"
				required
				/>
		</div>
		<div>
		<label htmlFor="bookmarkDescription">Bookmark Description</label>
				<textarea
					name="bookmarkDescription"
					aria-label={bookmarkDescription}
					aria-required="true"
					onChange={event => setBookmarkDescription(event.target.value)}
					value={bookmarkDescription}
					placeholder="Description"
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
		<button type="reset">
			Clear Form Fields
		</button>
		</StyledForm>
	);
}