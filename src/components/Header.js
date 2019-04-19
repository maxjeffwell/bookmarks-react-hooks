import React from 'react';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import styled from '@emotion/styled';

const StyledHeader = styled.header`
	display: grid;
	grid-auto-flow: column;
	grid-area: header;
	background: black;
	border-bottom: 5px solid ${props => props.theme.colors.secondary};
	font-family: ${props => props.theme.fonts.primary};
	font-size: 1.5rem;
	color: white;
	padding: 10px;
`;

const StyledLink = styled(Link)`
	color: white;
	text-decoration: none;
	:hover {
		text-decoration: underline;
	}
`;

const Header = () => {
	const home = <StyledLink to='/'>Home</StyledLink>;
	const bookmarks = <StyledLink to='/bookmarks'>My Bookmarks</StyledLink>;
	const { location } = useReactRouter();
	const ConditionalHomeLink = () => location.pathname !== '/' ? home : bookmarks;

	const bookmarked = <>Bookmarked</>;
	const empty = <></>;
	const ConditionalBookmarkedHeader = () => location.pathname !== '/' ? bookmarked : empty;

	return (
	<StyledHeader>
		<ConditionalBookmarkedHeader />
		<ConditionalHomeLink />
	</StyledHeader>
	);
};

export default Header;