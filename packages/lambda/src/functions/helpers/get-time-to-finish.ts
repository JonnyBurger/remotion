import {RenderMetadata} from '../../defaults';

export const getTimeToFinish = ({
	renderMetadata,
	lastModified,
}: {
	renderMetadata: RenderMetadata | null;
	lastModified: number | null;
}) => {
	if (!lastModified) {
		return null;
	}

	if (!renderMetadata) {
		return null;
	}

	return lastModified - renderMetadata.startedDate;
};
