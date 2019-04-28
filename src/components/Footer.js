import React from 'react';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const FooterContainer = styled.div`
	display: grid;
	position: relative;
	grid-template-columns: 1fr;
	grid-template-rows: 1fr;
	min-width: 100%;
	min-height: 100%;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: flex;
	}
`;

const StyledFooter = styled.footer`
	font-family: ${props => props.theme.fonts.primary};
	font-size: 2rem;
	text-align: center;
	background: black;
	border-top: 5px solid ${props => props.theme.colors.secondary};
	border-radius: 2px;
	color: white;
	padding: 1rem 1rem 1rem 1rem;
	min-width: 100%;
	height: 100px;
	position: relative;
	grid-column: 1 / 3;
	@media (max-width: ${style.breakpoint.tablet}) {
		flex-direction: row;
		justify-content: center;
	}
	@media (max-width: ${style.breakpoint.mobileL}) {
		font-size: 1.5rem;
		padding: 1rem;
		margin-top: 1rem;
	}
`;

const Footer = () => (
	<FooterContainer className="footer-container">
		<StyledFooter>
			Copyright &copy; Bookmarked 2019
		</StyledFooter>
	</FooterContainer>
);

export default Footer;