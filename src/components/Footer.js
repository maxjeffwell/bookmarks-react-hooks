import React from 'react';
import styled from '@emotion/styled';

const StyledFooter = styled.footer`
	display: grid;
	grid-row: 3;
	font-family: ${props => props.theme.fonts.primary};
	text-align: center;
	background: black;
	border-top: 5px solid ${props => props.theme.colors.secondary};
	color: white;
	padding: 10px;: 
	width: 100%;
`;

const Footer = () => (
	<StyledFooter>
		Copyright &copy; Bookmarked 2019
	</StyledFooter>
);

export default Footer;