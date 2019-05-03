import React from 'react';
import styled from '@emotion/styled';

import * as style from './Breakpoints';

const StyledFooter = styled.footer`
	font-family: ${props => props.theme.fonts.primary};
	font-size: 2rem;
	text-align: center;
	background: ${props => props.theme.colors.black};
	border-top: 5px solid ${props => props.theme.colors.secondary};
	border-radius: 2px;
	position: relative;
	grid-column: 1 / 7;
	grid-row: 5 / -1 ;
	p {
		color: #ffffff;
	}
		@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		height: 100%;
		width: 100%;
}
	@media (max-width: ${style.breakpoint.mobileM}) {
		grid-row: 5 / -1;
		grid-column: 1 / 4;
}
`;

const Footer = () => (
		<StyledFooter>
			<p>Copyright &copy; Bookmarked 2019</p>
		</StyledFooter>
);

export default Footer;