import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';

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

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
	<ThemeProvider theme={theme}>
		<App />
	</ThemeProvider>
);

