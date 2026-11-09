import { describe, expect, it } from 'vitest';
import { buildInventoryCsv, inventoryValue, parseProducts, stockStatus, type Product } from './domain';
const product: Product = { id: '1', name: 'Notebook', sku: 'NOTE-01', category: 'Stationery', quantity: 4, reorderLevel: 5, unitPrice: 2.5, supplier: 'Paper Co', updatedAt: '2025-01-01T00:00:00.000Z' };
describe('inventory domain', () => {
  it('parses valid product records and rejects malformed entries', () => {
    expect(parseProducts(JSON.stringify([product, { id: 2 }]))).toEqual([product]);
  });
  it('handles invalid and empty persisted data safely', () => {
    expect(parseProducts('{broken')).toEqual([]);
    expect(parseProducts(null)).toEqual([]);
    expect(parseProducts('{"items":[]}')).toEqual([]);
  });
  it('flags stock at or below the reorder threshold', () => {
    expect(stockStatus(product)).toBe('low');
    expect(stockStatus({ ...product, quantity: 6 })).toBe('healthy');
  });
  it('calculates total inventory value', () => {
    expect(inventoryValue([product, { ...product, id: '2', quantity: 2 }])).toBe(15);
  });
});


describe('inventory CSV export', () => {
  it('quotes fields and escapes embedded quotes', () => {
    const csv = buildInventoryCsv([{ ...product, name: 'Notebook "A"' }]);
    expect(csv).toContain('"Notebook ""A"""');
  });
  it('neutralizes spreadsheet formula prefixes in user-controlled fields', () => {
    const csv = buildInventoryCsv([{ ...product, name: '=HYPERLINK("https://example.com")' }]);
    expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")"');
  });
});
