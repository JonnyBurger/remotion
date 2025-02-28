import {createAacCodecPrivate} from './aac-codecprivate';
import {getArrayBufferIterator} from './buffer-iterator';
import {parseFtyp} from './containers/iso-base-media/ftyp';
import {parseMvhd} from './containers/iso-base-media/mvhd';
import {processIsoFormatBox} from './containers/iso-base-media/stsd/samples';
import {parseStsd} from './containers/iso-base-media/stsd/stsd';
import {parseTkhd} from './containers/iso-base-media/tkhd';
import {parseEbml} from './containers/webm/parse-ebml';
import {
	ebmlMap,
	matroskaElements,
} from './containers/webm/segments/all-segments';
import {internalParseMedia} from './internal-parse-media';
import type {LogLevel} from './log';
import {Log} from './log';
import {makeParserState} from './state/parser-state';
export type {MatroskaSegment} from './containers/webm/segments';
export type {MatroskaElement} from './containers/webm/segments/all-segments';
export {
	hasBeenAborted,
	IsAGifError,
	IsAnImageError,
	IsAnUnsupportedFileTypeError,
	IsAPdfError,
	MediaParserAbortError,
} from './errors';
export type {SamplePosition} from './get-sample-positions';
export type {
	AudioTrack,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	OtherTrack,
	Track,
	VideoTrack,
	VideoTrackColorParams,
} from './get-tracks';
export type {MetadataEntry} from './metadata/get-metadata';
export type {MediaParserKeyframe, ParseMediaSrc} from './options';
export type {MediaParserEmbeddedImage} from './state/images';

export {downloadAndParseMedia} from './download-and-parse-media';
export type {
	MediaParserContainer,
	Options,
	ParseMediaCallbacks,
	ParseMediaFields,
	ParseMediaOnProgress,
	ParseMediaOptions,
	ParseMediaProgress,
	ParseMediaResult,
	TracksField,
} from './options';
export {parseMedia} from './parse-media';
export type {
	AudioOrVideoSample,
	OnAudioSample,
	OnAudioTrack,
	OnVideoSample,
	OnVideoTrack,
} from './webcodec-sample-types';

export type {Dimensions} from './get-dimensions';
export type {MediaParserLocation} from './get-location';
export type {ReaderInterface} from './readers/reader';

export type {CreateContent, Writer, WriterInterface} from './writers/writer';

export const MediaParserInternals = {
	Log,
	createAacCodecPrivate,
	matroskaElements,
	ebmlMap,
	parseTkhd,
	getArrayBufferIterator,
	parseStsd,
	makeParserState,
	processSample: processIsoFormatBox,
	parseFtyp,
	parseEbml,
	parseMvhd,
	internalParseMedia,
};

export type {Prettify} from './containers/webm/parse-ebml';
export type {
	Ebml,
	EbmlValue,
	FloatWithSize,
	MainSegment,
	PossibleEbml,
	TrackEntry,
	UintWithSize,
} from './containers/webm/segments/all-segments';
export type {LogLevel};

export {M3uStream} from './containers/m3u/get-streams';
export {
	defaultSelectM3uAssociatedPlaylists,
	defaultSelectM3uStreamFn,
	SelectM3uAssociatedPlaylistsFn,
	SelectM3uStreamFn,
	SelectM3uStreamFnOptions,
} from './containers/m3u/select-stream';
export {
	mediaParserController,
	MediaParserController,
} from './media-parser-controller';
export {VERSION} from './version';
