import React, { memo, useCallback } from 'react';
import Collapsible from 'react-collapsible';
import axios from 'axios';

import BookmarkAIFeatures from './BookmarkAIFeatures';
import { apiUrl, apiEndpoint } from '../config';

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

const BookmarkItem = memo(function BookmarkItem({
	bookmark,
	dispatch,
	onTagsGenerated,
	isExpanded,
	onToggle,
	style
}) {
	const handleEdit = useCallback(() => {
		dispatch({ type: 'SET_CURRENT_BOOKMARK', payload: bookmark });
	}, [dispatch, bookmark]);

	const handleDelete = useCallback(async () => {
		try {
			await axios.delete(`${apiUrl}/${apiEndpoint}/${bookmark.id}`);
			dispatch({
				type: 'DELETE_BOOKMARK',
				payload: bookmark
			});
		} catch (error) {
			console.error('Failed to delete bookmark:', error);
			alert('Failed to delete bookmark. Please try again.');
		}
	}, [dispatch, bookmark]);

	const handleFavoriteToggle = useCallback(async () => {
		try {
			const res = await axios.patch(
				`${apiUrl}/${apiEndpoint}/${bookmark.id}`, {
					checked: !bookmark.checked
				});
			dispatch({
				type: 'ADD_BOOKMARK_TO_FAVORITES',
				payload: res.data
			});
		} catch (error) {
			console.error('Failed to update favorites:', error);
			alert('Failed to update favorites. Please try again.');
		}
	}, [dispatch, bookmark]);

	const handleCollapsibleOpen = useCallback(() => {
		onToggle(bookmark.id, true);
	}, [onToggle, bookmark.id]);

	const handleCollapsibleClose = useCallback(() => {
		onToggle(bookmark.id, false);
	}, [onToggle, bookmark.id]);

	return (
		<li style={style} data-bookmark-id={bookmark.id}>
			<span>
				<div className="list-item">
					<Collapsible
						trigger={<span className="bookmark-trigger">{bookmark.title} <span className="trigger-arrow">▼</span></span>}
						triggerTagName="button"
						transitionTime={400}
						easing="cubic-bezier(0.175, 0.885, 0.32, 2.275)"
						classParentString="list-item"
						triggerOpenedClassName="is-open"
						open={isExpanded}
						onOpening={handleCollapsibleOpen}
						onClosing={handleCollapsibleClose}
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
							onTagsGenerated={onTagsGenerated}
						/>

						{/* Action Buttons */}
						<div className="bookmark-actions">
							<button
								className="btn-edit"
								type="button"
								onClick={handleEdit}
							>
								Edit
							</button>
							<button
								className="btn-delete"
								type="button"
								onClick={handleDelete}
							>
								Delete
							</button>
						</div>
					</Collapsible>
				</div>
			</span>
			<span>
				<label className="list" htmlFor={`checkbox-favorite-${bookmark.id}`}>
					Add to Favorites
				</label>
			</span>
			<input
				id={`checkbox-favorite-${bookmark.id}`}
				name="checkbox-favorite"
				aria-label="Add to favorites"
				type="checkbox"
				onChange={handleFavoriteToggle}
				checked={bookmark.checked}
			/>
		</li>
	);
});

export default BookmarkItem;
