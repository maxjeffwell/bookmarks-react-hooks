import uuidv4 from 'uuid/v4';

const bookmarksReducer = (state, action) => {
	switch(action.type) {
		case 'TOGGLE_BOOKMARK':
			const toggledBookmarks = state.bookmarks.map(
				b => b.id === action.payload.id
			? {...action.payload, expanded: !action.payload.expanded}
			: b
			);

			return {
				...state,
				bookmarks: toggledBookmarks
			};
		case 'DELETE_BOOKMARK':
			const filteredBookmarks = state.bookmarks.filter(
				b => b.id !== action.payload.id);

			return {
				...state,
				bookmarks: filteredBookmarks
			};
		case 'ADD_BOOKMARK':
			const newBookmark = {
				id: uuidv4(),
				title: action.payload,
				expanded: false,
			};
			const addedBookmark = [...state.bookmarks, newBookmark];

			return {
				...state,
				bookmarks: addedBookmark
			};
		default:
			return state;
	}
};

export default bookmarksReducer;