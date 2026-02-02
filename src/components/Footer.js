import React, { memo } from 'react';
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
	z-index: 10;
	grid-column: 1 / -1;
	grid-row: 3 / 4;
	p {
		color: #ffffff;
	}
	@media (max-width: ${style.breakpoint.tablet}) {
		display: inline-block;
		width: 100%;
		height: 100%;
	}
`;

const Footer = () => (
		<StyledFooter>
			<p>Copyright &copy; Bookmarked 2026</p>
		</StyledFooter>
);

export default memo(Footer);