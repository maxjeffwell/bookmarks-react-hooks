import React from 'react';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import styled from '@emotion/styled';

const StyledHeader = styled.header`
	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: 2fr 1fr;
	grid-row: 1 / 2;
	grid-column: 1 / 2;
	grid-auto-flow: column;
	background: black;
	border-bottom: 5px solid ${props => props.theme.colors.secondary};
	font-family: ${props => props.theme.fonts.primary};
	font-size: 1.5rem;
	color: white;
	padding: 10px 10px 0 10px;
	position: relative;
	width: 100%;
`;

const StyledLink = styled(Link)`
	grid-column: 2 / 3;
	white-space: nowrap;
	text-align: right;
	color: white;
	text-decoration: none;
	padding-right: 10px;
	&:hover {
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