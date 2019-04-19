import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

const StyledHeader = styled.h1`
		display: grid;
	  color: ${props => props.theme.colors.primary};
	  font-family: ${props => props.theme.fonts.primary};
`;

const Landing = () => {
	return (
			<Link to='/bookmarks'>
			<StyledHeader>
				Landing Page
			</StyledHeader>
			</Link>
	)
};

export default Landing;