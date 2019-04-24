import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

const StyledAccordion = styled.div`
	display: grid;
`;

const StyledTitle = styled.h2`
	cursor: pointer;
	font-family: ${props => props.theme.fonts.primary};
	font-weight: normal;
	font-size: 1.75rem;
	&:hover {
		text-decoration: underline;
	}
`;

const Accordion = ({ title, children, onToggle }) => {
	const [visibility, setVisibility] = useState(false);
	return (
		<StyledAccordion className="accordion">
			<StyledTitle
				className="title"
				onClick={() => {
					setVisibility(!visibility);
					if (onToggle) onToggle(!visibility);
				}}
			>
				{title}
			</StyledTitle>
			{visibility ? <Fragment>{children}</Fragment> : null}
		</StyledAccordion>
	);
};

Accordion.propTypes = {
	children: PropTypes.any.isRequired,
	onToggle: PropTypes.func,
	title: PropTypes.string.isRequired
};

export default Accordion;