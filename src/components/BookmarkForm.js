import React, { useState, useEffect, useContext, useCallback, memo } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import DOMPurify from 'dompurify';

import BookmarksContext from '../context';
import * as style from './Breakpoints';
import { apiUrl, apiEndpoint } from '../config';

export const StyledForm = styled.form`
	font-family: ${props => props.theme.fonts.secondary};
	font-weight: bold;
	padding-right: 1rem;
	padding-left: 1rem;
	display: grid;
	place-items: center center;
	@media (max-width: ${style.breakpoint.tablet}) {
		width: 100%;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		box-sizing: border-box;
	}
	@media (max-width: ${style.breakpoint.mobileS}) {
		font-size: 1rem;
	}
	label {
		font-size: 1.5rem;
	}
	input {
		font-family: ${props => props.theme.fonts.quinary};
		font-size: 1.5rem;
		color: ${props => props.theme.colors.white};
		border: 2 px solid ${props => props.theme.colors.primary};
		border-radius: 5px;
		display: grid;
		background: ${props => props.theme.colors.secondary};
		grid-template-columns: 1fr;
		padding: 5px;
		cursor: text;
		margin-bottom: 1rem;
		margin-top: 1rem;
		width: 100%;
	}
	input[type=radio] {
		appearance: none;
		-moz-appearance: button;
		-webkit-appearance: none;
		justify-self: center;
		background-color: ${props => props.theme.colors.white};
		width: 1rem;
		height: 1rem;
		border: 1px solid ${props => props.theme.colors.secondary};
		border-radius: 50px;
		@media (max-width: ${style.breakpoint.tablet}) {
			min-width: 24px;
			min-height: 24px;
			width: 24px;
			height: 24px;
		}
	}
	input:-moz-ui-invalid:not(output) {
    box-shadow: none;
  }
	input[type=radio]:-moz-ui-invalid:not(output) {
    box-shadow: none;
  }
	input[type=radio]:focus {
  	outline: none;
  }
	input[type=radio]:checked {
  	background: ${props => props.theme.colors.primary};
  	border: 1px solid ${props => props.theme.colors.secondary};
  	opacity: 1;
  }
	input::placeholder {
		font-family: ${props => props.theme.fonts.quinary};
  	color: ${props => props.theme.colors.white};
  	opacity: 0.4;
  	font-size: 1.5rem;
	}
	input:focus {
		outline: none;
	}
	textarea {
		display: grid;
		font-size: 1.5rem;
		font-family: ${props => props.theme.fonts.quinary};
		letter-spacing: 1px;
		color: white;
		background: ${props => props.theme.colors.secondary};
		padding: 5px;
		border-radius: 5px;
		line-height: 1.5;
		border: 2px solid ${props => props.theme.colors.primary};
  	box-shadow: 1px 1px 1px #999;
  	margin-top: 1rem;
  	margin-bottom: 1rem;
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
		width: auto;
	}
	fieldset > * {
		display: grid;
		grid-gap: 10px;
		line-height: 1rem;
		margin: auto;
		@media (max-width: ${style.breakpoint.tablet}) {
			grid-gap: 15px;
			padding: 1rem;
		}
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
		width: 100%;
		padding: 5px 5px 5px 5px;
		@media (max-width: ${style.breakpoint.tablet}) {
			min-height: 44px;
			padding: 12px 24px;
			font-size: 1.2rem;
			width: 100%;
			margin: 0.5rem 0;
		}
	} 
	button:hover, button:focus {
		box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
	}
	button:active {
  	background: ${props => props.theme.colors.secondary};
  	color: ${props => props.theme.colors.white};
  	outline: 1px solid ${props => props.theme.colors.primary};
	}
`;

const BookmarkForm = memo(function BookmarkForm() {
	const [bookmarkTitle, setBookmarkTitle] = useState('');
	const [bookmarkUrl, setBookmarkUrl] = useState('');
	const [bookmarkDescription, setBookmarkDescription] = useState('');
	const [bookmarkRating, setBookmarkRating] = useState(0);
	const [bookmarkChecked, setBookmarkChecked] = useState(false);
	const [toggleRadioButton, setToggleRadioButton] = useState(false);

	const { state: { currentBookmark = {} }, dispatch } = useContext(BookmarksContext);

	// Consolidated useEffect for syncing currentBookmark to form state
	useEffect(() => {
		if (currentBookmark.id) {
			// Editing existing bookmark - populate form fields
			setBookmarkTitle(currentBookmark.title || '');
			setBookmarkUrl(currentBookmark.url || '');
			setBookmarkDescription(currentBookmark.description || '');
			// Parse rating as number — DB stores as TEXT so it arrives as a string like "3"
			const parsedRating = typeof currentBookmark.rating === 'string'
				? parseInt(currentBookmark.rating, 10) || 0
				: currentBookmark.rating || 0;
			setBookmarkRating(parsedRating);
			setToggleRadioButton(currentBookmark.toggledRadioButton || false);
			setBookmarkChecked(currentBookmark.checked || false);
		} else {
			// Creating new bookmark - reset form fields
			setBookmarkTitle('');
			setBookmarkUrl('');
			setBookmarkDescription('');
			setBookmarkRating(0);
			setToggleRadioButton(false);
			setBookmarkChecked(false);
		}
	}, [currentBookmark]);

	const title = !!currentBookmark && currentBookmark.title ? 'Edit Bookmark' : 'Create Bookmark';
	const ConditionalButton = currentBookmark.title ? 'Update Bookmark' : 'Create Bookmark';

	const validateUrl = useCallback((url) => {
		try {
			new URL(url);
			return url.startsWith('http://') || url.startsWith('https://');
		} catch {
			return false;
		}
	}, []);

	const handleSubmit = useCallback(async event => {
		event.preventDefault();
		
		// Input validation and sanitization
		const sanitizedTitle = DOMPurify.sanitize(bookmarkTitle.trim());
		const sanitizedUrl = bookmarkUrl.trim();
		const sanitizedDescription = DOMPurify.sanitize(bookmarkDescription.trim());
		
		// Validate required fields
		if (!sanitizedTitle || sanitizedTitle.length < 1 || sanitizedTitle.length > 100) {
			alert('Title must be between 1 and 100 characters');
			return;
		}
		
		if (!validateUrl(sanitizedUrl)) {
			alert('Please enter a valid HTTP or HTTPS URL');
			return;
		}
		
		if (sanitizedDescription.length > 500) {
			alert('Description must be less than 500 characters');
			return;
		}

		try {
			if (currentBookmark.title) {
				const res = await axios.patch(
					`${apiUrl}/${apiEndpoint}/${currentBookmark.id}`, {
						title: sanitizedTitle,
						url: sanitizedUrl,
						description: sanitizedDescription,
						rating: bookmarkRating,
						toggledRadioButton: toggleRadioButton,
						checked: bookmarkChecked,
					}
				);
				dispatch({ type: 'UPDATE_BOOKMARK', payload: res.data });
			} else {
				const res = await axios.post(`${apiUrl}/${apiEndpoint}`, {
					title: sanitizedTitle,
					url: sanitizedUrl,
					description: sanitizedDescription,
					rating: bookmarkRating,
					toggledRadioButton: toggleRadioButton,
					checked: bookmarkChecked,
				});
				dispatch({ type: 'ADD_BOOKMARK', payload: res.data });
			}
			setBookmarkTitle('');
			setBookmarkUrl('');
			setBookmarkDescription('');
			setBookmarkRating(0);
			setToggleRadioButton(false);
			setBookmarkChecked(false);
		} catch (error) {
			console.error('Failed to save bookmark:', error);
			alert('Failed to save bookmark. Please try again.');
		}
	}, [bookmarkTitle, bookmarkUrl, bookmarkDescription, bookmarkRating, toggleRadioButton, bookmarkChecked, currentBookmark, dispatch, validateUrl]);

	const handleReset = useCallback(() => {
		setBookmarkTitle('');
		setBookmarkUrl('');
		setBookmarkDescription('');
		setBookmarkRating(0);
	}, []);

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
			maxLength="100"
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
					maxLength="500"
					/>
		</div>
		<div>
			<fieldset>
				<legend>Bookmark Rating</legend>
				<div className="ratings">
				<input name="bookmarkRating" type="radio" aria-label="1 star rating"
				       onChange={event => setBookmarkRating(parseInt(event.target.value, 10))}
					     onClick={() => setToggleRadioButton(toggleRadioButton === false)}
					     value="1"
					     checked={bookmarkRating === 1 && !toggleRadioButton}
				/>
				<label htmlFor="bookmarkRating-1">1 star</label>
				<input name="bookmarkRating" type="radio" aria-label="2 star rating"
				       onChange={event => setBookmarkRating(parseInt(event.target.value, 10))}
				       onClick={() => setToggleRadioButton(toggleRadioButton)}
				       value="2"
				       checked={bookmarkRating === 2 && !toggleRadioButton}
				/>
				<label htmlFor="bookmarkRating-2">2 stars</label>
				<input name="bookmarkRating" type="radio" aria-label="3 star rating"
				       onChange={event => setBookmarkRating(parseInt(event.target.value, 10))}
				       onClick={() => setToggleRadioButton(toggleRadioButton)}
				       value="3"
				       checked={bookmarkRating === 3 && !toggleRadioButton}
				/>
				<label htmlFor="bookmarkRating-3">3 stars</label>
				<input name="bookmarkRating" type="radio" aria-label="4 star rating"
				       onChange={event => setBookmarkRating(parseInt(event.target.value, 10))}
				       onClick={() => setToggleRadioButton(toggleRadioButton)}
				       value="4"
				       checked={bookmarkRating === 4 && !toggleRadioButton}
				/>
				<label htmlFor="bookmarkRating-4">4 stars</label>
				<input name="bookmarkRating" type="radio" aria-label="5 star rating"
				       onChange={event => setBookmarkRating(parseInt(event.target.value, 10))}
				       onClick={() => setToggleRadioButton(toggleRadioButton)}
				       value="5"
				       checked={bookmarkRating === 5 && !toggleRadioButton}
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
});

export default BookmarkForm;