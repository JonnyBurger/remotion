export interface GreenScreenOverlayProps {
	src: string;
	startTimeInSeconds?: number;
	durationInSeconds?: number;
	loop?: boolean;
	isPlaying: boolean;
	scale?: number;
	position?: {
		x?: number;
		y?: number;
	};
	isChromaKeyEnabled?: boolean;
	chromaKeyConfig?: {
		keyColor?: [number, number, number];
		similarity?: number;
		smoothness?: number;
		spill?: number;
	};
}
