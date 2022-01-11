/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {StackFrame} from './stack-frame';
import {parse} from './parser';
import {map} from './mapper';
import {unmap} from './unmapper';

const getStackFrames = (
	error: Error & {__unmap_source?: string},
	contextSize = 3
): Promise<StackFrame[] | null> => {
	const parsedFrames = parse(error);
	let enhancedFramesPromise;
	if (error.__unmap_source) {
		enhancedFramesPromise = unmap(
			error.__unmap_source,
			parsedFrames,
			contextSize
		);
	} else {
		enhancedFramesPromise = map(parsedFrames, contextSize);
	}

	return enhancedFramesPromise.then((enhancedFrames) => {
		if (
			enhancedFrames
				.map((f) => f._originalFileName)
				.filter(
					(f) =>
						f !== null && f !== undefined && f.indexOf('node_modules') === -1
				).length === 0
		) {
			return null;
		}

		return enhancedFrames.filter(
			({functionName}) =>
				functionName === null ||
				functionName === undefined ||
				functionName.indexOf('__stack_frame_overlay_proxy_console__') === -1
		);
	});
};

export default getStackFrames;
export {getStackFrames};
