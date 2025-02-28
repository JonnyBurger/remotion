import type {Dimensions, ImageType} from '../errors';
import type {
	Options,
	ParseMediaFields,
	ParseMediaOptions,
	ParseMediaResult,
} from '../options';

export type ParseMediaOnWorker = {
	type: 'request-worker';
	payload: Omit<ParseMediaOptions<Options<ParseMediaFields>>, 'worker'>;
};

type RequestPause = {
	type: 'request-pause';
};

type RequestResume = {
	type: 'request-resume';
};

type RequestAbort = {
	type: 'request-abort';
};

type ResponseDone = {
	type: 'response-done';
	payload: ParseMediaResult<Options<ParseMediaFields>>;
};

type BaseError = {
	errorStack: string;
	errorMessage: string;
};

type GenericError = BaseError & {
	errorName: 'Error';
};

type IsAGifError = BaseError & {
	errorName: 'IsAGifError';
	mimeType: string | null;
	sizeInBytes: number | null;
	fileName: string | null;
};

type IsAnImageError = BaseError & {
	errorName: 'IsAnImageError';
	imageType: ImageType;
	dimensions: Dimensions | null;
	mimeType: string | null;
	sizeInBytes: number | null;
	fileName: string | null;
};

type IsAPdfError = BaseError & {
	errorName: 'IsAPdfError';
	mimeType: string | null;
	sizeInBytes: number | null;
	fileName: string | null;
};

type IsAnUnsupportedFileTypeError = BaseError & {
	errorName: 'IsAnUnsupportedFileTypeError';
	mimeType: string | null;
	sizeInBytes: number | null;
	fileName: string | null;
};

type MediaParserAbortError = BaseError & {
	errorName: 'MediaParserAbortError';
};

type AnyError =
	| GenericError
	| IsAGifError
	| IsAnImageError
	| IsAPdfError
	| IsAnUnsupportedFileTypeError
	| MediaParserAbortError;

export type ResponseError = {
	type: 'response-error';
} & AnyError;

export type WorkerPayload =
	| ParseMediaOnWorker
	| RequestResume
	| RequestPause
	| RequestAbort
	| ResponseDone
	| ResponseError;
