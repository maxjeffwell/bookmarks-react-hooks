import React from 'react';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const StyledTitleContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 1fr;
	height: auto;
`;

const StyledTitle = styled.h1`
	grid-column: 1 / 2;
	grid-row: 1 / 2;
	color: ${props => props.theme.colors.primary};
	font-family: ${props => props.theme.fonts.tertiary};
	font-weight: bold;
	writing-mode: vertical-lr;
	text-orientation: sideways;
	line-height: 4;
	font-size: 8rem;
	@media (max-width: ${style.breakpoint.mobileM}) {
			margin-top: .5rem;
			margin-bottom: 3rem;
			margin-left: -2rem;
	}
	// @media (min-width: ${style.breakpoint.laptop}) {
	// 		margin-left: 5rem;
	// 		margin-top: 25px;
	// 		font-size: 5rem;
	// }
`;

const Sidebar = () => (
	<StyledTitleContainer>
	<StyledTitle>Bookmarked</StyledTitle>
	</StyledTitleContainer>
);

export default Sidebar;