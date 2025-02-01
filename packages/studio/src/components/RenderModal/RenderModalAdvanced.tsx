import type {ChromeMode, Codec, X264Preset} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {UiOpenGlOptions} from '@remotion/studio-shared';
import type {ChangeEvent} from 'react';
import React, {useCallback, useMemo} from 'react';
import {labelx264Preset} from '../../helpers/presets-labels';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue, SelectionItem} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import {Spacing} from '../layout';
import {NumberSetting} from './NumberSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {RenderModalEnvironmentVariables} from './RenderModalEnvironmentVariables';
import {RenderModalHr} from './RenderModalHr';
import {input, label, optionRow, rightRow} from './layout';

export type RenderType = 'still' | 'video' | 'audio' | 'sequence';

const container: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
};

export const RenderModalAdvanced: React.FC<{
	readonly renderMode: RenderType;
	readonly minConcurrency: number;
	readonly maxConcurrency: number;
	readonly setConcurrency: React.Dispatch<React.SetStateAction<number>>;
	readonly concurrency: number;
	readonly delayRenderTimeout: number;
	readonly setDelayRenderTimeout: React.Dispatch<React.SetStateAction<number>>;
	readonly disallowParallelEncoding: boolean;
	readonly setDisallowParallelEncoding: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly setDisableWebSecurity: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setIgnoreCertificateErrors: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly ignoreCertificateErrors: boolean;
	readonly disableWebSecurity: boolean;
	readonly openGlOption: UiOpenGlOptions;
	readonly setOpenGlOption: React.Dispatch<
		React.SetStateAction<UiOpenGlOptions>
	>;
	readonly chromeModeOption: ChromeMode;
	readonly setChromeModeOption: React.Dispatch<
		React.SetStateAction<ChromeMode>
	>;
	readonly envVariables: [string, string][];
	readonly setEnvVariables: React.Dispatch<
		React.SetStateAction<[string, string][]>
	>;
	readonly x264Preset: X264Preset | null;
	readonly setx264Preset: React.Dispatch<React.SetStateAction<X264Preset>>;
	readonly hardwareAcceleration: HardwareAccelerationOption;
	readonly setHardwareAcceleration: React.Dispatch<
		React.SetStateAction<HardwareAccelerationOption>
	>;
	readonly offthreadVideoCacheSizeInBytes: number | null;
	readonly setOffthreadVideoCacheSizeInBytes: React.Dispatch<
		React.SetStateAction<number | null>
	>;
	readonly codec: Codec;
	readonly enableMultiProcessOnLinux: boolean;
	readonly setChromiumMultiProcessOnLinux: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly userAgent: string | null;
	readonly setUserAgent: React.Dispatch<React.SetStateAction<string | null>>;
	readonly beep: boolean;
	readonly setBeep: React.Dispatch<React.SetStateAction<boolean>>;
	readonly repro: boolean;
	readonly setRepro: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
	renderMode,
	maxConcurrency,
	minConcurrency,
	setConcurrency,
	concurrency,
	delayRenderTimeout,
	setDelayRenderTimeout,
	disallowParallelEncoding,
	setDisallowParallelEncoding,
	setDisableWebSecurity,
	setIgnoreCertificateErrors,
	ignoreCertificateErrors,
	disableWebSecurity,
	openGlOption,
	setOpenGlOption,
	setEnvVariables,
	envVariables,
	setx264Preset,
	x264Preset,
	codec,
	offthreadVideoCacheSizeInBytes,
	setOffthreadVideoCacheSizeInBytes,
	enableMultiProcessOnLinux,
	setChromiumMultiProcessOnLinux,
	setUserAgent,
	userAgent,
	beep,
	setBeep,
	repro,
	setRepro,
	hardwareAcceleration,
	chromeModeOption,
	setChromeModeOption,
	setHardwareAcceleration,
}) => {
	const extendedOpenGlOptions: UiOpenGlOptions[] = useMemo(() => {
		return [
			'angle',
			'egl',
			'swangle',
			'swiftshader',
			'vulkan',
			'angle-egl',
			'default',
		];
	}, []);

	const toggleCustomOffthreadVideoCacheSizeInBytes = useCallback(() => {
		setOffthreadVideoCacheSizeInBytes((previous) => {
			if (previous === null) {
				return 512 * 1024 * 1024;
			}

			return null;
		});
	}, [setOffthreadVideoCacheSizeInBytes]);

	const toggleCustomUserAgent = useCallback(() => {
		setUserAgent((previous) => {
			if (previous === null) {
				return 'Mozilla/5.0 (Remotion)';
			}

			return null;
		});
	}, [setUserAgent]);

	const onDisallowParallelEncodingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setDisallowParallelEncoding(e.target.checked);
		},
		[setDisallowParallelEncoding],
	);

	const onDisableWebSecurityChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setDisableWebSecurity(e.target.checked);
		},
		[setDisableWebSecurity],
	);

	const onEnableMultiProcessOnLinux = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setChromiumMultiProcessOnLinux(e.target.checked);
		},
		[setChromiumMultiProcessOnLinux],
	);

	const onIgnoreCertificatErrors = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setIgnoreCertificateErrors(e.target.checked);
		},
		[setIgnoreCertificateErrors],
	);

	const onUserAgentChanged: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setUserAgent(e.target.value);
			},
			[setUserAgent],
		);

	const onPlayBeepSound = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setBeep(e.target.checked);
		},
		[setBeep],
	);

	const onReproToggle = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setRepro(e.target.checked);
		},
		[setRepro],
	);

	const openGlOptions = useMemo((): ComboboxValue[] => {
		return extendedOpenGlOptions.map((option) => {
			return {
				label: option === 'default' ? 'Default' : option,
				onClick: () => setOpenGlOption(option),
				key: option,
				leftItem: openGlOption === option ? <Checkmark /> : null,
				id: option,
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: option,
			};
		});
	}, [extendedOpenGlOptions, openGlOption, setOpenGlOption]);

	const chromeModeOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.validChromeModeOptions.map((option) => {
			return {
				label: option,
				onClick: () => setChromeModeOption(option),
				key: option,
				leftItem: chromeModeOption === option ? <Checkmark /> : null,
				id: option,
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: option,
			};
		});
	}, [chromeModeOption, setChromeModeOption]);

	const x264PresetOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.x264PresetOptions.map((option) => {
			return {
				label: labelx264Preset(option),
				onClick: () => setx264Preset(option),
				key: option,
				type: 'item',
				id: option,
				keyHint: null,
				leftItem: x264Preset === option ? <Checkmark /> : null,
				quickSwitcherLabel: null,
				subMenu: null,
				value: option,
			};
		});
	}, [setx264Preset, x264Preset]);

	const hardwareAccelerationValues = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.hardwareAccelerationOptions.map(
			(option): SelectionItem => {
				return {
					label: option,
					onClick: () => setHardwareAcceleration(option),
					leftItem: hardwareAcceleration === option ? <Checkmark /> : null,
					subMenu: null,
					quickSwitcherLabel: null,
					type: 'item',
					id: option,
					keyHint: null,
					value: option,
				};
			},
		);
	}, [hardwareAcceleration, setHardwareAcceleration]);

	const changeOffthreadVideoCacheSizeInBytes: React.Dispatch<
		React.SetStateAction<number>
	> = useCallback(
		(cb) => {
			setOffthreadVideoCacheSizeInBytes((prev) => {
				if (prev === null) {
					throw new TypeError('Expected previous value');
				}

				if (typeof cb === 'function') {
					return cb(prev);
				}

				return cb;
			});
		},
		[setOffthreadVideoCacheSizeInBytes],
	);

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{renderMode === 'still' ? null : (
				<NumberSetting
					min={minConcurrency}
					max={maxConcurrency}
					step={1}
					name="Concurrency"
					formatter={(w) => `${w}x`}
					onValueChanged={setConcurrency}
					value={concurrency}
				/>
			)}
			{renderMode === 'video' && codec === 'h264' ? (
				<div style={optionRow}>
					<div style={label}>
						x264 Preset
						<Spacing x={0.5} />
						<OptionExplainerBubble id="x264Option" />
					</div>
					<div style={rightRow}>
						<Combobox
							title={x264Preset as string}
							selectedId={x264Preset as string}
							values={x264PresetOptions}
						/>
					</div>
				</div>
			) : null}
			{renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>
						Hardware acceleration
						<Spacing x={0.5} />
						<OptionExplainerBubble id="hardwareAccelerationOption" />
					</div>
					<div style={rightRow}>
						<Combobox
							title={hardwareAcceleration as string}
							selectedId={hardwareAcceleration as string}
							values={hardwareAccelerationValues}
						/>
					</div>
				</div>
			) : null}

			<NumberSetting
				// Also appears in packages/renderer/src/validate-puppeteer-timeout.ts
				min={7_000}
				max={900_000}
				name="delayRender() timeout"
				onValueChanged={setDelayRenderTimeout}
				formatter={(w) => `${w}ms`}
				step={1000}
				hint="delayRenderTimeoutInMillisecondsOption"
				value={delayRenderTimeout}
			/>
			<div style={optionRow}>
				<div style={label}>No parallel encoding</div>
				<div style={rightRow}>
					<Checkbox
						checked={disallowParallelEncoding}
						onChange={onDisallowParallelEncodingChanged}
						name="disallow-parallel-encoding"
					/>
				</div>
			</div>
			{renderMode === 'audio' ? null : (
				<div style={optionRow}>
					<div style={label}>Custom OffthreadVideo cache</div>
					<Spacing x={0.5} />
					<OptionExplainerBubble id="offthreadVideoCacheSizeInBytesOption" />
					<div style={rightRow}>
						<Checkbox
							checked={offthreadVideoCacheSizeInBytes !== null}
							onChange={toggleCustomOffthreadVideoCacheSizeInBytes}
							name="custom-audio-bitrate"
						/>
					</div>
				</div>
			)}
			{renderMode === 'audio' ||
			offthreadVideoCacheSizeInBytes === null ? null : (
				<NumberSetting
					min={minConcurrency}
					max={2000 * 1024 * 1024}
					step={1024}
					name="OffthreadVideo cache size"
					formatter={(w) => `${w} bytes`}
					onValueChanged={changeOffthreadVideoCacheSizeInBytes}
					value={offthreadVideoCacheSizeInBytes}
				/>
			)}
			<RenderModalHr />
			<div style={optionRow}>
				<div style={label}>Disable web security</div>
				<div style={rightRow}>
					<Checkbox
						checked={disableWebSecurity}
						onChange={onDisableWebSecurityChanged}
						name="disable-web-security"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Ignore certificate errors</div>
				<div style={rightRow}>
					<Checkbox
						checked={ignoreCertificateErrors}
						onChange={onIgnoreCertificatErrors}
						name="ignore-certificate-errors"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>
					Chrome Mode <Spacing x={0.5} />
					<OptionExplainerBubble id="chromeModeOption" />
				</div>

				<div style={rightRow}>
					<Combobox
						values={chromeModeOptions}
						selectedId={chromeModeOption}
						title="Chrome mode"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>
					OpenGL render backend <Spacing x={0.5} />
					<OptionExplainerBubble id="glOption" />
				</div>

				<div style={rightRow}>
					<Combobox
						values={openGlOptions}
						selectedId={openGlOption}
						title="OpenGl option"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Multi-process Chrome on Linux</div>
				<Spacing x={0.5} />
				<OptionExplainerBubble id="enableMultiprocessOnLinuxOption" />
				<div style={rightRow}>
					<Checkbox
						checked={enableMultiProcessOnLinux}
						onChange={onEnableMultiProcessOnLinux}
						name="enable-multi-process-on-linux"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Custom User Agent</div>
				<div style={rightRow}>
					<Checkbox
						checked={userAgent !== null}
						onChange={toggleCustomUserAgent}
						name="custom-user-agent"
					/>
				</div>
			</div>
			{userAgent === null ? null : (
				<div style={optionRow}>
					<div style={label}>User Agent</div>
					<div style={rightRow}>
						<div>
							<RemotionInput
								style={input}
								value={userAgent}
								onChange={onUserAgentChanged}
								status="ok"
								rightAlign
							/>
						</div>
					</div>
				</div>
			)}
			<div style={optionRow}>
				<div style={label}>
					Create a reproduction <OptionExplainerBubble id="reproOption" />
				</div>

				<div style={rightRow}>
					<Checkbox checked={repro} onChange={onReproToggle} name="repro" />
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>
					Beep when finished <OptionExplainerBubble id="beepOnFinishOption" />
				</div>

				<div style={rightRow}>
					<Checkbox
						checked={beep}
						onChange={onPlayBeepSound}
						name="beep-when-finished"
					/>
				</div>
			</div>
			<RenderModalHr />
			<RenderModalEnvironmentVariables
				envVariables={envVariables}
				setEnvVariables={setEnvVariables}
			/>
		</div>
	);
};
