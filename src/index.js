import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'emotion-theming';

import App from './components/App';

const theme = {
	colors: {
		primary: '#393939',
		secondary: '#343436',
		tertiary: '#FF4834'
	},
	fonts: {
		primary: 'ITCAvantGardeStd-Demi, monospace',
		secondary: 'GillSansStd-Shadowed, sans-serif',
		tertiary: 'WarnockPro-SemiboldIt, serif',
		quaternary: 'HelveticaNeueLTStd-BdOu, sans-serif',
		quinary: 'GaramondPremrPro-MedDisp, serif'
	},
};

ReactDOM.render(
		<ThemeProvider theme={theme}>
			<App />
		</ThemeProvider>,
	document.getElementById('root'));

