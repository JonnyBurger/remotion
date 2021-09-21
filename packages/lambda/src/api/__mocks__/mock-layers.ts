export const layersEnsured: {[key: string]: boolean} = {};

export const ensureLayer = (layer: string) => {
	layersEnsured[layer] = true;
};

export const isLayerEnsured = (layer: string): boolean => {
	return Boolean(layersEnsured[layer]);
};
