import React from 'react';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const StyledTitle = styled.h1`
	grid-column: 3 / 4;
	grid-row: 1 / 6;
	color: ${props => props.theme.colors.primary};
	font-family: ${props => props.theme.fonts.quaternary};
	writing-mode: vertical-lr;
	text-orientation: sideways;
	font-size: 8rem;
	line-height: 2;
	//border: 5px solid ${props => props.theme.colors.tertiary};
	//border: 10px solid #FC4A1A; 
	border: 10px solid #fa625f;
	background-color: #fa625f;
	border-radius: 2px;
	padding-top: 15rem;
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
`;

const Sidebar = () => (
	<StyledTitle>
		Bookmarked
	</StyledTitle>
);

export default Sidebar;