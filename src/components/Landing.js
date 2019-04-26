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
	grid-row: 1 / 2;
	p {
		font-family: ${props => props.theme.fonts.tertiary};
		color: ${props => props.theme.colors.primary};
		font-style: italic;
		font-size: 2rem;
		line-height: 1.5;
		margin-top: 5rem;
		margin-right: 3rem;
		margin-left: 5rem;
	}
	@media (max-width: ${style.breakpoint.mobileM}) {
			div {
				grid-gap: 10px;
			}
			.clearfooter {
				height: 0;
			}
			p:first-of-type {
				margin: 4rem 8px 0 -10rem;
			}
			p:nth-child(2) {
    		margin: 3rem 8px 0 -10rem;
    	}
    	p:nth-child(3) {
    		margin: 2rem 8px 0 -10rem;
    	}
  }
  	// @media (min-width: ${style.breakpoint.laptop}) {
  	// 	div .clearfooter {
  	// 		height: 0;
  	// 	}
  	//	p:first-child {
  	//		margin-top: 2rem;
  	//	}
  	//	p:nth-child(2), p:nth-child(3) {
  	//		margin-top: 0;
  	//	}
  	//}
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