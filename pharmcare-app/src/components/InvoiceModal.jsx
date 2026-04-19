import { useState } from 'react'

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
            /* Prevent grid and table rows from being cut */
            div[style*="grid"], tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            /* Ensure the totals section never gets split from the table */
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

  return (
    <div className="modal-overlay" style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
      <div className="modal-content fade-up" style={{ background:'white', width:'100%', maxWidth:540, borderRadius:16, overflow:'hidden', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Top Navbar (UI Only) */}
        <div style={{ padding:'16px 24px', background:'#f8f9fa', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee' }} className="no-print">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="material-icons" style={{ color:'#00288e' }}>receipt</span>
            <span style={{ fontWeight:700, color:'#1a1c1e' }}>Invoice Preview</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#666', display:'flex', alignItems:'center' }}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Invoice Body (The Printable Part) */}
        <div id="printable-invoice" style={{ padding:'40px 48px', background:'white', color:'#1a1c1e', width:'100%' }}>
          
          {/* Header Section */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:40 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, color:'#00288e', marginBottom:12 }}>
                <span className="material-icons" style={{ fontSize:32 }}>medical_services</span>
                <span style={{ fontSize:'1.75rem', fontWeight:900, letterSpacing:'-0.04em' }}>PharMCare</span>
              </div>
              <div style={{ fontSize:'0.875rem', color:'#444', lineHeight:1.6 }}>
                <strong>{order.pharmacy?.name || 'Dhanmondi Branch'}</strong><br />
                {order.pharmacy?.address || 'House 12, Road 5, Dhanmondi'}<br />
                Dhaka, Bangladesh<br />
                P: {order.pharmacy?.contactPhone || '+880 1711-111111'}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <h1 style={{ fontSize:'2.5rem', margin:0, fontWeight:900, color:'#eee', letterSpacing:'-0.02em', lineHeight:0.8 }}>INVOICE</h1>
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:'0.8125rem', fontWeight:700, color:'#666', textTransform:'uppercase' }}>Receipt #</div>
                <div style={{ fontSize:'1.125rem', fontWeight:800, color:'#1a1c1e' }}>{order._id?.slice(-8).toUpperCase()}</div>
                <div style={{ fontSize:'0.875rem', color:'#666', marginTop:4 }}>{new Date(order.createdAt).toLocaleDateString('en-GB')}</div>
              </div>
            </div>
          </div>

          <div style={{ height:'1px', background:'#eee', width:'100%', marginBottom:32 }}></div>

          {/* Billing Info */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:40 }}>
            <div>
              <div style={{ fontSize:'0.75rem', fontWeight:800, color:'#999', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Billed To</div>
              <div style={{ fontWeight:800, fontSize:'1rem', color:'#1a1c1e' }}>{order.customer?.name || 'Walk-in Customer'}</div>
              <div style={{ fontSize:'0.875rem', color:'#666' }}>{order.customer?.email || 'N/A'}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'0.75rem', fontWeight:800, color:'#999', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Payment Details</div>
              <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#1a1c1e' }}>Method: {order.paymentMethod || 'Cash'}</div>
              <div style={{ fontSize:'0.875rem', color:'#666' }}>Status: PAID</div>
            </div>
          </div>

          {/* Table with strict alignment */}
          <div style={{ width:'100%', marginBottom:40 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 60px 100px 100px', padding:'12px 0', borderBottom:'2px solid #1a1c1e', fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', color:'#999' }}>
              <div>Item Description</div>
              <div style={{ textAlign:'center' }}>Qty</div>
              <div style={{ textAlign:'right' }}>Price</div>
              <div style={{ textAlign:'right' }}>Total</div>
            </div>
            
            {order.medicines.map((item, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 60px 100px 100px', padding:'16px 0', borderBottom:'1px solid #f0f0f0', fontSize:'0.9375rem', alignItems:'center' }}>
                <div style={{ fontWeight:700, color:'#1a1c1e' }}>{item.medicine?.name || 'Medicine'}</div>
                <div style={{ textAlign:'center', color:'#444' }}>{item.quantity}</div>
                <div style={{ textAlign:'right', color:'#444' }}>৳{item.price.toLocaleString('en-IN')}</div>
                <div style={{ textAlign:'right', fontWeight:800, color:'#1a1c1e' }}>৳{(item.price * item.quantity).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

          {/* Footer Totals */}
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <div style={{ width:240 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'0.9375rem', color:'#666' }}>
                <span>Subtotal</span>
                <span>৳{(order.totalAmount / 1.08).toLocaleString('en-IN', { maximumFractionDigits:2 })}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'0.9375rem', color:'#666' }}>
                <span>Tax (VAT 8%)</span>
                <span>৳{(order.totalAmount - (order.totalAmount / 1.08)).toLocaleString('en-IN', { maximumFractionDigits:2 })}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 0', borderTop:'2px solid #00288e', marginTop:12, fontSize:'1.5rem', fontWeight:900, color:'#00288e' }}>
                <span>Total</span>
                <span>৳{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop:'1px solid #eee', marginTop:60, paddingTop:24, textAlign:'center' }}>
            <div style={{ fontSize:'0.875rem', fontWeight:700, color:'#1a1c1e', marginBottom:4 }}>Thank you for your trust!</div>
            <div style={{ fontSize:'0.75rem', color:'#999' }}>This is a computer-generated digital receipt. No signature required.</div>
          </div>
        </div>

        {/* Action Buttons (UI Only) */}
        <div style={{ padding:'20px 24px', background:'#f8f9fa', display:'flex', gap:12, justifyContent:'flex-end', borderTop:'1px solid #eee' }} className="no-print">
          <button 
            onClick={onClose}
            style={{ padding:'10px 20px', background:'white', border:'1px solid #ddd', borderRadius:8, fontWeight:600, cursor:'pointer' }}
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 24px', background:'#00288e', color:'white', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(0,40,142,0.2)' }}
          >
            <span className="material-icons" style={{ fontSize:18 }}>print</span>
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
