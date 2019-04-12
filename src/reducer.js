const bookmarksReducer = (state, action) => {
	switch(action.type) {
			case 'GET_BOOKMARKS':

			return {
				...state,
				bookmarks: action.payload
			};

			case 'ADD_BOOKMARK':
			// if (!action.payload) {
			// 	return state;
			// }
			// if (state.bookmarks.findIndex(
			// 	b => b.title === action.payload) > -1)
			// 	return state;

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

			case 'SHOW_FAVORITES':
			return 'FAVORITES';

			case 'SET_CURRENT_BOOKMARK':
			return {
				...state,
				currentBookmark: action.payload
			};

			case 'TOGGLE_BOOKMARK':
			const toggledBookmarks = state.bookmarks.map(
				b => b.id === action.payload.id
			? action.payload
			: b
			);

			return {
				...state,
				bookmarks: toggledBookmarks
			};

			case 'UPDATE_BOOKMARK':
			// if (!action.payload) {
			// 	return state;
			// }
			// if (state.bookmarks.findIndex(
			// 	b => b.title === action.payload) > -1)
			// 	return state;
			const updatedBookmark = {
				...action.payload
			};
			const updatedBookmarkIndex = state.bookmarks.findIndex(
				b => b.id === state.currentBookmark.id);
			const updatedBookmarks = [
				...state.bookmarks.slice(0, updatedBookmarkIndex),
				updatedBookmark,
				...state.bookmarks.slice(updatedBookmarkIndex + 1)
			];

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