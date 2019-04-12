const filterReducer = (state, action) => {
	switch (action.type) {
		case 'SHOW_ALL':
			return 'ALL';
		case 'SHOW_FAVORITES':
			return 'FAVORITES';
		default:
			throw new Error();
	}
};

export default filterReducer;