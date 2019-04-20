import React from 'react';
import styled from '@emotion/styled';

import Sidebar from './Sidebar';

const StyledLanding = styled.div`
	display: grid;
	grid-template-rows: auto auto auto;
	grid-template-columns: 1fr 2fr;
`;

const StyledText = styled.div`
	grid-column: 2;
	grid-row: 1 / 3;
	& p {
	font-family: ${props => props.theme.fonts.tertiary};
	color: ${props => props.theme.colors.primary};
	font-style: italic;
	line-height: 1.5;
	}
`;

const Landing = () => (
	<StyledLanding>
			<Sidebar />
			<StyledText>
				<p>Bookmarked is a lightweight bookmark manager written in React, but without the use of class components and an external state management library.
					Leveraging the power of React Hooks, Bookmarked is composed entirely of elegant function components now capable of managing state and
					interacting with an external API.</p>

				<p>To get started storing and syncing your bookmarks across sessions, please click the "My Bookmarks" link, which can be found in the
					navigation bar above. You will then be directed to where you can create, edit, and delete your bookmarks. Your saved bookmarks will consist
					of a required title, a required url, a required rating, and an optional description.</p>

				<p>Bookmarked uses ZEIT's Now platform as a serverless host for data persistence.</p>
			</StyledText>
	</StyledLanding>
);

export default Landing;