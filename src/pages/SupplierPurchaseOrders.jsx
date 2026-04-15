import { useState } from 'react'

const orders = [
  { id: 'PO-2024-088', pharmacy: 'Aura — Dhanmondi', items: 'Paracetamol 500mg ×500, Ibuprofen 400mg ×200', value: '৳2,450', date: 'Apr 6, 2026', dueDate: 'Apr 9, 2026', status: 'Delivered', priority: 'Standard' },
  { id: 'PO-2024-082', pharmacy: 'MedCenter — Uttara', items: 'Amoxicillin 500mg ×300, Metformin 850mg ×400', value: '৳3,820', date: 'Apr 4, 2026', dueDate: 'Apr 8, 2026', status: 'In Transit', priority: 'Urgent' },
  { id: 'PO-2024-075', pharmacy: 'CityPharm — Banani', items: 'Atorvastatin 40mg ×200', value: '৳1,640', date: 'Apr 1, 2026', dueDate: 'Apr 7, 2026', status: 'Processing', priority: 'Standard' },
  { id: 'PO-2024-071', pharmacy: 'Aura — Chattogram', items: 'Cetirizine 10mg ×500, Omeprazole ×300', value: '৳4,200', date: 'Mar 28, 2026', dueDate: 'Apr 4, 2026', status: 'Delivered', priority: 'Standard' },
  { id: 'PO-2024-066', pharmacy: 'HealthCare Plus — Sylhet', items: 'Lisinopril 10mg ×400, Vitamin D ×200', value: '৳2,980', date: 'Mar 25, 2026', dueDate: 'Mar 30, 2026', status: 'Delivered', priority: 'Urgent' },
]

const statusBadge = { Delivered: 'badge-success', 'In Transit': 'badge-info', Processing: 'badge-warning' }
const priorityBadge = { Urgent: 'badge-error', Standard: 'badge-neutral' }
const nextStatus = { Processing: 'In Transit', 'In Transit': 'Delivered', Delivered: 'Delivered' }

export default function SupplierPurchaseOrders() {
  const [filter, setFilter] = useState('All')
  const [orderList, setOrderList] = useState(orders)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ pharmacy: '', items: '', value: '', priority: 'Standard' })

  const filtered = filter === 'All' ? orderList : orderList.filter(o => o.status === filter)

  const handleUpdate = (id) => {
    setOrderList(prev => prev.map(o =>
      o.id === id ? { ...o, status: nextStatus[o.status] || o.status } : o
    ))
  }

  const handleInvoice = (o) => {
    alert(`Invoice for ${o.id}\nPharmacy: ${o.pharmacy}\nItems: ${o.items}\nValue: ${o.value}\nStatus: ${o.status}`)
  }

  const handleCreateOrder = (e) => {
    e.preventDefault()
    const newOrder = {
      id: `PO-2024-${String(orderList.length + 89).padStart(3, '0')}`,
      pharmacy: form.pharmacy,
      items: form.items,
      value: form.value,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priority: form.priority,
      status: 'Processing'
    }
    setOrderList(prev => [newOrder, ...prev])
    setShowModal(false)
    setForm({ pharmacy: '', items: '', value: '', priority: 'Standard' })
    alert(`Purchase order ${newOrder.id} created successfully!`)
  }

  return (
    <>
      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 className="page-title">Purchase Orders</h1>
            <p className="page-subtitle">MediSupply Ltd. · {orderList.length} orders this month</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <span className="material-icons" style={{ fontSize: 18 }}>add</span> Create Order
          </button>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Orders', val: orderList.length, icon: 'receipt_long', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
            { label: 'In Transit', val: orderList.filter(o => o.status === 'In Transit').length, icon: 'local_shipping', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
            { label: 'Processing', val: orderList.filter(o => o.status === 'Processing').length, icon: 'pending', bg: 'var(--tertiary-fixed)', ic: 'var(--tertiary-container)' },
            { label: 'Total Value (MTD)', val: '৳15,090', icon: 'payments', bg: 'var(--secondary-fixed)', ic: 'var(--secondary)' },
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
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={o.status === 'Delivered'}
                          onClick={() => handleUpdate(o.id)}
                        >Update</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleInvoice(o)}>Invoice</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="section-header">
              <h2 className="section-title">Create Purchase Order</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="login-form" style={{ marginTop: 20 }}>
              <div className="input-group">
                <label className="input-label">Client Pharmacy</label>
                <input className="input" required placeholder="e.g. Aura — Dhanmondi" value={form.pharmacy} onChange={e => setForm({ ...form, pharmacy: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Items (description)</label>
                <input className="input" required placeholder="e.g. Paracetamol 500mg ×500" value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} />
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="input-group">
                  <label className="input-label">Order Value (৳)</label>
                  <input className="input" required placeholder="৳2,500" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
