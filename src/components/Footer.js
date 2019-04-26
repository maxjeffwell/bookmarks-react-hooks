import React from 'react';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const FooterContainer = styled.div`
	display: grid;
	position: relative;
	grid-template-rows: 1fr;
	grid-template-columns: 1fr;
	width: 100%;
	min-height: 100%;
	margin-bottom: -100px;
	@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		margin-top: -50px;
		margin-bottom: 0;
		height: auto;
	}
`;

const StyledFooter = styled.footer`
	grid-row: 1 / 2;
	grid-column: 1 / 2;
	font-family: ${props => props.theme.fonts.primary};
	text-align: center;
	background: black;
	border-top: 5px solid ${props => props.theme.colors.secondary};
	color: white;
	padding: 2rem 1rem 0 1rem;
	width: 100%;
	height: 100px;
	position: relative;
	@media (max-width: ${style.breakpoint.mobileM}) {
		height: auto;
		padding: 25px;
	}
	@media (max-width: ${style.breakpoint.mobileS}) {
		font-size: 1rem;
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