import React, { memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from './Auth';

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
	padding: 1rem 1.5rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-sizing: border-box;
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
	align-items: center;
	gap: 1.5rem;
	font-family: ${props => props.theme.fonts.primary};
	font-size: 1.25rem;
	@media (max-width: ${style.breakpoint.tablet}) {
		gap: 1rem;
		font-size: 1rem;
	}
`;

const UserInfo = styled.span`
	opacity: 0.8;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: none;
	}
`;

const StyledLink = styled(Link)`
	white-space: nowrap;
	color: ${props => props.theme.colors.white};
	text-decoration: none;
	:hover {
		text-decoration: underline;
	}
`;

const LogoutButton = styled.button`
	background: transparent;
	border: none;
	color: ${props => props.theme.colors.white};
	font-family: inherit;
	font-size: inherit;
	padding: 0;
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
`;

const Header = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, user, logout } = useAuth();
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
						<UserInfo>{user?.username}</UserInfo>
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