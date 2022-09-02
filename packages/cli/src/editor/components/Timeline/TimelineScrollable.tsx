import React, {useMemo} from 'react';
import {TIMELINE_BACKGROUND} from '../../helpers/colors';
import {scrollableRef} from './timeline-refs';

const outer: React.CSSProperties = {
	width: '100%',
	height: '100%',
	overflowX: 'auto',
	overflowY: 'hidden',
	position: 'relative',
	backgroundColor: TIMELINE_BACKGROUND,
};

export const TimelineScrollable: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const containerStyle: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			minHeight: '100%',
		};
	}, []);

	return (
		<div ref={scrollableRef} style={outer}>
			<div style={containerStyle}>{children}</div>
		</div>
	);
};
