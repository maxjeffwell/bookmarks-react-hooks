import React from 'react';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const StyledTitle = styled.h1`
	grid-column: 1 / 2;
	grid-row: 2 / 4;
	color: ${props => props.theme.colors.primary};
	font-family: ${props => props.theme.fonts.tertiary};
	font-weight: bold;
	writing-mode: vertical-lr;
	text-orientation: sideways;
	font-size: 6rem;
	line-height: 2;
	margin-top: 1.5rem;
	// @media (max-width: ${style.breakpoint.laptop}), (max-width: ${style.breakpoint.laptopL}), (max-width: ${style.breakpoint.desktop}) {
	// }
	// @media (max-width: ${style.breakpoint.mobileL}) {
	//}
	@media (max-width: ${style.breakpoint.tablet}) {
		grid-row: 2 / 4;
		grid-column: 1 / 2;
		font-size: 6rem;
		margin-top: 4rem;
	}
	@media (max-width: ${style.breakpoint.mobileM}) {
		font-size: 4rem;
		grid-row: 2 / 3;
		grid-column: 1 / 2;
		margin-top: 1rem;
	}
	// @media (max-width: ${style.breakpoint.mobileS}) {
	// }
`;

const Sidebar = () => (
	<StyledTitle>
		Bookmarked
	</StyledTitle>
);

export default Sidebar;