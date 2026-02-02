import React, { memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from './Auth';

import * as style from './Breakpoints';

const StyledHeader = styled.header`
	grid-row: 1 / 2;
	grid-column: 1 / -1;
	background: ${props => props.theme.colors.black};
	border-bottom: 5px solid ${props => props.theme.colors.secondary};
	border-radius: 2px;
	font-family: ${props => props.theme.fonts.primary};
	color: ${props => props.theme.colors.white};
	font-size: 2rem;
	padding: 1rem 1.5rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-sizing: border-box;
	position: relative;
	z-index: 10;
	@media (max-width: ${style.breakpoint.tablet}) {
		width: 100%;
		padding: 1rem 0.5rem;
		font-size: 1.5rem;
	}
	@media (max-width: ${style.breakpoint.mobileL}) {
		font-size: 1.25rem;
	}
`;

const NavContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: baseline;
	flex-wrap: nowrap;
	gap: 1.5rem;
	font-family: ${props => props.theme.fonts.primary};
	font-size: 1.25rem;
	@media (max-width: ${style.breakpoint.tablet}) {
		gap: 1rem;
		font-size: 1rem;
	}
`;

const StyledLink = styled(Link)`
	font-family: ${props => props.theme.fonts.primary} !important;
	font-size: 1.25rem !important;
	color: ${props => props.theme.colors.white};
	text-decoration: none;
	white-space: nowrap;
	&:hover {
		text-decoration: underline;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		font-size: 1rem !important;
	}
`;

const LogoutButton = styled.button`
	background: transparent !important;
	border: none !important;
	padding: 0 !important;
	margin: 0 !important;
	height: auto !important;
	width: auto !important;
	font-family: ${props => props.theme.fonts.primary} !important;
	font-size: 1.25rem !important;
	color: ${props => props.theme.colors.white} !important;
	cursor: pointer;
	white-space: nowrap;
	box-shadow: none !important;
	&:hover {
		text-decoration: underline;
		box-shadow: none !important;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		font-size: 1rem !important;
	}
`;

const Header = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, logout } = useAuth();
	const isBookmarksPage = location.pathname === '/bookmarks';
	const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	return (
		<StyledHeader>
			<span>{isBookmarksPage && 'Bookmarked'}</span>
			<NavContainer>
				{isAuthenticated ? (
					<>
						{isBookmarksPage ? (
							<StyledLink to='/'>Home</StyledLink>
						) : (
							<StyledLink to='/bookmarks'>My Bookmarks</StyledLink>
						)}
						<LogoutButton onClick={handleLogout}>Logout</LogoutButton>
					</>
				) : (
					!isAuthPage && <StyledLink to='/login'>Sign In</StyledLink>
				)}
			</NavContainer>
		</StyledHeader>
	);
};

export default memo(Header);