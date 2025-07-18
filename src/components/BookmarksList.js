import React, { useContext , useReducer, useState } from 'react';
import Collapsible from 'react-collapsible';
import styled from '@emotion/styled';
import axios from 'axios';

import BookmarksContext from '../context';
import filterReducer from '../reducers/filterReducer';

import Header from './Header';
import Footer from './Footer';
import BookmarkForm from './BookmarkForm';
import * as style from './Breakpoints';

const StyledGrid = styled.div`
	display: grid;
	grid-template-columns: .25fr 1fr 1fr .25fr;
	grid-template-rows: auto 1fr auto;
	grid-column-gap: 2rem;
	grid-row-gap: 2rem;
	text-align: center;
	line-height: 1.5;
	width: 100%;
	background-color: #005995;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		margin-top: 0;
		overflow-x: hidden;
		overflow-y: hidden;
	}
	.list-title {
		grid-column: 1 / 3;
		grid-row: 1 / 2 ;
		@media (max-width: ${style.breakpoint.tablet}) {
			display: inline-block;
			text-align: center;
			margin: 20px auto;
		}
	}
	.filters {
		grid-column: 1 / 3;
		grid-row: 1 / 2;
		grid-auto-flow: row;
		margin-top: 125px;
		@media (max-width: ${style.breakpoint.tablet}) {
			display: inline-block;
			margin: 5px;
			width: 100%;
		}
	}
	.filters span {
		@media (max-width: ${style.breakpoint.tablet}) {
			width: auto;
			display: inline-block;
			margin: 0 auto 5px auto;
		}
	}
	.list-item__contentInner {
		font-family: ${props => props.theme.fonts.quinary};
		padding: .5rem;
		font-size: 1rem;
		background-color: #f5f5f5;
		border-radius: 5px;
		margin: 1rem 1rem 1rem 1rem;
	}
	.list-item__contentInner a, p {
		text-decoration: none;
		line-height: 1;
	}
		a:hover {
			text-decoration: underline;
		}
	.list-item__contentOuter {	
	@media (max-width: ${style.breakpoint.mobileS}) {
		display: inline-block;
		width: 100%;
	}
		padding-top: 5px;
	}
	span {
		margin-bottom: 5px;
		@media (max-width: ${style.breakpoint.tablet}) {
				width: 100%;
		}
	}
	button {
		height: auto;
		background: ${props => props.theme.colors.secondary};
		font-size: 1.5rem;
		color: white;
		border: 0;
		border-radius: 5px;
		cursor: pointer;
		white-space: nowrap;
		@media (max-width: ${style.breakpoint.tablet}) {
			padding-top: 2px;
			padding-bottom: 2px;
			cursor: pointer;
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
	.bookmark-list-btn {
		margin-right: 5px;
		height: 50%;
		font-size: 1rem;
		@media (max-width: ${style.breakpoint.tablet}) {
			font-size: 1.25rem;
		}
	}
	.btn-filter {
  		width: auto;
  			@media (max-width: ${style.breakpoint.tablet}) {
					margin-right: 5px;
			}
  }
	span + span {
    margin-left: 10px;
	}
	h3 {
		font-size: 2rem;
		margin: 25px auto;
	 :first-of-type {
		@media (max-width: ${style.breakpoint.tablet}) {
			margin-top: 10px;
			margin-bottom: 5px;
			}
		}
	}
	label {
		font-weight: bold;
		font-size: 2rem;
		padding: 5px 5px 5px 5px;
		box-shadow: inset 0 -4px 0px rgba(0,0,0,0.5), 0 0px 0 rgba(255,255,255,1);
		background: linear-gradient(top, #222 0%, #45484d 100%);
		white-space: nowrap;
	}
	select {
		height: auto;
		width: fit-content;
		font-size: 1.5rem;
		color: white;
		background: ${props => props.theme.colors.secondary};
		border: 0;
		border-radius: 5px;
		padding: .55px 6px .54px 6px;
		@media (max-width: ${style.breakpoint.tablet}) {
			padding: auto;
		}
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
		grid-column: 1 / 3;
		grid-row: 2 / 3;
		padding: 10px 40px 0;
		margin: 0 auto 2rem;
		@media (max-width: ${style.breakpoint.tablet}) {
			padding-top: 20px;
		}
	}
	li {
		font-size: 1.5rem;
		line-height: .5;
		padding: 10px;
		width: auto;
		list-style-type: none;
		border: 2px solid black;
		border-radius: 5px;
		margin-bottom: 10px;
	}
	li > button, label {
		font-size: 1rem;
		margin: 2px auto;
	}
	input[type=checkbox] {
		vertical-align: middle;
		width: 1rem;
		height: 1rem;
		border: 1px solid ${props => props.theme.colors.secondary};
		padding: .2rem .5rem;
  	background:  ${props => props.theme.colors.white};
  	border-radius: 50px;
  	margin-bottom: auto;
  	cursor: pointer;
  	appearance: none;
  	-webkit-appearance: none;
		-moz-appearance: none;
  } 
  input[type=checkbox]:focus {
  	outline: none;
  }
  input[type=checkbox]:checked {
  	background: ${props => props.theme.colors.primary};
  	border: 1px solid ${props => props.theme.colors.secondary};
    opacity: 1;
  }
  input:hover::after {
    opacity: 0.3;
  }
`;

const StyledForm = styled.div`
	grid-column: 2 / 3;
	grid-row: 2 / 3;
	background-color: #fbf579;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		min-width: 100%;
		margin: auto;
		padding-left: 10px;
		padding-right: 10px;
	}
`;

const StyledList= styled.div`
	display: grid;
	grid-column: 3 / 4;
	grid-row: 2 / 3;
	font-family: ${props => props.theme.fonts.secondary};
	background-color: #fa625f;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		min-width: 100%;
	}
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
			<Header />
		<StyledForm>
			<BookmarkForm />
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
			</select>
				</span>
				<span>
			<button className="btn-filter" type="button" onClick={() => window.location.reload()}>
				Refresh
			</button>
				</span>
			</div>
			<ul>
				{filteredBookmarks.map(bookmark => (
					<li key={bookmark.id}>
						<span>
							<div className="list-item">
							<Collapsible trigger={bookmark.title}
							             triggerTagName="button"
							             transitionTime={400}
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
								try {
									await axios.delete(
										`http://localhost:3001/bookmarks/${bookmark.id}`
									);
									dispatch({
										type: 'DELETE_BOOKMARK',
										payload: bookmark
									})
								} catch (error) {
									console.error('Failed to delete bookmark:', error);
									alert('Failed to delete bookmark. Please try again.');
								}
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
								try {
									const res = await axios.patch(
										`http://localhost:3001/bookmarks/${bookmark.id}`, {
											checked: !bookmark.checked
										});
									dispatch({
										type: 'ADD_BOOKMARK_TO_FAVORITES',
										payload: res.data
									})
								} catch (error) {
									console.error('Failed to update favorites:', error);
									alert('Failed to update favorites. Please try again.');
								}
							}}
							checked={bookmark.checked}
						/>
					</li>
				))}
			</ul>
		</StyledList>
		<Footer />
	</StyledGrid>
	);
}
