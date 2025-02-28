import {
	IsAGifError,
	IsAnImageError,
	IsAnUnsupportedFileTypeError,
	IsAPdfError,
	MediaParserAbortError,
} from '../errors';
import type {LogLevel} from '../log';
import {Log} from '../log';
import type {ResponseError} from './worker-types';

export const serializeError = (
	error: Error,
	logLevel: LogLevel,
): ResponseError => {
	if (error instanceof IsAGifError) {
		return {
			type: 'response-error',
			errorName: 'IsAGifError',
			errorMessage: error.message,
			errorStack: error.stack ?? '',
			mimeType: error.mimeType,
			sizeInBytes: error.sizeInBytes,
			fileName: error.fileName,
		};
	}

	if (error instanceof IsAnImageError) {
		return {
			type: 'response-error',
			errorName: 'IsAnImageError',
			dimensions: error.dimensions,
			errorMessage: error.message,
			errorStack: error.stack ?? '',
			fileName: error.fileName,
			imageType: error.imageType,
			mimeType: error.mimeType,
			sizeInBytes: error.sizeInBytes,
		};
	}

	if (error instanceof IsAPdfError) {
		return {
			type: 'response-error',
			errorName: 'IsAPdfError',
			errorMessage: error.message,
			errorStack: error.stack ?? '',
			mimeType: error.mimeType,
			sizeInBytes: error.sizeInBytes,
			fileName: error.fileName,
		};
	}

	if (error instanceof MediaParserAbortError) {
		return {
			type: 'response-error',
			errorName: 'MediaParserAbortError',
			errorMessage: error.message,
			errorStack: error.stack ?? '',
		};
	}

	if (error.name !== 'Error') {
		Log.warn(
			logLevel,
			`Original error was of type ${error.name} did not properly propagate`,
		);
	}

	return {
		type: 'response-error',
		errorName: 'Error',
		errorMessage: error.message,
		errorStack: error.stack ?? '',
	};
};

export const deserializeError = (error: ResponseError): Error => {
	switch (error.errorName) {
		case 'IsAGifError':
			return new IsAGifError({
				fileName: error.fileName,
				mimeType: error.mimeType,
				sizeInBytes: error.sizeInBytes,
				message: error.errorMessage,
			});
		case 'IsAnImageError':
			return new IsAnImageError({
				dimensions: error.dimensions,
				fileName: error.fileName,
				imageType: error.imageType,
				mimeType: error.mimeType,
				sizeInBytes: error.sizeInBytes,
				message: error.errorMessage,
			});
		case 'IsAPdfError':
			return new IsAPdfError({
				fileName: error.fileName,
				mimeType: error.mimeType,
				sizeInBytes: error.sizeInBytes,
				message: error.errorMessage,
			});
		case 'IsAnUnsupportedFileTypeError':
			return new IsAnUnsupportedFileTypeError({
				fileName: error.fileName,
				mimeType: error.mimeType,
				sizeInBytes: error.sizeInBytes,
				message: error.errorMessage,
			});
		case 'MediaParserAbortError':
			return new MediaParserAbortError(error.errorMessage);
		default:
			return new Error(error.errorMessage);
	}
};
