import React from 'react';
import styled from '@emotion/styled';

import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

import * as style from './Breakpoints';

const StyledLanding = styled.div`
	display: grid;
	grid-template-columns: .25fr 1fr .25fr;
	grid-template-rows: auto .25fr .75fr 1fr auto;
	grid-gap: 4rem;
	@media (max-width: ${style.breakpoint.mobileM}) {
		grid-template-columns: .25fr 4fr;
		grid-template-rows: auto .5fr .5fr .75fr auto; 
		grid-gap: 2rem;
	}
`;

const StyledText = styled.p`
		font-family: ${props => props.theme.fonts.tertiary};
		color: ${props => props.theme.colors.primary};
		font-style: italic;
		font-size: 2rem;
		line-height: 1;
	:first-of-type {
		grid-column: 2 / 3;
		grid-row: 2 / 3;
		margin-top: 4rem;
		@media (max-width: ${style.breakpoint.mobileM}) {
			font-size: 1.25rem;
			grid-row: 2 / 3;
			grid-column: 2 / 3;
			margin-top: 4rem;
			padding-right: 1rem;
		}
	}
	:nth-of-type(2) {
		grid-column: 2 / 3;
		grid-row: 3 / 4;
		padding-right: 2rem;
		@media (max-width: ${style.breakpoint.mobileM}) {
			font-size: 1.25rem;
			grid-row: 3 / 4;
			grid-column: 1 / 3;
			padding-left: 5rem;
			padding-right: 7rem;
			margin-top:0;
		}
	}
	:nth-of-type(3) {
		grid-column: 2 / 3;
		grid-row: 4 / 5;
		padding-right: 2rem;
		@media (max-width: ${style.breakpoint.mobileM}) {
			font-size: 1.25rem;
			grid-row: 4 / 5;
			grid-column: 1 / 3;
			padding-left: 10rem;
			margin-top: 0;
		}	
	}
`;

const Landing = () => (
	<StyledLanding>
		<Header />
			<Sidebar />
			<StyledText>Bookmarked is a lightweight bookmark manager written in React, but without the use of class components and an external state management library.
					Leveraging the power of React Hooks, Bookmarked is composed entirely of elegant function components now capable of managing state and
					interacting with an external API.
			</StyledText>
			<StyledText>
					To get started storing and syncing your bookmarks across sessions, please click the "My Bookmarks" link, which can be found in the
					navigation bar above. You will then be directed to where you can create, edit, and delete your bookmarks. Your saved bookmarks will consist
					of a required title, a required url, a required rating, and an optional description.
			</StyledText>
			<StyledText>
				Bookmarked uses ZEIT's Now platform as a serverless host for data persistence.
			</StyledText>
		<Footer />
	</StyledLanding>
);

export default Landing;