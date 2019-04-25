import React from 'react';
import styled from '@emotion/styled';

const StyledTitleContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 1 / 2;
	grid-column: 1 / 2 ;
`;

const StyledTitle = styled.h1`
	color: ${props => props.theme.colors.primary};
	font-family: ${props => props.theme.fonts.tertiary};
	font-weight: bold;
	writing-mode: vertical-lr;
	text-orientation: sideways;
	font-size: 7rem;
	margin-top: 10px;
	margin-bottom: 10px;
`;

const Sidebar = () => (
	<StyledTitleContainer>
	<StyledTitle>Bookmarked</StyledTitle>
	</StyledTitleContainer>
);

export default Sidebar;