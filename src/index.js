import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'emotion-theming';

import App from './components/App';

const theme = {
	colors: {
		primary: '#393939',
		secondary: '#343436',
		tertiary: '#FF4834',
		black: '#000000',
		white: '#ffffff'
	},
	fonts: {
		primary: 'ITCAvantGardeStd-Demi, monospace',
		secondary: 'HelveticaNeueLTStd-Roman, sans-serif',
		quaternary: 'HelveticaNeueLTStd-BdCn, sans-serif',
		quinary: 'GaramondPremrPro-MedDisp, serif'
	},
};

ReactDOM.render(
		<ThemeProvider theme={theme}>
			<App />
		</ThemeProvider>,
	document.getElementById('root'));

