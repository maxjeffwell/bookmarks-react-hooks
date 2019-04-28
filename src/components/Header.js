import React from 'react';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const HeaderContainer = styled.div`
	display: grid;
	position: relative;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
	grid-gap: 25px;
	min-width: 100%;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: flex;
	}
`;

const StyledHeader = styled.header`
	grid-row: 1 / 2;
	grid-column: 1 / 3;
	grid-auto-flow: column;
	background: black;
	border-bottom: 5px solid ${props => props.theme.colors.secondary};
	border-radius: 2px;
	font-family: ${props => props.theme.fonts.primary};
	font-size: 2rem;
	color: white;
	padding: 10px 10px 10px 20px;
	position: relative;
	width: 100%;
	height: auto;
	@media (max-width: ${style.breakpoint.tablet}) {
		flex-direction: row;
		min-width: 100%;
		padding-bottom: 0;
	}
	@media (max-width: ${style.breakpoint.mobileL}) {
		font-size: 1.75rem;
	}
	@media (max-width: ${style.breakpoint.mobileM}) {
		font-size: 1.5rem;
	}
	@media (max-width: ${style.breakpoint.mobileS}) {
		font-size: 1.25rem;
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
	@media (max-width: ${style.breakpoint.tablet}) {
		float: right;
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
		<HeaderContainer>
			<StyledHeader>
				<ConditionalBookmarkedHeader />
				<ConditionalHomeLink />
			</StyledHeader>
		</HeaderContainer>
	);
};

export default Header;