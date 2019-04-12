const filterReducer = (state, action) => {
	switch (action.type) {
		case 'SHOW_ALL':
			return 'ALL';
		case 'SHOW_FAVORITES':
			return 'FAVORITES';
		case 'SHOW_BY_RATING':
			return 'RATING';
		default:
			return state;
	}
};

export default filterReducer;