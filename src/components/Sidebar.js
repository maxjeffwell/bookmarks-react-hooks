import React from 'react';
import styled from '@emotion/styled';

const StyledTitleContainer = styled.div`
	grid-column: 1;
`;

const StyledTitle = styled.h1`
	color: ${props => props.theme.colors.primary};
	font-family: ${props => props.theme.fonts.tertiary};
	font-weight: bold;
	writing-mode: vertical-lr;
	text-orientation: sideways;
	font-size: 6.85rem;
`;

const Sidebar = () => (
	<StyledTitleContainer>
	<StyledTitle>Bookmarked</StyledTitle>
	</StyledTitleContainer>
);

export default Sidebar;