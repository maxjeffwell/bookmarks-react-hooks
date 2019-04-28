import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

import BookmarksContext from '../context';
import * as style from './Breakpoints';

export const StyledForm = styled.form`
	font-family: ${props => props.theme.fonts.secondary};
	font-weight: bold;
	padding-right: 10px;
	padding-left: 10px;
	text-align: center;
	@media (max-width: ${style.breakpoint.tablet}) {
		width: 100%;
	}
	@media (max-width: ${style.breakpoint.mobileS}) {
		font-size: 1rem;
	}
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
		width: 100%;
		font-size: 1.5rem;
		font-family: ${props => props.theme.fonts.secondary};
		letter-spacing: 1px;
		color: white;
		background: ${props => props.theme.colors.secondary};
		padding: 5px;
		border-radius: 5px;
		line-height: 1.5;
		border: 2px solid ${props => props.theme.colors.primary};
  	box-shadow: 1px 1px 1px #999;
  	margin-top: 10px;
  	resize: none;
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
		padding: 5px 5px 5px 5px;
		margin: 10px auto;
		width: auto;
	}
	fieldset > * {
		display: grid;
		grid-gap: 10px;
		line-height: 1rem;
		margin: auto;
	}
	fieldset label {
		font-size: 1.25rem;
		@media (max-width: ${style.breakpoint.mobileM}) {
			font-size: .75rem;
			}
		}
	fieldset input {
		grid-row: 1 / 2;
		cursor: pointer;
		outline: none;
		transition: 0.2s all linear;
		border: 2px solid ${props => props.theme.colors.secondary};
		border-radius: 50%;
		margin-bottom: -2px;
		float: left;
	}
	fieldset input:checked {
  	border: 2px solid black;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		div.form-btns p { 
			margin-bottom: 0;
		}
		& p:nth-of-type(2) {
			margin-top: 5px;
		}
	}
	button {
		font-size: 1.5rem;
		height: 75%;
		width: 50%;
		padding: 5px 5px 5px 5px;
		@media (max-width: ${style.breakpoint.tablet}) {
			width: auto;
		}
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
	}, [currentBookmark.id, currentBookmark.title]);

	useEffect(() => {
		if (currentBookmark.url) {
			setBookmarkUrl(currentBookmark.url);
		} else {
			setBookmarkUrl('');
		}
	}, [currentBookmark.id, currentBookmark.url]);

	useEffect(() => {
		if (currentBookmark.description) {
			setBookmarkDescription(currentBookmark.description);
		} else {
			setBookmarkDescription('');
		}
	}, [currentBookmark.id, currentBookmark.description]);

	useEffect(() => {
		if (currentBookmark.rating && currentBookmark.toggledRadioButton === true ) {
			setBookmarkRating(currentBookmark.rating);
		} else if (currentBookmark.toggledRadioButton === false) {
			setBookmarkRating('');
		} else {
			setBookmarkRating('');
		}
	}, [currentBookmark.id, currentBookmark.rating, currentBookmark.toggledRadioButton]);

	useEffect(() => {
		if (currentBookmark.toggledRadioButton) {
			setToggleRadioButton(currentBookmark.toggledRadioButton);
		} else {
			setToggleRadioButton(false);
		}
	}, [currentBookmark.id, currentBookmark.toggledRadioButton]);

	useEffect(() => {
		if (currentBookmark.checked) {
			setBookmarkChecked(currentBookmark.checked);
		} else {
			setBookmarkChecked(false);
		}
	}, [currentBookmark.id, currentBookmark.checked]);

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
				<div className="ratings">
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
				</div>
			</fieldset>
		</div>
		<div className="form-btns">
			<p>
		<button type="submit">
			{ConditionalButton}
		</button>
			</p>
			<p>
		<button type="reset">
			Clear Form Fields
		</button>
			</p>
		</div>
		</StyledForm>
	);
}