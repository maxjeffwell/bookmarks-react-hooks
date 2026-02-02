import React from 'react';
import styled from '@emotion/styled';

import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

import * as style from './Breakpoints';
import bookmark from '../icons/bookmark.png';

const StyledLanding = styled.div`
	display: grid;
	grid-template-columns: .25fr 1fr 1fr 1fr .75fr;
	grid-template-rows: .1fr 1fr 1fr .25fr;
	grid-column-gap: .25rem;
	background-color: #fbf579;
	 @media (max-width: ${style.breakpoint.tablet}) {
	 	display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto auto auto auto auto;
		grid-gap: 0.5rem;
		padding: 0.5rem;
		overflow-x: hidden;
		box-sizing: border-box;
	 }
`;

const StyledText = styled.p`
		font-family: ${props => props.theme.fonts.quinary};
		color: #f5f5f5;
		font-style: normal;
		background-color: #262626;
		font-weight: 500;
		font-size: 2rem;
		line-height: 1.5;
	:first-of-type {
		grid-column: 2 / 3;
		grid-row: 1 / 3;
		padding: 7rem 2rem 2rem 2rem;
		border-radius: 5px;
		background-color: #005995;
		@media (max-width: ${style.breakpoint.tablet}) {
			grid-column: 1;
			grid-row: 2;
			padding: 1rem;
			width: 100%;
			font-size: 1.2rem;
			margin: 0;
			box-sizing: border-box;
		}
	}
	:nth-of-type(2) {
		grid-column: 4 / 5;
		grid-row: 3 / 6;
		padding: 2rem;
		border-radius: 5px;
		background-color: #600473;
		@media (max-width: ${style.breakpoint.tablet}) {
			grid-column: 1;
			grid-row: 4;
			padding: 1rem;
			width: 100%;
			font-size: 1.2rem;
			margin: 0;
			box-sizing: border-box;
		}
`;

const StyledImage = styled.img`
	grid-column: 4 / 6;
	grid-row: 1 / 3;
	height: 600px;
	width: 500px;
	@media (max-width: ${style.breakpoint.tablet}) {
		grid-column: 1;
		grid-row: 3;
		height: auto;
		width: 100%;
		max-width: 300px;
		margin: 0 auto;
		justify-self: center;
	}
`;


const Landing = () => (
	<StyledLanding>
		<Header />
			<StyledText>Bookmarked is a full-stack bookmark manager featuring AI-powered auto-tagging via LLM integration,
					vector embeddings for semantic search, and JWT authentication with httpOnly cookies. Built with React Hooks,
					Context API, and useReducer for state management, and backed by PostgreSQL on Neon with Redis caching.
					<br/><br/>
					The application runs on dual deployment targets: Vercel serverless functions for the frontend and API,
					plus a Kubernetes cluster with ArgoCD GitOps for the Express backend. Features include Zod schema validation,
					rate limiting, Prometheus metrics, and a self-hosted AI gateway with multi-tier LLM fallback.
			</StyledText>
			<Sidebar />
			<StyledImage src={bookmark} alt="bookmark-icon">
			</StyledImage>
			<StyledText>
					To get started, click "Sign In" in the navigation bar to register or log in. From there you can
					create, edit, and organize your bookmarks with an intuitive interface designed for efficiency.
					<br/><br/>
					Use the AI tag generation to automatically categorize your bookmarks based on their content, or leverage
					semantic search to find bookmarks by meaning rather than exact keywords. Rate your bookmarks, add them to
					favorites for quick access, and import existing bookmarks from your browser.
					<br/><br/>
					All AI processing happens server-side with intelligent caching to minimize latency and API costs.
					Your data is secured with JWT authentication and encrypted connections throughout.
			</StyledText>
		<Footer />
	</StyledLanding>
);

export default Landing;
