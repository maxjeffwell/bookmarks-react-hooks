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
		border-radius: 5px;
		display: inline-block;
		font-size: 2rem;
		padding-top: 5rem;
		padding-bottom: 5rem;
	}
`;

const Sidebar = () => (
	<StyledTitle>
		Bookmarked
	</StyledTitle>
);

export default Sidebar;