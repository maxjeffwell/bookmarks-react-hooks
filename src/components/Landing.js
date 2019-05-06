import React from 'react';
import styled from '@emotion/styled';

import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

import * as style from './Breakpoints';
import bookmark from '../icons/bookmark.png';

const StyledLanding = styled.div`
	display: grid;
	grid-template-columns: .25fr 1fr 1fr 1fr .75fr;
	grid-template-rows: .1fr 1fr 1fr .25fr;
	grid-column-gap: .25rem;
	background-color: #fbf579;
	 @media (max-width: ${style.breakpoint.tablet}) {
	 	display: inline-block;
	 }
`;

const StyledText = styled.p`
		font-family: ${props => props.theme.fonts.quinary};
		color: #f5f5f5;
		font-style: normal;
		background-color: #262626;
		font-weight: 500;
		font-size: 2rem;
		line-height: 1.5;
	:first-of-type {
		grid-column: 2 / 3;
		grid-row: 1 / 3;
		padding: 5rem 2rem 2rem 2rem;
		border-radius: 5px;
		background-color: #005995;
		@media (max-width: ${style.breakpoint.tablet}) {
			padding-top: 1rem;
			width: 50%;
			font-size: 1rem;
		}
	}
	:nth-of-type(2) {
		grid-column: 4 / 5;
		grid-row: 3 / 6;
		padding: 2rem;
		border-radius: 5px;
		background-color: #600473;
		@media (max-width: ${style.breakpoint.tablet}) {
			padding-top: 1rem;
			width: 50%;
			font-size: 1rem;
			margin-top: 2rem;
		}
`;

const StyledImage = styled.img`
	grid-column: 4 / 6;
	grid-row: 1 / 3;
	height: 600px;
	width: 500px;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: none;
	}
`;


const Landing = () => (
	<StyledLanding>
		<Header />
			<StyledText>Bookmarked is a lightweight bookmark manager written in React, but without the use of class components and an external state management library.
					Leveraging the power of React Hooks, Bookmarked is composed entirely of elegant function components now capable of managing state and
					interacting with an external API.
			</StyledText>
			<Sidebar />
			<StyledImage src={bookmark} alt="bookmark-icon">
			</StyledImage>
			<StyledText>
					To get started storing and syncing your bookmarks across sessions, please click the "My Bookmarks" link, which can be found in the
					navigation bar above. You will then be directed to where you can create, edit, and delete your bookmarks. Your saved bookmarks will consist
					of a required title, a required url, a required rating, and an optional description.
			</StyledText>
		<Footer />
	</StyledLanding>
);

export default Landing;