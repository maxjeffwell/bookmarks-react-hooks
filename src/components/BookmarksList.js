import React, { useContext , useReducer, useState } from 'react';
import Collapsible from 'react-collapsible';
import styled from '@emotion/styled';
import axios from 'axios';

import BookmarksContext from '../context';
import filterReducer from '../reducers/filterReducer';
import BookmarkForm from './BookmarkForm';

const StyledGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 2fr;
	grid-template-rows: 50px auto auto;
	grid-gap: 25px;
	text-align: center;
	line-height: 1.75;
	margin-top: -75px;
	.list-title {
		grid-column: 1 / 3;
		grid-row: 1 /2 ;
	}
	.filters {
		grid-column: 1 / 3;
		grid-row: 1 / 2;
		grid-auto-flow: row;
		margin-top: 125px;
	}
	.list-item__contentInner {
		padding-bottom: 5px;
		font-size: 1rem;
	}
	.list-item__contentOuter {
		padding-top: 5px;
	}
	span {
		margin-bottom: 5px;
	}
	button {
		height: auto;
		width: auto;
		background: ${props => props.theme.colors.secondary};
		font-size: 1.5rem;
		color: white;
		border: 0;
		border-radius: 5px;
		cursor: pointer;
		padding: auto;
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
		width: auto;
		height: 50%;
	}
	 .btn-filter {
  	width: 25%;
  }
	span + span {
    margin-left: 10px;
	}
	h3 {
		font-size: 2rem;
		margin-bottom: 5px;
		grid-row: 1;
		grid-column: 1 / 3;
	}
	label {
		font-weight: bold;
		font-size: 2rem;
		margin: 5px auto;
		padding: 5px 5px 5px 5px;
		box-shadow: inset 0 -4px 0px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,1);
		background: linear-gradient(top, #222 0%, #45484d 100%);
		white-space: nowrap;
	}
	select {
		width: 30%;
		height: auto;
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
		margin: 10px auto;
		grid-column: 1 / 3;
		grid-row: 2 / 3;
	}
	li {
		font-size: 1.5rem;
		line-height: .5;
		padding: 10px;
		width: auto;
		list-style-type: none;
		border: 2px solid black;
		margin-bottom: 10px;
		margin-right: 125px;
	}
	li > button, label {
		font-size: 1rem;
		margin: 2px auto;
	}
	input[type=checkbox] {
  	background: linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%);
  	border-radius: 50px;
  	margin-bottom: auto;
  	box-shadow: inset 0 1px 1px white, 0 1px 3px rgba(0,0,0,0.5);
  	cursor: pointer;
  }
  &:checked + label:after {
    opacity: 1;
  }
  &:hover::after {
    opacity: 0.3;
  }
`;

const StyledForm = styled.div`
	grid-column: 1 / 2;
	grid-row: 2 / 3;
`;

const StyledList= styled.div`
	display: grid;
	grid-column: 2 / 3;
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
			<div className="list-title">
			<h3>{title}</h3>
			</div>
			<div className="filters">
				<span>
			<button className="btn-filter" type="button" onClick={handleShowAll}>
				Show All
			</button>
				</span>
				<span>
			<button className="btn-filter" type="button" onClick={handleShowFavorites}>
				Show Favorites
			</button>
				</span>
				<span>
			<select className="btn filter" onChange={handleShowByRating}>
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
			<ul>
				{filteredBookmarks.map(bookmark => (
					<li key={bookmark.id}>
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
							<div className="list-item">
							<Collapsible trigger={bookmark.title}
							             triggerTagName="button"
							             transitionTime={300}
							             easing="cubic-bezier(0.175, 0.885, 0.32, 2.275)"
							             classParentString="list-item"
							             >
								<p><span>Url:</span>
									<span>
									<a href={bookmark.url} target="_blank" rel="noopener noreferrer">{bookmark.url}</a>
									</span>
									</p>
								<p>Rating: {bookmark.rating}</p>
								<p>Description: {bookmark.description}</p>
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
							</Collapsible>
							</div>
						</span>
						<span>
						<label className="list" htmlFor="checkbox-favorite">
							Add to Favorites
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
		</StyledList>
	</StyledGrid>
	);
}
