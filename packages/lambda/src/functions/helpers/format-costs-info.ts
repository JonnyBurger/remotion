import {CostsInfo} from '../../shared/constants';

export const formatCostsInfo = (accrued: number): CostsInfo => {
	return {
		accruedSoFar: accrued,
		displayCost: new Intl.NumberFormat('en-US', {
			currency: 'USD',
			currencyDisplay: 'narrowSymbol',
		}).format(accrued),
		currency: 'USD',
		disclaimer:
			'Estimated cost only. Does not include charges for other AWS services.',
	};
};
