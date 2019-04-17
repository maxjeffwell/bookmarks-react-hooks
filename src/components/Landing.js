import React from 'react';
import styled from '@emotion/styled';

const StyledHeader = styled.h1`
	  color: ${props => props.theme.colors.primary};
`;

const Landing = () => {
	return (
		<div>
			<StyledHeader>Landing Page</StyledHeader>
		</div>
	)
};

export default Landing;