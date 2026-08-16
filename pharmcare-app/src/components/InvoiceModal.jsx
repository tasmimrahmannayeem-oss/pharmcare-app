import { createPortal } from 'react-dom'

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null

  const handlePrint = () => {
    // Create a hidden iframe for clean printing without affecting the main UI
    const printWindow = window.open('', '_blank', 'width=800,height=900')
    const invoiceHtml = document.getElementById('printable-invoice').outerHTML
    
    // Get all system styles to ensure the invoice looks right in the print window
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order._id?.slice(-8).toUpperCase()}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 16mm 14mm;
            }
            * { box-sizing: border-box; }
            html, body {
              width: 210mm;
              background: white !important;
              color: #1a1c1e;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { padding: 0; margin: 0; }
            #printable-invoice {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            div[style*="grid"], tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            #printable-invoice > div:last-child {
              page-break-before: auto;
              break-before: auto;
            }
          </style>
        </head>
        <body>
          ${invoiceHtml}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 600);
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const subtotal = order.totalAmount ? (order.totalAmount / 1.08) : 0
  const tax = order.totalAmount ? (order.totalAmount - subtotal) : 0

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 999999 }}>
      <div 
        className="modal-content fade-up" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          background: 'white', 
          width: '100%', 
          maxWidth: 580, 
          borderRadius: 16, 
          padding: 0, 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          margin: 'auto'
        }}
      >
        {/* Top Navbar Header (UI Only) */}
        <div style={{ padding: '14px 20px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ color: 'var(--primary-container)', fontSize: 20 }}>receipt_long</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Invoice Preview</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
          >
            <span className="material-icons" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Scrollable Invoice Body (The Printable Part) */}
        <div 
          id="printable-invoice" 
          style={{ 
            padding: '28px 32px', 
            background: 'white', 
            color: '#0f172a', 
            overflowY: 'auto',
            flex: 1
          }}
        >
          {/* Header Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-container)', marginBottom: 8 }}>
                <span className="material-icons" style={{ fontSize: 26, color: 'var(--primary-container)' }}>medication</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--primary-container)' }}>PharMCare</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                <strong style={{ color: '#0f172a' }}>{order.pharmacy?.name || 'PharMCare Pharmacy'}</strong><br />
                {order.pharmacy?.address || order.pharmacy?.location || 'Dhaka, Bangladesh'}<br />
                P: {order.pharmacy?.contactPhone || '+880 1711-000000'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', color: '#475569' }}>
                RECEIPT
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  #{order._id?.slice(-8).toUpperCase()}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#e2e8f0', width: '100%', marginBottom: 20 }}></div>

          {/* Billing Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, background: '#f8fafc', padding: '12px 16px', borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Billed To</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{order.customerName || order.customer?.name || 'Customer'}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{order.customer?.email || ''}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Payment Details</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Method: {order.paymentMethod || 'Cash on Delivery'}</div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Status: {order.paymentStatus || 'PAID'}</div>
            </div>
          </div>

          {/* Table */}
          <div style={{ width: '100%', marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 85px 85px', padding: '8px 0', borderBottom: '2px solid #0f172a', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
              <div>Item Description</div>
              <div style={{ textAlign: 'center' }}>Qty</div>
              <div style={{ textAlign: 'right' }}>Price</div>
              <div style={{ textAlign: 'right' }}>Total</div>
            </div>
            
            {Array.isArray(order.medicines) && order.medicines.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 85px 85px', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.medicine?.name || 'Medicine'}</div>
                <div style={{ textAlign: 'center', color: '#475569' }}>{item.quantity}</div>
                <div style={{ textAlign: 'right', color: '#475569' }}>৳{(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>৳{((item.price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                <span>Tax (VAT 8%)</span>
                <span>৳{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0 0', borderTop: '2px solid var(--primary-container)', marginTop: 4, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-container)' }}>
                <span>Total</span>
                <span>৳{(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>Thank you for choosing SPMIS!</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>This is an official computer-generated digital receipt. No signature required.</div>
          </div>
        </div>

        {/* Action Buttons Footer (UI Only) */}
        <div style={{ padding: '14px 20px', background: '#f8fafc', display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ fontWeight: 600, padding: '8px 16px', borderRadius: 8 }}
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, padding: '8px 18px', borderRadius: 8 }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>print</span>
            Print Invoice
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
