import React from 'react';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const StyledHeader = styled.header`
	grid-row: 1 / 2;
	grid-column: 1 / 4;
	background: black;
	border-bottom: 5px solid ${props => props.theme.colors.secondary};
	border-radius: 2px;
	font-family: ${props => props.theme.fonts.primary};
	font-size: 2rem;
	color: white;
	padding: 10px 10px 10px 20px;
	position: relative;
	text-align: left;
	@media (max-width: ${style.breakpoint.mobileM}) {
		font-size: 1.5rem;
	}
`;

const StyledLink = styled(Link)`
	grid-column: 2 / 3;
	white-space: nowrap;
	text-align: right;
	color: white;
	text-decoration: none;
	padding-right: 10px;
	float: right;
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
				<span><ConditionalBookmarkedHeader /></span>
				<span><ConditionalHomeLink /></span>
			</StyledHeader>
	);
};

export default Header;