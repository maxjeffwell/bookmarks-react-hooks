import React from 'react';
import styled from '@emotion/styled';

const StyledFooter = styled.footer`
	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: 1fr;
	grid-row: 1 / 2;
	grid-column: 1 / 2;
	font-family: ${props => props.theme.fonts.primary};
	text-align: center;
	background: black;
	border-top: 5px solid ${props => props.theme.colors.secondary};
	color: white;
	padding: 10px;: 
	width: 100%;
	position: relative;
`;

const Footer = () => (
	<StyledFooter>
		Copyright &copy; Bookmarked 2019
	</StyledFooter>
);

export default Footer;