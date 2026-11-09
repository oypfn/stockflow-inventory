import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Activity, AlertTriangle, ArrowDownToLine, ArrowUpRight, Bell, Boxes, CircleHelp, LayoutDashboard, Menu, Package, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, TrendingUp, Trash2, X } from 'lucide-react';
import { buildInventoryCsv, inventoryValue, parseProducts, STORAGE_KEY, stockStatus, type Product, type ProductInput } from './domain';

const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const initialProducts: Product[] = [
  { id: 'p-1', name: 'Wireless Headphones', sku: 'ELEC-024', category: 'Electronics', quantity: 48, reorderLevel: 12, unitPrice: 39.9, supplier: 'Northstar Supply', updatedAt: new Date().toISOString() },
  { id: 'p-2', name: 'Ceramic Coffee Mug', sku: 'HOME-018', category: 'Home & Living', quantity: 9, reorderLevel: 15, unitPrice: 12.5, supplier: 'Form & Field', updatedAt: new Date().toISOString() },
  { id: 'p-3', name: 'Everyday Notebook', sku: 'STAT-006', category: 'Stationery', quantity: 126, reorderLevel: 30, unitPrice: 4.25, supplier: 'Paper Collective', updatedAt: new Date().toISOString() },
  { id: 'p-4', name: 'Desk Lamp', sku: 'HOME-031', category: 'Home & Living', quantity: 6, reorderLevel: 10, unitPrice: 28, supplier: 'Northstar Supply', updatedAt: new Date().toISOString() },
  { id: 'p-5', name: 'Insulated Bottle', sku: 'OUT-012', category: 'Outdoor', quantity: 72, reorderLevel: 20, unitPrice: 21.75, supplier: 'Trail Goods', updatedAt: new Date().toISOString() }
];
const emptyForm: ProductInput = { name: '', sku: '', category: 'General', quantity: 0, reorderLevel: 5, unitPrice: 0, supplier: '' };

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved === null ? initialProducts : parseProducts(saved); }
    catch { return initialProducts; }
  });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low'>('all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch { setNotice('Browser storage is unavailable. Changes may not persist after closing this tab.'); } }, [products]);
  const lowStock = products.filter(p => stockStatus(p) === 'low');
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = inventoryValue(products);
  const categories = new Set(products.map(p => p.category)).size;
  const visible = useMemo(() => products.filter(p => (filter === 'all' || stockStatus(p) === 'low') && [p.name, p.sku, p.category, p.supplier].some(v => v.toLowerCase().includes(query.toLowerCase()))), [products, filter, query]);
  function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const product: Product = { ...form, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
    if (!product.name.trim() || !product.sku.trim() || !product.supplier.trim()) return;
    if (products.some(p => p.sku.toLowerCase() === product.sku.toLowerCase())) { setNotice('A product with this SKU already exists.'); return; }
    setProducts(current => [product, ...current]); setForm(emptyForm); setModal(false); setNotice('Product added to inventory.');
  }
  function removeProduct(id: string) {
    const target = products.find(p => p.id === id);
    if (target && window.confirm(`Remove ${target.name} from inventory?`)) setProducts(current => current.filter(p => p.id !== id));
  }
  function exportCsv() {
    const csv = buildInventoryCsv(products);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'stockflow-inventory.csv'; link.click(); URL.revokeObjectURL(url);
  }
  function updateQuantity(product: Product, delta: number) {
    setProducts(current => current.map(p => p.id === product.id ? { ...p, quantity: Math.max(0, p.quantity + delta), updatedAt: new Date().toISOString() } : p));
  }
  const nav = <><a className="nav-item active" href="#overview"><LayoutDashboard size={18}/> Overview</a><a className="nav-item" href="#inventory"><Package size={18}/> Inventory <span>{products.length}</span></a><a className="nav-item" href="#alerts"><Bell size={18}/> Stock alerts <span className="nav-alert">{lowStock.length}</span></a></>;
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#"><span className="brand-mark"><Boxes size={21}/></span><span>stockflow<small>INVENTORY WORKSPACE</small></span></a>
      <div className="workspace-label">WORKSPACE</div>{nav}
      <div className="sidebar-bottom"><div className="plan-card"><ShieldCheck size={17}/><div><strong>Local workspace</strong><small>Demo data · This browser</small></div></div><a className="nav-item" href="#settings"><Settings2 size={18}/> Settings</a><a className="nav-item" href="#help"><CircleHelp size={18}/> Help & documentation</a></div>
    </aside>
    {mobileMenu && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileMenu(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu"><Menu size={19}/></button><div className="breadcrumbs">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><span className="status-dot"/> <span className="status-label">All changes saved locally</span><button className="icon-button" aria-label="Export inventory" onClick={exportCsv}><ArrowDownToLine size={18}/></button><div className="avatar">OF</div></div></header>
      <div className="content-wrap">
        <section className="page-heading"><div><div className="eyebrow">MONDAY, YOUR BUSINESS AT A GLANCE</div><h1>Inventory overview</h1><p>Keep your stock, suppliers and operations moving in one place.</p></div><button className="primary-button" onClick={() => setModal(true)}><Plus size={18}/> Add product</button></section>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={15}/></button></div>}
        <section className="metrics-grid" aria-label="Inventory summary">
          <article className="metric-card"><div className="metric-top"><span>Total products</span><span className="metric-icon blue"><Package size={18}/></span></div><strong>{products.length}</strong><small><TrendingUp size={13}/> Active catalogue items</small></article>
          <article className="metric-card"><div className="metric-top"><span>Units in stock</span><span className="metric-icon violet"><Boxes size={18}/></span></div><strong>{totalUnits.toLocaleString('en-GB')}</strong><small>Across all product lines</small></article>
          <article className="metric-card"><div className="metric-top"><span>Inventory value</span><span className="metric-icon green"><Activity size={18}/></span></div><strong>{money.format(totalValue)}</strong><small>Based on unit purchase value</small></article>
          <article className="metric-card"><div className="metric-top"><span>Low-stock items</span><span className="metric-icon amber"><AlertTriangle size={18}/></span></div><strong>{lowStock.length}</strong><small>{lowStock.length ? 'Needs replenishment review' : 'All products above threshold'}</small></article>
        </section>
        <section className="panel inventory-panel" id="inventory"><div className="panel-heading"><div><h2>Product inventory</h2><p>Search and manage the items in your catalogue.</p></div><button className="secondary-button" onClick={exportCsv}><ArrowDownToLine size={16}/> Export CSV</button></div>
          <div className="table-toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, SKU or supplier…" aria-label="Search inventory"/></label><div className="filter-group"><SlidersHorizontal size={16}/><button className={filter === 'all' ? 'filter-active' : ''} onClick={() => setFilter('all')}>All items</button><button className={filter === 'low' ? 'filter-active' : ''} onClick={() => setFilter('low')}>Low stock</button></div></div>
          <div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>STOCK LEVEL</th><th>UNIT PRICE</th><th>SUPPLIER</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
            {visible.map(p => <tr key={p.id}><td><div className="product-cell"><span className="product-icon"><Package size={17}/></span><strong>{p.name}</strong></div></td><td className="sku">{p.sku}</td><td><span className="category-pill">{p.category}</span></td><td><div className="stock-cell"><strong>{p.quantity}</strong><span className={stockStatus(p) === 'low' ? 'stock-badge low' : 'stock-badge healthy'}>{stockStatus(p) === 'low' ? 'Low stock' : 'In stock'}</span><div className="quantity-actions"><button onClick={() => updateQuantity(p, -1)} aria-label={`Decrease ${p.name} stock`}>−</button><button onClick={() => updateQuantity(p, 1)} aria-label={`Increase ${p.name} stock`}>+</button></div></div></td><td>{money.format(p.unitPrice)}</td><td>{p.supplier}</td><td><button className="icon-button delete-button" onClick={() => removeProduct(p.id)} aria-label={`Delete ${p.name}`}><Trash2 size={16}/></button></td></tr>)}
            {!visible.length && <tr><td colSpan={7} className="empty-state">No products match your search. Try another term or add a product.</td></tr>}
          </tbody></table></div><div className="table-footer"><span>Showing <strong>{visible.length}</strong> of <strong>{products.length}</strong> products</span><span>Stock values update as you make changes <ArrowUpRight size={13}/></span></div>
        </section>
        <section className="bottom-grid" id="alerts"><article className="panel alert-panel"><div className="panel-heading"><div><h2>Replenishment watch</h2><p>Items at or below their reorder level.</p></div><span className="alert-count">{lowStock.length} alerts</span></div>{lowStock.length ? lowStock.map(p => <div className="alert-row" key={p.id}><span className="alert-symbol"><AlertTriangle size={17}/></span><div><strong>{p.name}</strong><small>{p.sku} · Reorder at {p.reorderLevel}</small></div><b>{p.quantity} left</b></div>) : <div className="success-state"><ShieldCheck size={20}/> No replenishment alerts right now.</div>}</article>
          <article className="panel category-panel"><div className="panel-heading"><div><h2>Catalogue health</h2><p>A quick snapshot of your product range.</p></div><span className="category-total">{categories} categories</span></div><div className="health-stat"><span>Healthy stock lines</span><strong>{products.length - lowStock.length}</strong></div><div className="health-stat"><span>Need attention</span><strong className="attention">{lowStock.length}</strong></div><div className="health-bar"><span style={{ width: `${products.length ? ((products.length - lowStock.length) / products.length) * 100 : 0}%` }}/></div><small className="health-caption">Share of products above reorder threshold</small></article></section>
        <footer>StockFlow <span>·</span> Inventory workspace <span>·</span> Demo version 0.1.0</footer>
      </div>
    </main>
    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">CATALOGUE MANAGEMENT</span><h2 id="modal-title">Add a product</h2></div><button className="icon-button" onClick={() => setModal(false)} aria-label="Close dialog"><X size={18}/></button></div><form onSubmit={addProduct}><div className="form-grid"><label>Product name<input required maxLength={80} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label>SKU<input required maxLength={32} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value.trimStart() })}/></label><label>Category<input required maxLength={40} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}/></label><label>Supplier<input required maxLength={80} value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}/></label><label>Quantity<input type="number" min="0" step="1" required value={form.quantity} onChange={e => setForm({ ...form, quantity: Math.max(0, Number(e.target.value)) })}/></label><label>Reorder level<input type="number" min="0" step="1" required value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: Math.max(0, Number(e.target.value)) })}/></label><label className="full-field">Unit price (€)<input type="number" min="0" step="0.01" required value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: Math.max(0, Number(e.target.value)) })}/></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={16}/> Save product</button></div></form></section></div>}
  </div>;
}