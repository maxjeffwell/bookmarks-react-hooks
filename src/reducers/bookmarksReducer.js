const bookmarksReducer = (state, action) => {
	switch(action.type) {
			case 'GET_BOOKMARKS':

			return {
				...state,
				bookmarks: action.payload
			};

			case 'ADD_BOOKMARK':
				const addedBookmark = [...state.bookmarks, action.payload];

				return {
				...state,
				bookmarks: addedBookmark
			};

			case 'ADD_BOOKMARK_TO_FAVORITES':
			const checkedBookmarks = state.bookmarks.map(
				b => b.id === action.payload.id
				? action.payload : b
			);

			return {
				...state,
				bookmarks: checkedBookmarks
			};

			case 'SET_CURRENT_BOOKMARK':
			return {
				...state,
				currentBookmark: action.payload
			};

			case 'TOGGLE_BOOKMARK':

				const toggledBookmarks = state.bookmarks.map(
					b => b.id === action.payload.id ? action.payload : b);

				return {
				...state,
				bookmarks: toggledBookmarks
			};

			case 'UPDATE_BOOKMARK':
				// Update bookmark by ID from payload (more robust than using currentBookmark)
				const updatedBookmarks = state.bookmarks.map(
					b => b.id === action.payload.id ? action.payload : b
				);

				return {
					...state,
					currentBookmark: {},
					bookmarks: updatedBookmarks
				};

			case 'DELETE_BOOKMARK':

				const filteredBookmarks = state.bookmarks.filter(
				b => b.id !== action.payload.id);

				const isDeletedBookmark = state.currentBookmark.id === action.payload.id
			? {} : state.currentBookmark;

				return {
				...state,
				currentBookmark: isDeletedBookmark,
				bookmarks: filteredBookmarks
			};

				default:
					return state;
	}
};

export default bookmarksReducer;