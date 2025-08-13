import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const StyledHeader = styled.header`
	grid-row: 1 / 2;
	grid-column: 1 / 7;
	background: ${props => props.theme.colors.black};
	border-bottom: 5px solid ${props => props.theme.colors.secondary};
	border-radius: 2px;
	font-family: ${props => props.theme.fonts.primary};
	color: ${props => props.theme.colors.white};
	font-size: 2rem;
	padding-left: 10px;
	padding-top: 20px;
	position: relative;
	text-align: left;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		width: 100%;
		padding-left: 0.5rem;
		padding-top: 1rem;
		box-sizing: border-box;
	}
`;

const StyledLink = styled(Link)`
	grid-column: 2 / 3;
	white-space: nowrap;
	text-align: right;
	color: ${props => props.theme.colors.white};
	text-decoration: none;
	padding-right: 10px;
	float: right;
	-webkit-appearance: none;
	:hover {
		text-decoration: underline;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		padding-right: 0.5rem;
		box-sizing: border-box;
	}
`;

const Header = () => {
	const home = <StyledLink to='/'>Home</StyledLink>;
	const bookmarks = <StyledLink to='/bookmarks'>My Bookmarks</StyledLink>;
	const location = useLocation();
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