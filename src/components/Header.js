import React from 'react';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const StyledHeader = styled.header`
	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: 1fr 1fr;
	grid-row: 1 / 2;
	grid-column: 1 / 2;
	grid-auto-flow: column;
	background: black;
	border-bottom: 5px solid ${props => props.theme.colors.secondary};
	font-family: ${props => props.theme.fonts.primary};
	font-size: 2rem;
	color: white;
	padding: 10px 10px 10px 10px;
	position: relative;
	width: 100%;
	height: auto;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		padding-bottom: 0;
	}
	@media (max-width: ${style.breakpoint.mobileL}) {
		display: inline-block;
		font-size: 1.75rem;
		padding-bottom: 0;
	}
	@media (max-width: ${style.breakpoint.mobileM}) {
		display: inline-block;
		font-size: 1.5rem;
		padding-bottom: 0;
	}
	@media (max-width: ${style.breakpoint.mobileS}) {
		display: inline-block;
		font-size: 1.5rem;
		padding: 20px 20px 0 20px;
	}
`;

const StyledLink = styled(Link)`
	grid-column: 2 / 3;
	white-space: nowrap;
	text-align: right;
	color: white;
	text-decoration: none;
	padding-right: 10px;
	:hover {
		text-decoration: underline;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		float: right;
		margin: auto;
	}
	@media (max-width: ${style.breakpoint.mobileM}) {
		padding-right: 0;
		margin: 0 auto;
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