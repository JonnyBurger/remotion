import type {MediaParserController} from '../media-parser-controller';
import type {WorkerPayload} from './worker-types';

export const forwardMediaParserControllerToWorker = (
	controller: MediaParserController,
): ((message: WorkerPayload) => void) => {
	return (message) => {
		if (message.type === 'request-pause') {
			controller.pause();
		}

		if (message.type === 'request-resume') {
			controller.resume();
		}

		if (message.type === 'request-abort') {
			controller.abort();
		}
	};
};
