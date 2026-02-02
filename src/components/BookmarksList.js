import React, { useContext , useReducer, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Collapsible from 'react-collapsible';
import styled from '@emotion/styled';
import axios from 'axios';

import BookmarksContext from '../context';
import filterReducer from '../reducers/filterReducer';
import { apiUrl, apiEndpoint } from '../config';

import Header from './Header';
import Footer from './Footer';
import BookmarkForm from './BookmarkForm';
import BookmarkImport from './BookmarkImport';
import BookmarkAIFeatures from './BookmarkAIFeatures';
import SemanticSearch from './SemanticSearch';
import * as style from './Breakpoints';

const StyledGrid = styled.div`
	display: grid;
	grid-template-columns: .25fr 1fr 1fr .25fr;
	grid-template-rows: auto 1fr auto;
	grid-column-gap: 1rem;
	grid-row-gap: 1rem;
	text-align: center;
	line-height: 1.5;
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background-color: #005995;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0.5rem;
		height: auto;
		overflow-x: hidden;
		overflow-y: auto;
	}
	.list-title {
		grid-column: 1 / 3;
		grid-row: 1 / 2 ;
		@media (max-width: ${style.breakpoint.tablet}) {
			text-align: center;
			margin: 10px 0;
			order: 1;
		}
	}
	.filters {
		grid-column: 1 / 3;
		grid-row: 2 / 3;
		grid-auto-flow: row;
		margin-top: 0;
		@media (max-width: ${style.breakpoint.tablet}) {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			margin: 1rem 0;
			width: 100%;
			order: 2;
		}
	}
	.filters span {
		@media (max-width: ${style.breakpoint.tablet}) {
			width: 100%;
			display: block;
			margin: 0;
		}
	}
	.list-item__contentInner {
		font-family: ${props => props.theme.fonts.secondary};
		padding: 1.25rem;
		font-size: 1.1rem;
		background-color: transparent;
		border-radius: 8px;
		margin: 0.5rem 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		@media (max-width: ${style.breakpoint.tablet}) {
			padding: 1rem;
			gap: 0.75rem;
			margin: 0.25rem 0;
		}
	}
	.list-item__contentInner p {
		margin: 0;
		line-height: 1.6;
	}
	.list-item__contentInner a {
		text-decoration: none;
		color: #1976d2;
		word-break: break-all;
	}
	.list-item__contentInner a:hover {
		text-decoration: underline;
	}

	/* Section Cards */
	.bookmark-section {
		padding: 1rem;
		border-radius: 8px;
		margin: 0;
	}
	.bookmark-section-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}
	.bookmark-section-url {
		background-color: #e3f2fd;
		border: 1px solid #bbdefb;
	}
	.bookmark-section-url .bookmark-section-label {
		color: #1565c0;
	}
	.bookmark-section-url a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.bookmark-section-url a::after {
		content: '↗';
		font-size: 0.85em;
		opacity: 0.7;
	}
	.bookmark-section-rating {
		background-color: #fff8e1;
		border: 1px solid #ffecb3;
	}
	.bookmark-section-rating .bookmark-section-label {
		color: #f57c00;
	}
	.bookmark-section-rating .stars {
		color: #ffa000;
		font-size: 1.25rem;
		letter-spacing: 0.1em;
	}
	.bookmark-section-rating .stars-empty {
		color: #e0e0e0;
	}
	.bookmark-section-description {
		background-color: #f5f5f5;
		border: 1px solid #e0e0e0;
	}
	.bookmark-section-description .bookmark-section-label {
		color: #616161;
	}
	.bookmark-section-description p {
		color: #333;
		max-height: 200px;
		overflow-y: auto;
	}
	.bookmark-section-description .no-description {
		color: #9e9e9e;
		font-style: italic;
	}

	/* Action Buttons Row */
	.bookmark-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}
	.bookmark-actions button {
		padding: 0.6rem 1.25rem;
		font-size: 0.95rem;
		border-radius: 6px;
		font-weight: 600;
		transition: all 0.2s ease;
	}
	.bookmark-actions button:hover {
		transform: translateY(-1px);
	}
	.btn-edit {
		background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
	}
	.btn-delete {
		background: #dc3545 !important;
	}
	.btn-delete:hover {
		background: #c82333 !important;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		.bookmark-actions {
			flex-direction: column;
		}
		.bookmark-actions button {
			width: 100%;
			min-height: 44px;
		}
	}

	/* Trigger Button Styles */
	.bookmark-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		text-align: left;
	}
	.trigger-arrow {
		font-size: 0.75em;
		opacity: 0.6;
		transition: transform 0.3s ease;
		margin-left: 0.5rem;
	}
	.list-item__trigger {
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		font-family: ${props => props.theme.fonts.quinary};
		font-size: 1.25rem;
		background-color: #7b1f1d;
		color: #ffffff;
		border: none;
		cursor: pointer;
		border-radius: 6px;
		transition: background-color 0.2s ease;
	}
	.list-item__trigger:hover {
		background-color: #B4E4BE;
	}
	.list-item__trigger.is-open .trigger-arrow {
		transform: rotate(180deg);
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
			min-height: 44px;
			min-width: 120px;
			padding: 12px 16px;
			font-size: 1.2rem;
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
					width: 100%;
					margin: 0;
			}
  }
	span + span {
    margin-left: 10px;
		@media (max-width: ${style.breakpoint.tablet}) {
			margin-left: 0;
		}
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
		text-align: center;
		@media (max-width: ${style.breakpoint.tablet}) {
			width: 100%;
			min-height: 44px;
			padding: 12px 16px;
			font-size: 1.2rem;
			text-align: center;
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
		grid-row: 4 / 5;
		padding: 10px 20px 0;
		margin: 0 auto 2rem;
		@media (max-width: ${style.breakpoint.tablet}) {
			padding: 0.5rem;
			margin: 0;
			width: 100%;
			box-sizing: border-box;
			order: 5;
		}
	}
	li {
		font-size: 1.5rem;
		line-height: 1.5;
		padding: 12px 16px;
		width: auto;
		list-style-type: none;
		border: 2px solid #343436;
		border-radius: 8px;
		margin-bottom: 12px;
		background: #fff;
		@media (max-width: ${style.breakpoint.tablet}) {
			margin: 0 0 0.75rem 0;
			padding: 10px 12px;
			width: 100%;
			box-sizing: border-box;
		}
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
		@media (max-width: ${style.breakpoint.tablet}) {
			min-width: 24px;
			min-height: 24px;
			width: 24px;
			height: 24px;
		}
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

	@keyframes highlight {
		0% {
			background-color: rgba(102, 126, 234, 0.4);
			transform: scale(1.02);
		}
		100% {
			background-color: transparent;
			transform: scale(1);
		}
	}
`;

const StyledContent = styled.div`
	grid-column: 2 / 4;
	grid-row: 2 / 3;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0;
	min-height: 0;
	overflow: hidden;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: contents;
	}
`;

const StyledForm = styled.div`
	background-color: #fbf579;
	overflow-y: auto;
	height: 100%;
	@media (max-width: ${style.breakpoint.tablet}) {
		width: 100%;
		margin: 0;
		padding: 1rem;
		border-radius: 8px;
		order: 0;
		overflow-y: visible;
		height: auto;
	}
`;

const StyledFormInner = styled.div`
	padding: 1rem;
	padding-bottom: 3rem;
`;

const StyledList = styled.div`
	display: grid;
	font-family: ${props => props.theme.fonts.secondary};
	background-color: #fa625f;
	overflow-y: auto;
	height: 100%;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: contents;
	}
`;

const SemanticSearchWrapper = styled.div`
	grid-column: 1 / 3;
	grid-row: 3 / 4;
	margin: 0 20px;
	@media (max-width: ${style.breakpoint.tablet}) {
		margin: 0.5rem;
		order: 4;
	}
`;

// Helper function to render visual star rating
const renderStars = (ratingStr) => {
	const ratingMap = {
		'5 stars': 5,
		'4 stars': 4,
		'3 stars': 3,
		'2 stars': 2,
		'1 star': 1,
	};
	const numStars = ratingMap[ratingStr] || 0;
	const filled = '★'.repeat(numStars);
	const empty = '☆'.repeat(5 - numStars);
	return (
		<span className="stars">
			{filled}<span className="stars-empty">{empty}</span>
		</span>
	);
};

export default function BookmarksList() {
	const { state, dispatch, loading, error } = useContext(BookmarksContext);
	const [filter, dispatchFilter] = useReducer(filterReducer, 'ALL');
	const [rating, setRating] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState(null);
	const [isSearching, setIsSearching] = useState(false);
	const [showImport, setShowImport] = useState(false);
	const [isGeneratingTags, setIsGeneratingTags] = useState(false);
	const [showSemanticSearch, setShowSemanticSearch] = useState(false);
	const searchTimeoutRef = useRef(null);

	const title = state.bookmarks.length > 0
	? 'My Bookmarks' : 'You have not created any bookmarks yet ...';

	const handleShowFavorites = useCallback(() => {
		dispatchFilter({ type: 'SHOW_FAVORITES' });
	}, []);

	const handleShowAll = useCallback(() => {
		dispatchFilter({ type: 'SHOW_ALL' });
	}, []);

	const handleShowByRating = useCallback((event) => {
		setRating(event.target.value);
		dispatchFilter({ type: 'SHOW_BY_RATING'});
	}, []);

	const handleRefresh = useCallback(async () => {
		try {
			const res = await axios.get(`${apiUrl}/${apiEndpoint}`);
			dispatch({ type: 'GET_BOOKMARKS', payload: res.data });
		} catch (error) {
			console.error('Failed to refresh bookmarks:', error);
			alert('Failed to refresh bookmarks. Please try again.');
		}
	}, [dispatch]);

	// Batch generate tags for all bookmarks
	const handleBatchGenerateTags = useCallback(async () => {
		if (!window.confirm(`Generate AI tags for all ${state.bookmarks.length} bookmarks? This may take a few minutes.`)) {
			return;
		}

		setIsGeneratingTags(true);
		let successCount = 0;
		let errorCount = 0;

		for (const bookmark of state.bookmarks) {
			try {
				await axios.post(`${apiUrl}/ai/tags`, {
					bookmarkId: bookmark.id,
				});
				successCount++;
			} catch (error) {
				console.error(`Failed to tag bookmark ${bookmark.id}:`, error);
				errorCount++;
			}
		}

		setIsGeneratingTags(false);
		alert(`Tagging complete!\n✓ Success: ${successCount}\n✗ Errors: ${errorCount}`);

		// Refresh bookmarks to show new tags
		await handleRefresh();
	}, [state.bookmarks, handleRefresh]);

	// Debounced search handler
	const handleSearch = useCallback((query) => {
		setSearchQuery(query);

		// Clear existing timeout
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		// Clear search if query is empty
		if (!query || query.trim().length === 0) {
			setSearchResults(null);
			setIsSearching(false);
			return;
		}

		// Debounce search API call
		setIsSearching(true);
		searchTimeoutRef.current = setTimeout(async () => {
			try {
				const res = await axios.get(`${apiUrl}/search`, {
					params: { q: query.trim() }
				});
				setSearchResults(res.data.results);
				setIsSearching(false);
			} catch (error) {
				console.error('Search failed:', error);
				setIsSearching(false);
				// Fallback to client-side filtering
				const filtered = state.bookmarks.filter(b =>
					b.title?.toLowerCase().includes(query.toLowerCase()) ||
					b.url?.toLowerCase().includes(query.toLowerCase()) ||
					b.description?.toLowerCase().includes(query.toLowerCase())
				);
				setSearchResults(filtered);
			}
		}, 300);
	}, [state.bookmarks]);

	// Clear search timeout on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	// Handle semantic search result selection
	const handleSemanticResultSelect = useCallback((result) => {
		// Find the bookmark in our list and scroll to it or highlight it
		const bookmarkElement = document.querySelector(`[data-bookmark-id="${result.id}"]`);
		if (bookmarkElement) {
			bookmarkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
			bookmarkElement.style.animation = 'highlight 2s ease-out';
		}
	}, []);

	const filteredBookmarks = useMemo(() => {
		// Use search results if search is active
		const baseBookmarks = searchResults !== null ? searchResults : state.bookmarks;

		return baseBookmarks.filter(b => {
			if (filter === 'ALL') {
				return true;
			}
			if (filter === 'FAVORITES' && b.checked) {
				return true;
			}
			return filter === 'RATING' && b.rating === rating;
		});
	}, [state.bookmarks, searchResults, filter, rating]);

	return (
		<StyledGrid>
			<Header />
		<StyledContent>
		<StyledForm>
			<StyledFormInner>
				<BookmarkForm />
			</StyledFormInner>
		</StyledForm>
		<StyledList>
			<div className="list-title">
			<h3>{title}</h3>
			</div>
			<div className="filters">
				<span style={{ width: '100%', marginBottom: '1rem' }}>
					<input
						type="text"
						placeholder="🔍 Search bookmarks..."
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						style={{
							width: '100%',
							padding: '0.75rem',
							fontSize: '1.25rem',
							borderRadius: '5px',
							border: '2px solid #343436',
							backgroundColor: isSearching ? '#f0f0f0' : 'white',
							boxSizing: 'border-box'
						}}
					/>
					{searchQuery && (
						<span style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem', display: 'block' }}>
							{isSearching ? 'Searching...' : `Found ${filteredBookmarks.length} result${filteredBookmarks.length !== 1 ? 's' : ''}`}
						</span>
					)}
				</span>
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
			<button className="btn-filter" type="button" onClick={handleRefresh}>
				Refresh
			</button>
				</span>
				<span>
			<button className="btn-filter" type="button" onClick={() => setShowImport(!showImport)}>
				{showImport ? 'Hide Import' : '📥 Import Bookmarks'}
			</button>
				</span>
				<span>
			<button
				className="btn-filter"
				type="button"
				onClick={handleBatchGenerateTags}
				disabled={isGeneratingTags || state.bookmarks.length === 0}
			>
				{isGeneratingTags ? '⏳ Generating Tags...' : '🤖 Auto-Tag All'}
			</button>
				</span>
				<span>
			<button
				className="btn-filter"
				type="button"
				onClick={() => setShowSemanticSearch(!showSemanticSearch)}
				style={{
					background: showSemanticSearch ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined
				}}
			>
				{showSemanticSearch ? '🧠 Hide AI Search' : '🧠 AI Search'}
			</button>
				</span>
			</div>
			{showImport && <BookmarkImport />}
			{showSemanticSearch && (
				<SemanticSearchWrapper>
					<SemanticSearch onResultSelect={handleSemanticResultSelect} />
				</SemanticSearchWrapper>
			)}
			<ul>
				{loading && (
					<li style={{ textAlign: 'center', fontSize: '1.5rem' }}>
						Loading bookmarks...
					</li>
				)}
				{error && (
					<li style={{ textAlign: 'center', fontSize: '1.5rem', color: '#ff4444' }}>
						Error loading bookmarks: {error.message}
					</li>
				)}
				{!loading && !error && filteredBookmarks.map(bookmark => (
					<li key={bookmark.id} data-bookmark-id={bookmark.id}>
						<span>
							<div className="list-item">
							<Collapsible
								trigger={<span className="bookmark-trigger">{bookmark.title} <span className="trigger-arrow">▼</span></span>}
								triggerTagName="button"
								transitionTime={400}
								easing="cubic-bezier(0.175, 0.885, 0.32, 2.275)"
								classParentString="list-item"
								triggerOpenedClassName="is-open"
							>
								{/* URL Section */}
								<div className="bookmark-section bookmark-section-url">
									<span className="bookmark-section-label">URL</span>
									<a href={bookmark.url} target="_blank" rel="noopener noreferrer">
										{bookmark.url}
									</a>
								</div>

								{/* Rating Section */}
								<div className="bookmark-section bookmark-section-rating">
									<span className="bookmark-section-label">Rating</span>
									{renderStars(bookmark.rating)}
								</div>

								{/* Description Section */}
								<div className="bookmark-section bookmark-section-description">
									<span className="bookmark-section-label">Description</span>
									{bookmark.description ? (
										<p>{bookmark.description}</p>
									) : (
										<p className="no-description">No description added</p>
									)}
								</div>

								{/* AI-powered bookmark tagging */}
								<BookmarkAIFeatures
									bookmark={bookmark}
									onTagsGenerated={(id, tags) => {
										dispatch({
											type: 'UPDATE_BOOKMARK_TAGS',
											payload: { id, tags }
										});
									}}
								/>

								{/* Action Buttons */}
								<div className="bookmark-actions">
									<button
										className="btn-edit"
										type="button"
										onClick={() => dispatch({type: 'SET_CURRENT_BOOKMARK', payload: bookmark})}
									>
										Edit
									</button>
									<button
										className="btn-delete"
										type="button"
										onClick={async () => {
											try {
												await axios.delete(
													`${apiUrl}/${apiEndpoint}/${bookmark.id}`
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
								</div>
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
										`${apiUrl}/${apiEndpoint}/${bookmark.id}`, {
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
		</StyledContent>
		<Footer />
	</StyledGrid>
	);
}
