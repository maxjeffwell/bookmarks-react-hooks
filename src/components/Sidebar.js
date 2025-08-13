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
	border: 10px solid #fa625f;
	background-color: #fa625f;
	border-radius: 2px;
	padding-top: 15rem;
	@media (max-width: ${style.breakpoint.tablet}) {
		grid-column: 1;
		grid-row: 1;
		writing-mode: horizontal-tb;
		text-orientation: unset;
		border-radius: 8px;
		font-size: 2.5rem;
		padding: 1rem;
		text-align: center;
		line-height: 1.2;
		margin: 0;
		border: 5px solid #fa625f;
	}
`;

const Sidebar = () => (
	<StyledTitle>
		Bookmarked
	</StyledTitle>
);

export default Sidebar;