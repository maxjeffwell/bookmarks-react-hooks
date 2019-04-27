import React from 'react';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const StyledTitleContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 1fr;
	@media (max-width: ${style.breakpoint.laptop}) {
		grid-template-columns: .25fr;
		grid-column: 1 / 2;
	}
`;

const StyledTitle = styled.h1`
	grid-column: 1 / 2;
	grid-row: 1 / 3;
	color: ${props => props.theme.colors.primary};
	font-family: ${props => props.theme.fonts.tertiary};
	font-weight: bold;
	writing-mode: vertical-lr;
	text-orientation: sideways;
	line-height: 4;
	font-size: 8rem;
	@media (max-width: ${style.breakpoint.laptop}), (max-width: ${style.breakpoint.laptopL}), (max-width: ${style.breakpoint.desktop}) {
		margin-top: 10rem;
		font-size: 8rem;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		margin-right: -12rem;
		margin-left: -2rem;
		font-size: 6rem;
	}
		@media (max-width: ${style.breakpoint.mobileL}) {
		margin-right: -6rem;
		margin-left: -7rem;
		margin-top: 10rem;
	}
	@media (max-width: ${style.breakpoint.mobileM}) {
		margin-right: -6rem;
		margin-left: -7rem;
		margin-top: 4rem;
	}
	@media (max-width: ${style.breakpoint.mobileS}) {
		margin-top: 12rem;
	}
`;

const Sidebar = () => (
	<StyledTitleContainer>
	<StyledTitle>Bookmarked</StyledTitle>
	</StyledTitleContainer>
);

export default Sidebar;