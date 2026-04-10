import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { setRole } = useRole()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'customer' })

  const handleSubmit = e => {
    e.preventDefault()
    setRole(form.role)
    const dest = { 
      superadmin: '/superadmin', 
      owner: '/admin', 
      pharmacist: '/prescriptions', 
      assistant: '/pos', 
      customer: '/home', 
      supplier: '/supplier/dashboard' 
    }
    navigate(dest[form.role] || '/home')
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-panel-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <span className="material-icons">medication</span>
          </div>
          <div>
            <div className="login-brand-name">SPMIS</div>
            <div className="login-brand-tag">Smart Pharmacy Management Information System</div>
          </div>
        </div>

        <div className="login-hero">
          <h1 className="login-hero-title">Optimizing Pharmacy Intelligence</h1>
          <p className="login-hero-sub">
            The Clinical Curator for modern healthcare management. Seamlessly manage inventory, orders, and clinical data in one secure environment.
          </p>
          <blockquote className="login-quote">
            "Precision in every dose, clarity in every report."
          </blockquote>
        </div>

        <div className="login-features">
          {[
            { icon: 'inventory_2', text: 'Real-time Inventory Tracking' },
            { icon: 'description', text: 'Digital Prescription Management' },
            { icon: 'analytics', text: 'Sales & Compliance Analytics' },
            { icon: 'shield', text: 'HIPAA-Compliant & Secure' },
          ].map(f => (
            <div className="login-feature-item" key={f.text}>
              <span className="material-icons" style={{ color: 'var(--secondary-fixed)', fontSize: 20 }}>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="login-panel-right">
        <div className="login-card">
          <div className="login-card-logo">
            <div className="login-brand-icon sm">
              <span className="material-icons">medication</span>
            </div>
            <span className="login-brand-name sm">SPMIS</span>
          </div>

          {/* Tabs */}
          <div className="login-tabs">
            <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {tab === 'register' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-icon-wrap">
                  <span className="material-icons icon">badge</span>
                  <input className="input" placeholder="Dr. Jane Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-icon-wrap">
                <span className="material-icons icon">email</span>
                <input className="input" type="email" placeholder="you@pharmcare.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-icon-wrap">
                <span className="material-icons icon">lock</span>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
            </div>

            {/* Role selector */}
            <div className="input-group">
              <label className="input-label">Access Role</label>
              <div className="role-select-grid">
                {[
                  { key: 'customer', icon: 'person', label: 'Customer' },
                  { key: 'assistant', icon: 'storefront', label: 'Assistant' },
                  { key: 'pharmacist', icon: 'medical_services', label: 'Pharmacist' },
                  { key: 'owner', icon: 'admin_panel_settings', label: 'Owner' },
                  { key: 'supplier', icon: 'local_shipping', label: 'Supplier' },
                  { key: 'superadmin', icon: 'supervisor_account', label: 'Super Admin' },
                ].map(r => (
                  <button
                    type="button"
                    key={r.key}
                    className={`role-chip ${form.role === r.key ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, role: r.key }))}
                  >
                    <span className="material-icons" style={{ fontSize: 16 }}>{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

          {tab === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <button 
                type="button" 
                className="btn btn-ghost" 
                style={{ padding: '4px 0', fontSize: '0.875rem' }}
                onClick={() => alert("Forgot password functionality will be implemented soon.")}
              >
                Forgot Password?
              </button>
            </div>
          )}

            <button type="submit" className="btn btn-primary w-full btn-lg" style={{ marginTop: 8 }}>
              <span className="material-icons">login</span>
              {tab === 'login' ? 'Sign In to SPMIS' : 'Create Account'}
            </button>
          </form>

          <p className="login-footer-text">
            {tab === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button className="btn-ghost" style={{ padding: 0, fontWeight: 600, color: 'var(--primary-container)', fontSize: 'inherit' }} onClick={() => setTab(tab === 'login' ? 'register' : 'login')}>
              {tab === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>

          <p className="login-disclaimer">
            By continuing, you agree to our Terms of Service and Privacy Policy. SPMIS is HIPAA-compliant.
          </p>
        </div>
      </div>
    </div>
  )
}
