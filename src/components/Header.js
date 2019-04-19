import React from 'react';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import styled from '@emotion/styled';

const StyledHeader = styled.header`
	display: grid;
	grid-template-columns: 1fr;
	grid-auto-flow: column;
	align-items: center;
	grid-gap: 10px;
	background: black;
	border-bottom: 5px solid ${props => props.theme.colors.secondary};
`;

const Header = () => {
	const link = <Link to='/'>Home</Link>;
	const { location } = useReactRouter();
	const ConditionalLink = () => location.pathname !== '/' ? link : null;

	return (
	<StyledHeader>
		Bookmarked
		<ConditionalLink />
	</StyledHeader>
	);
};

export default Header;