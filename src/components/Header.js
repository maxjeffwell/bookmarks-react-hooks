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
	padding-left: 10px;
	padding-top: 20px;
	position: relative;
	text-align: left;
	z-index: 10;
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

const NavContainer = styled.div`
	float: right;
	padding-right: 10px;
	display: flex;
	align-items: center;
	gap: 1.5rem;
	@media (max-width: ${style.breakpoint.tablet}) {
		float: none;
		padding-right: 0;
		gap: 1rem;
	}
`;

const NavLink = styled(Link)`
	font-family: ${props => props.theme.fonts.primary};
	font-size: 1.25rem;
	color: ${props => props.theme.colors.white};
	text-decoration: none;
	white-space: nowrap;
	&:hover {
		text-decoration: underline;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		font-size: 1rem;
	}
`;

const LogoutLink = styled.span`
	font-family: ${props => props.theme.fonts.primary};
	font-size: 1.25rem;
	color: ${props => props.theme.colors.white};
	cursor: pointer;
	white-space: nowrap;
	&:hover {
		text-decoration: underline;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		font-size: 1rem;
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
							<NavLink to='/'>Home</NavLink>
						) : (
							<NavLink to='/bookmarks'>My Bookmarks</NavLink>
						)}
						<LogoutLink onClick={handleLogout}>Logout</LogoutLink>
					</>
				) : (
					!isAuthPage && <NavLink to='/login'>Sign In</NavLink>
				)}
			</NavContainer>
		</StyledHeader>
	);
};

export default memo(Header);
