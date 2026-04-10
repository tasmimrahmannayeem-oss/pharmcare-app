import { useState } from 'react'

const orders = [
  { id: 'PO-2024-088', pharmacy: 'Aura — Green Valley', items: 'Paracetamol 500mg ×500, Ibuprofen 400mg ×200', value: '$2,450', date: 'Apr 6, 2026', dueDate: 'Apr 9, 2026', status: 'Delivered', priority: 'Standard' },
  { id: 'PO-2024-082', pharmacy: 'MedCenter — North', items: 'Amoxicillin 500mg ×300, Metformin 850mg ×400', value: '$3,820', date: 'Apr 4, 2026', dueDate: 'Apr 8, 2026', status: 'In Transit', priority: 'Urgent' },
  { id: 'PO-2024-075', pharmacy: 'CityPharm — Downtown', items: 'Atorvastatin 40mg ×200', value: '$1,640', date: 'Apr 1, 2026', dueDate: 'Apr 7, 2026', status: 'Processing', priority: 'Standard' },
  { id: 'PO-2024-071', pharmacy: 'Aura — Westside', items: 'Cetirizine 10mg ×500, Omeprazole ×300', value: '$4,200', date: 'Mar 28, 2026', dueDate: 'Apr 4, 2026', status: 'Delivered', priority: 'Standard' },
  { id: 'PO-2024-066', pharmacy: 'HealthCare Plus', items: 'Lisinopril 10mg ×400, Vitamin D ×200', value: '$2,980', date: 'Mar 25, 2026', dueDate: 'Mar 30, 2026', status: 'Delivered', priority: 'Urgent' },
]

const statusBadge = { Delivered: 'badge-success', 'In Transit': 'badge-info', Processing: 'badge-warning' }
const priorityBadge = { Urgent: 'badge-error', Standard: 'badge-neutral' }

export default function SupplierPurchaseOrders() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">MediSupply Ltd. · {orders.length} orders this month</p>
        </div>
        <button className="btn btn-primary">
          <span className="material-icons" style={{ fontSize: 18 }}>add</span> Create Order
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Orders', val: orders.length, icon: 'receipt_long', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
          { label: 'In Transit', val: 1, icon: 'local_shipping', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
          { label: 'Processing', val: 1, icon: 'pending', bg: 'var(--tertiary-fixed)', ic: 'var(--tertiary-container)' },
          { label: 'Total Value (MTD)', val: '$15,090', icon: 'payments', bg: 'var(--secondary-fixed)', ic: 'var(--secondary)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: s.ic, fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize: '1.75rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['All', 'Processing', 'In Transit', 'Delivered'].map(f => (
          <button key={f} className={`badge ${filter === f ? 'badge-info' : 'badge-neutral'}`}
            style={{ cursor: 'pointer', padding: '7px 14px', fontSize: '0.8125rem' }} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>PO ID</th><th>Pharmacy</th><th>Items</th><th>Value</th><th>Order Date</th><th>Due Date</th><th>Priority</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-container)' }}>{o.id}</td>
                  <td style={{ fontWeight: 600 }}>{o.pharmacy}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', maxWidth: 200 }}>{o.items}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary-container)' }}>{o.value}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{o.date}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{o.dueDate}</td>
                  <td><span className={`badge ${priorityBadge[o.priority]}`}>{o.priority}</span></td>
                  <td><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm">Update</button>
                      <button className="btn btn-ghost btn-sm">Invoice</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
