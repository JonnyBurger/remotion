export const Loading: React.FC<{
	size: number;
}> = ({size}) => {
	const triangle = (opacity: number, triangleSize: number) => (
		<svg
			xmlnsXlink="http://www.w3.org/1999/xlink"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 400 400"
			style={{
				opacity,
				width: triangleSize,
				height: triangleSize,
				position: 'absolute',
				transform: 'rotate(90deg)',
			}}
		>
			<defs>
				<linearGradient id="gradient">
					<stop stopColor="#42e9f5" stopOpacity="1" offset="0" />
					<stop stopColor="#4290f5" stopOpacity="1" offset="100%" />
				</linearGradient>
			</defs>
			<g stroke='url("#gradient")' strokeWidth="100px" strokeLinejoin="round">
				<path
					fill='url("#gradient")'
					d="M 102 272 a 196 100 0 0 0 195 5 A 196 240 0 0 0 200 102.259 A 196 240 0 0 0 102 272 z"
					stroke='url("#gradient")'
					strokeWidth="100px"
				/>
			</g>
		</svg>
	);

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flex: 1,
				height: '100%',
				width: '100%',
			}}
		>
			{triangle(0.2, size)}
			{triangle(0.4, (size * 9) / 11)}
			{triangle(1, (size * 7) / 11)}
		</div>
	);
};
