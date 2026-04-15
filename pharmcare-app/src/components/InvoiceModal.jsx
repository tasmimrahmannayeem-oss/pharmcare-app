import { useState } from 'react'

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-overlay" style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
      <div className="modal-content fade-up" style={{ background:'white', width:'100%', maxWidth:500, borderRadius:16, overflow:'hidden', boxShadow:'0 20px 40px rgba(0,0,0,0.2)' }}>
        
        {/* Header - Not printed */}
        <div style={{ padding:'20px 24px', background:'var(--surface-low)', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--outline-variant)' }} className="no-print">
          <h2 style={{ fontSize:'1.25rem', fontWeight:800 }}>Digital Invoice</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Invoice Body - The Printable Part */}
        <div id="printable-invoice" style={{ padding:40, fontFamily:'Inter, sans-serif', color:'#1a1c1e' }}>
          
          {/* Pharmacy Branding */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--primary-container)', marginBottom:8 }}>
                <span className="material-icons" style={{ fontSize:32 }}>medical_services</span>
                <span style={{ fontSize:'1.5rem', fontWeight:900, letterSpacing:'-0.03em' }}>PharMCare</span>
              </div>
              <div style={{ fontSize:'0.875rem', lineHeight:1.5 }}>
                {order.pharmacy?.name || 'Local Branch'}<br />
                {order.pharmacy?.address || 'House 12, Road 5, Dhanmondi'}<br />
                Dhaka, Bangladesh<br />
                P: {order.pharmacy?.contactPhone || '+880 1711-000000'}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--primary-container)', marginBottom:4 }}>INVOICE</div>
              <div style={{ fontSize:'0.875rem', fontWeight:600 }}>#{order._id?.slice(-8).toUpperCase()}</div>
              <div style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)', marginTop:4 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Billed To</div>
            <div style={{ fontWeight:700, fontSize:'1rem' }}>{order.customer?.name || 'Walk-in Customer'}</div>
            <div style={{ fontSize:'0.875rem' }}>{order.customer?.email || 'N/A'}</div>
          </div>

          {/* Items Table */}
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:32 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #000', textAlign:'left' }}>
                <th style={{ padding:'12px 0', fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase' }}>Item Description</th>
                <th style={{ padding:'12px 0', fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', textAlign:'center' }}>Qty</th>
                <th style={{ padding:'12px 0', fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', textAlign:'right' }}>Price</th>
                <th style={{ padding:'12px 0', fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', textAlign:'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.medicines.map((item, i) => (
                <tr key={i} style={{ borderBottom:'1px solid #eee' }}>
                  <td style={{ padding:'12px 0', fontSize:'0.875rem' }}>
                    <div style={{ fontWeight:700 }}>{item.medicine?.name || 'Medicine'}</div>
                  </td>
                  <td style={{ padding:'12px 0', fontSize:'0.875rem', textAlign:'center' }}>{item.quantity}</td>
                  <td style={{ padding:'12px 0', fontSize:'0.875rem', textAlign:'right' }}>৳{item.price.toLocaleString('en-IN')}</td>
                  <td style={{ padding:'12px 0', fontSize:'0.875rem', fontWeight:700, textAlign:'right' }}>৳{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <div style={{ width:200 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:'0.875rem' }}>
                <span>Subtotal</span>
                <span>৳{(order.totalAmount / 1.08).toLocaleString('en-IN', { maximumFractionDigits:2 })}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:'0.875rem' }}>
                <span>VAT (8%)</span>
                <span>৳{(order.totalAmount - (order.totalAmount / 1.08)).toLocaleString('en-IN', { maximumFractionDigits:2 })}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'2px solid #000', marginTop:8, fontSize:'1.125rem', fontWeight:900 }}>
                <span>Total</span>
                <span style={{ color:'var(--primary-container)' }}>৳{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop:'1px solid #eee', marginTop:40, paddingTop:20, textAlign:'center', fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>
            Thank you for choosing PharMCare. This is a computer-generated invoice.
          </div>
        </div>

        {/* Footer actions - Not printed */}
        <div style={{ padding:'16px 24px', background:'var(--surface-low)', display:'flex', gap:12, justifyContent:'flex-end' }} className="no-print">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <span className="material-icons">print</span>
            Print Invoice
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}
