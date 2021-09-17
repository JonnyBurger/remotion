import os from 'os';
import {Config} from 'remotion';
import {webpackOverride} from './webpack-override';

Config.Rendering.setConcurrency(os.cpus().length);
Config.Output.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig(webpackOverride);
