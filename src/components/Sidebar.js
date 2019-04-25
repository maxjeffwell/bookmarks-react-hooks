import React from 'react';
import styled from '@emotion/styled';

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
	font-size: 6rem;
	margin: 3rem auto 6rem;
`;

const Sidebar = () => (
	<StyledTitleContainer>
	<StyledTitle>Bookmarked</StyledTitle>
	</StyledTitleContainer>
);

export default Sidebar;