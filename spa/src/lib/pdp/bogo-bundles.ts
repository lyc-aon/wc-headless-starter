import type { WchsCroTierRow } from '$lib/wc/products';

export type BogoBundlePreset = {
	paid_qty: number;
	flag?: string;
};

export type BogoBundleConfig = {
	enabled?: boolean;
	savings_pct?: number;
	presets?: BogoBundlePreset[];
};

export type BundleDisplayRow = WchsCroTierRow & {
	paid_qty: number;
	flag: string;
	title: string;
	compare_line_total: number;
};

const DEFAULT_PRESETS: BogoBundlePreset[] = [
	{ paid_qty: 1, flag: '' },
	{ paid_qty: 2, flag: 'MOST POPULAR' },
	{ paid_qty: 3, flag: 'BEST VALUE' },
];

/** Buy N get N free → cart qty 2N, pay for N at regular, 50% effective per unit. */
export function buildBogoBundleRows(
	regularMinor: number,
	savingsPct = 50,
	presets: BogoBundlePreset[] = DEFAULT_PRESETS
): BundleDisplayRow[] {
	if (regularMinor <= 0) return [];

	const pct = Math.min(100, Math.max(0, savingsPct));
	const unitMinor = Math.round(regularMinor * (1 - pct / 100));

	return presets.map((preset) => {
		const paid = preset.paid_qty;
		const minQty = paid * 2;
		const lineTotal = paid * regularMinor;
		const compareTotal = minQty * regularMinor;

		return {
			min_qty: minQty,
			unit_price: unitMinor,
			savings_per_unit: regularMinor - unitMinor,
			savings_pct: pct,
			line_total_at_min_qty: lineTotal,
			paid_qty: paid,
			flag: preset.flag ?? '',
			title: `Buy ${paid} Get ${paid} Free`,
			compare_line_total: compareTotal,
		};
	});
}

export function enrichTierRows(
	tiers: WchsCroTierRow[],
	regularMinor: number,
	presets: BogoBundlePreset[] = DEFAULT_PRESETS
): BundleDisplayRow[] {
	return tiers.map((tier, i) => {
		const preset = presets[i];
		const paid =
			preset?.paid_qty ??
			(tier.min_qty % 2 === 0 && tier.min_qty >= 2 ? tier.min_qty / 2 : tier.min_qty);
		const compare = regularMinor > 0 ? tier.min_qty * regularMinor : tier.line_total_at_min_qty * 2;

		return {
			...tier,
			paid_qty: paid,
			flag: preset?.flag ?? (i === 1 ? 'MOST POPULAR' : i === 2 ? 'BEST VALUE' : ''),
			title:
				tier.min_qty >= 2 && tier.min_qty % 2 === 0
					? `Buy ${paid} Get ${paid} Free`
					: `${tier.min_qty}+ units`,
			compare_line_total: compare,
		};
	});
}

export function resolveBundleRows(
	apiTiers: WchsCroTierRow[],
	regularMinor: number,
	bogo?: BogoBundleConfig | null
): BundleDisplayRow[] {
	const enabled = bogo?.enabled !== false;
	const presets = bogo?.presets?.length ? bogo.presets : DEFAULT_PRESETS;
	const savingsPct = bogo?.savings_pct ?? 50;

	if (apiTiers.length > 0) {
		return enrichTierRows(apiTiers, regularMinor, presets);
	}
	if (!enabled || regularMinor <= 0) return [];
	return buildBogoBundleRows(regularMinor, savingsPct, presets);
}
