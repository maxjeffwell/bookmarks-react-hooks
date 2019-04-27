import React from 'react';
import styled from '@emotion/styled';
import * as style from './Breakpoints';

import Sidebar from './Sidebar';

const StyledLanding = styled.div`
	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: 1fr 2fr;
	grid-gap: 25px;
	div.clearfooter {
  	height: 100px;
  	clear: both;
  }
`;

const StyledText = styled.div`
	grid-column: 2 / 3;
	grid-row: 1 / 3;
	p {
		font-family: ${props => props.theme.fonts.tertiary};
		color: ${props => props.theme.colors.primary};
		font-style: italic;
		font-size: 2rem;
		line-height: 1.5;
		margin-top: 5rem;
		margin-right: 3rem;
		margin-left: 5rem;
		@media (max-width: ${style.breakpoint.laptop}) {
				display: grid;
	 }
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		p:first-of-type {
			margin: 4rem 2rem 0 -4rem;
		}
		p:nth-of-type(2) {
    	margin: 7rem 2rem 0 -12rem;
    }
    p:nth-of-type(3) {
    	margin: 2rem 2rem 0 -12rem;
    }
  }
  @media (max-width: ${style.breakpoint.mobileL}) {
		p:first-of-type {
			margin-right: 1rem;
			margin-left: -3rem;
			margin-top: 2rem;
		}
		p:nth-of-type(2) {
    	margin-top: 2rem;
    	margin-right: 1rem;
    	padding-left: .5rem;
    }
    p:nth-of-type(3) {
    	margin-right: 1rem;
    	padding-left: .5rem;
    }
	}
  @media (max-width: ${style.breakpoint.mobileM}) {
		p {
			margin-left: -1rem;
			font-size: 1.75rem;
		}
		p:first-of-type {
			margin: .5rem 0 0 -3rem;
			padding-right: .5rem;
			padding-bottom: .5rem;
		}
		p:nth-of-type(2), p:nth-of-type(3) {
    	margin-top: 2rem;
    	margin-right: 0;
    	padding-right: .25rem;
    }
	}
	@media (max-width: ${style.breakpoint.mobileS}) {
		font-size: 1rem;
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
		<div className="clearfooter" />
	</StyledLanding>
);

export default Landing;