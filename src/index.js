import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';

import App from './components/App';
import theme from './theme';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
	<ThemeProvider theme={theme}>
		<App />
	</ThemeProvider>
);

