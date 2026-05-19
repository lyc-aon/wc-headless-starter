import type { StoreProduct, WchsCroProduct } from './products';

function coaFileExtension(url: string): string {
	try {
		const base =
			typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
		const path = new URL(url, base).pathname;
		const match = path.match(/(\.[a-z0-9]{2,8})$/i);
		return match ? match[1].toLowerCase() : '.pdf';
	} catch {
		return '.pdf';
	}
}

/** Suggested filename for a COA save dialog. */
export function coaDownloadFilename(
	productSlug: string,
	batch?: string,
	url?: string
): string {
	const slug = productSlug.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
	const batchPart = batch?.trim()
		? `-${batch.trim().replace(/[^\w.-]+/g, '-')}`
		: '';
	const ext = url ? coaFileExtension(url) : '.pdf';
	return `${slug}${batchPart}-coa${ext}`;
}

/** Fetch same-origin COA and trigger a file download (no new tab). */
export async function downloadCoaFile(url: string, filename: string): Promise<void> {
	const res = await fetch(url, { credentials: 'same-origin' });
	if (!res.ok) throw new Error(`COA download failed (${res.status})`);
	const blob = await res.blob();
	const objectUrl = URL.createObjectURL(blob);
	try {
		const anchor = document.createElement('a');
		anchor.href = objectUrl;
		anchor.download = filename;
		anchor.rel = 'noopener';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

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
