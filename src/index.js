import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'emotion-theming';

import App from './components/App';

const theme = {
	colors: {
		primary: 'hotpink',
		secondary: '#343436'
	},
	fonts: {
		primary: 'ITCAvantGardeStd-Demi'
	}
};

ReactDOM.render(
	<ThemeProvider theme={theme}>
		<App />
	</ThemeProvider>,
	document.getElementById('root'));

