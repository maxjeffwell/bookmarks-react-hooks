import React, { memo } from 'react';
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
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 1rem 0.5rem;
		box-sizing: border-box;
		font-size: 1.5rem;
	}
	@media (max-width: ${style.breakpoint.mobileL}) {
		font-size: 1.25rem;
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
		float: none;
		padding-right: 0;
		flex-shrink: 0;
	}
`;

const Header = () => {
	const location = useLocation();
	const isBookmarksPage = location.pathname !== '/';

	return (
		<StyledHeader>
			<span>{isBookmarksPage && 'Bookmarked'}</span>
			<span>
				{isBookmarksPage ? (
					<StyledLink to='/'>Home</StyledLink>
				) : (
					<StyledLink to='/bookmarks'>My Bookmarks</StyledLink>
				)}
			</span>
		</StyledHeader>
	);
};

export default memo(Header);