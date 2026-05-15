import type { StoreProduct, WchsCroProduct } from './products';

/** Per-product COA PDF/link from Woo meta (`_wchs_coa_url` / `coa_url`). */
export function resolveCoaDownloadUrl(
	product: StoreProduct,
	cro?: WchsCroProduct | null,
	coaLibraryUrl?: string
): string {
	const direct = cro?.coa_url || product.extensions?.wchs_cro?.coa_url;
	if (direct) return direct;
	const lib = (coaLibraryUrl || '').trim();
	if (!lib) return '';
	const base = lib.includes('?') ? lib : lib.replace(/\/?$/, '');
	return `${base}${lib.includes('?') ? '&' : '?'}product=${encodeURIComponent(product.slug)}`;
}
