export type Product = {
  id: string; name: string; sku: string; category: string; quantity: number;
  reorderLevel: number; unitPrice: number; supplier: string; updatedAt: string;
};
export type ProductInput = Omit<Product, 'id' | 'updatedAt'>;
export const STORAGE_KEY = 'stockflow.products.v1';
export function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return typeof p.id === 'string' && typeof p.name === 'string' &&
    typeof p.sku === 'string' && typeof p.category === 'string' &&
    typeof p.supplier === 'string' && typeof p.updatedAt === 'string' &&
    Number.isInteger(p.quantity) && Number(p.quantity) >= 0 &&
    Number.isInteger(p.reorderLevel) && Number(p.reorderLevel) >= 0 &&
    typeof p.unitPrice === 'number' && Number.isFinite(p.unitPrice) && p.unitPrice >= 0;
}
export function parseProducts(raw: string | null): Product[] {
  if (!raw) return [];
  try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter(isProduct) : []; }
  catch { return []; }
}
export function stockStatus(product: Product): 'low' | 'healthy' {
  return product.quantity <= product.reorderLevel ? 'low' : 'healthy';
}
export function inventoryValue(products: Product[]): number {
  return products.reduce((total, product) => total + product.quantity * product.unitPrice, 0);
}

function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function buildInventoryCsv(products: Product[]): string {
  const rows = [
    ['Name', 'SKU', 'Category', 'Quantity', 'Reorder level', 'Unit price EUR', 'Supplier'],
    ...products.map((product) => [
      product.name,
      product.sku,
      product.category,
      String(product.quantity),
      String(product.reorderLevel),
      String(product.unitPrice),
      product.supplier,
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
