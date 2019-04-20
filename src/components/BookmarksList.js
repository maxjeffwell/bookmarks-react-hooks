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
	line-height: 1;
	margin-top: -25px;
	button {
		background: ${props => props.theme.colors.secondary};
		font-size: 1.5rem;
		color: white;
		border: 0;
		border-radius: 5px;
		cursor: pointer;
		margin: -90px auto -10px auto;
		height: 50%;
		justify-content: space-evenly;
		padding: auto;
	}
	button:hover, button:focus {
		box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
	}
	h3 {
		font-size: 2rem;
		margin-bottom: 5px;
	}
	label {
		height: 50%;
		font-weight: bold;
		margin: 5px auto 0;
		padding: 5px 5px 5px 5px;
		box-shadow: inset 0 -4px 0px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,1);
		background: linear-gradient(top, #222 0%, #45484d 100%);
	}
	select {
		grid-row: 4;
		width: 25%;
		height: 50%;
		margin: -90px auto -10px auto;
		font-size: 1.5rem;
		color: white;
		background: ${props => props.theme.colors.secondary};
		text-align: center;
		border: 2px solid ${props => props.theme.colors.secondary};
		border-radius: 5px;
	}
	select:hover {
		cursor: pointer;
	}
	select:active {
		box-shadow: 3px 3px 5px 6px rgba(0, 0, 0, 0.4);
	}
	ul {
		margin: -90px auto;
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
			<button type="button" onClick={handleShowAll}>
				Show All Bookmarks
			</button>
			<button type="button" onClick={handleShowFavorites}>
				Show Favorites
			</button>
			<select onChange={handleShowByRating}>
				<option value="" hidden>Select a Rating</option>
				<option value="5 stars">5 stars</option>
				<option value="4 stars">4 stars</option>
				<option value="3 stars">3 stars</option>
				<option value="2 stars">2 stars</option>
				<option value="1 star">1 star</option>
				<option value="" />
			</select>
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
						<span>
							{bookmark.url}
						</span>
						<span>
							{bookmark.description}
						</span>
						<span>
							{bookmark.rating}
						</span>
						<button
							type="button"
							onClick={() => dispatch({type: 'SET_CURRENT_BOOKMARK', payload: bookmark})}
						>
							Edit
						</button>
						<button
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
						<p>
						<label htmlFor="checkbox-favorite">Add to Favorites
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
						</label>
						</p>
					</li>
				))}
			</ul>
		</StyledList>
	</StyledGrid>
	);
}
