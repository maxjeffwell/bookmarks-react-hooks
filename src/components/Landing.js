import React from 'react';
import styled from '@emotion/styled';

const StyledTitle = styled.h1`
	grid-area: main;
	color: ${props => props.theme.colors.primary};
	font-family: ${props => props.theme.fonts.tertiary};
	font-weight: bold;
	writing-mode: vertical-lr;
	text-orientation: sideways;
	font-size: 7.3rem;
`;

const Landing = () => {
	return (
			<StyledTitle>
				Bookmarked
			</StyledTitle>
	)
};

export default Landing;