import React, { useContext , useReducer, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';

import BookmarksContext from '../context';
import filterReducer from '../reducers/filterReducer';
import BookmarkForm from './BookmarkForm';

const StyledGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 2fr;
	grid-template-rows: auto auto auto;
	grid-gap: 25px;
	text-align: center;
	line-height: 1.75;
	margin-top: -25px;
	.filters {
		margin-top: -255px;
		height: 90%;
	}
	.list {
		margin-top: -360px;
		margin-right: 30px;
	}
	button {
		grid-row: 2;
		height: 12%;
		width: 30%;
		background: ${props => props.theme.colors.secondary};
		font-size: 1.5rem;
		color: white;
		border: 0;
		border-radius: 5px;
		cursor: pointer;
	}
	button:hover, button:focus {
		box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
	}
	button:active {
  	background: ${props => props.theme.colors.secondary};
  	color: white;
  	outline: 1px solid black;
	}
	.bookmark-list-btn {
		width: 15%;
		height: 50%;
	}
	span + span {
    margin-left: 10px;
	}
	h3 {
		font-size: 2rem;
		margin-bottom: 5px;
	}
	label {
		font-weight: bold;
		font-size: 2rem;
		margin: 5px auto 0;
		padding: 5px 5px 5px 5px;
		box-shadow: inset 0 -4px 0px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,1);
		background: linear-gradient(top, #222 0%, #45484d 100%);
		white-space: nowrap;
	}
	select {
		grid-row: 2;
		width: 30%;
		height: 12%;
		font-size: 1.5rem;
		color: white;
		background: ${props => props.theme.colors.secondary};
		text-align: center;
		border: 0;
		border-radius: 5px;
		padding: auto;
	}
	select:hover {
		cursor: pointer;
		box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
	}
	select:active {
		box-shadow: 3px 3px 5px 6px rgba(0, 0, 0, 0.4);
	}
	option {
		text-align: center;
	}
	ul {
		grid-row: 3;
		margin: -90px auto;
		list-style-type: none;
	}
	li {
		font-size: 1.5rem;
		border: 1px solid black;
		line-height: .5;
		padding: 10px;
		width: 100%;
		white-space: nowrap;
	}
	li > button, label {
		font-size: 1rem;
		display: inline;
		margin: 2px auto;
	}
	input[type=checkbox] {
  	background: linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%);
  	border-radius: 50px;
  	margin-bottom: auto;
  	box-shadow: inset 0 1px 1px white, 0 1px 3px rgba(0,0,0,0.5);
  }
  &:checked + label:after {
    opacity: 1;
  }
  &:hover::after {
    opacity: 0.3;
  }
`;

const StyledForm = styled.div`
	grid-column: 1;
	grid-row: 2 / 3;
`;

const StyledList= styled.div`
	display: grid;
	grid-column: 2;
	grid-row: 2 / 3;
	font-family: ${props => props.theme.fonts.secondary};
`;

export default function BookmarksList() {
	const { state, dispatch } = useContext(BookmarksContext);
	const [filter, dispatchFilter] = useReducer(filterReducer, 'ALL');
	const [rating, setRating] = useState('');
	const title = state.bookmarks.length > 0
	? 'My Bookmarks' : 'You have not created any bookmarks yet ...';

	const handleShowFavorites = () => {
		dispatchFilter({ type: 'SHOW_FAVORITES' });
	};

	const handleShowAll = () => {
		dispatchFilter({ type: 'SHOW_ALL' });
	};

	const handleShowByRating = (event) => {
		setRating(event.target.value);
		dispatchFilter({ type: 'SHOW_BY_RATING'});
	};

	const filteredBookmarks = state.bookmarks.filter(b => {
		if (filter === 'ALL') {
			return true;
		}
		if (filter === 'FAVORITES' && b.checked) {
			return true;
		}
		return filter === 'RATING' && b.rating === rating;
	});

	return (
		<StyledGrid>
		<StyledForm>
			<BookmarkForm/>
		</StyledForm>
		<StyledList>
			<h3>{title}</h3>
			<div className="filters">
				<span>
			<button type="button" onClick={handleShowAll}>
				Show All Bookmarks
			</button>
				</span>
				<span>
			<button type="button" onClick={handleShowFavorites}>
				Show Favorites
			</button>
				</span>
				<span>
			<select onChange={handleShowByRating}>
				<option value="" hidden>Sort by Rating</option>
				<option value="5 stars">5 stars</option>
				<option value="4 stars">4 stars</option>
				<option value="3 stars">3 stars</option>
				<option value="2 stars">2 stars</option>
				<option value="1 star">1 star</option>
				<option value="">Not Rated</option>
			</select>
				</span>
			</div>
			<div className="list">
			<ul>
				{filteredBookmarks.map(bookmark => (
					<li key={bookmark.id}
					>
						<span
							onClick={async () => {
								const res = await axios.patch(
									`https://hooks-api.maxjeffwell.now.sh/bookmarks/${bookmark.id}`, {
										toggled: !bookmark.toggled
									}
								);
								dispatch({
									type: 'TOGGLE_BOOKMARK',
									payload: res.data
								})
							}}
						>
							{bookmark.title}
						</span>
						{/*<span>*/}
						{/*	{bookmark.url}*/}
						{/*</span>*/}
						{/*<span>*/}
						{/*	{bookmark.description}*/}
						{/*</span>*/}
						<span>
						<button
							className="bookmark-list-btn"
							type="button"
							onClick={() => dispatch({type: 'SET_CURRENT_BOOKMARK', payload: bookmark})}
						>
							Edit
						</button>
						</span>
						<span>
						<button
							className="bookmark-list-btn"
							type="button"
							onClick={async () => {
								await axios.delete(
									`https://hooks-api.maxjeffwell.now.sh/bookmarks/${bookmark.id}`
								);
								dispatch({
									type: 'DELETE_BOOKMARK',
									payload: bookmark
								})
							}}
						>
							Delete
						</button>
						</span>
						{/*<span>*/}
						{/*	Rating: {bookmark.rating}*/}
						{/*</span>*/}
						<span>
						<label htmlFor="checkbox-favorite">Add to Favorites
						</label>
						</span>
							<input
								name="checkbox-favorite"
								aria-label="checkbox-favorite"
								type="checkbox"
								onChange={async () => {
									const res = await axios.patch(
										`https://hooks-api.maxjeffwell.now.sh/bookmarks/${bookmark.id}`, {
											checked: !bookmark.checked
										});
									dispatch({
										type: 'ADD_BOOKMARK_TO_FAVORITES',
										payload: res.data
									})
								}}
								checked={bookmark.checked}
							/>
					</li>
				))}
			</ul>
			</div>
		</StyledList>
	</StyledGrid>
	);
}
