import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { setRole } = useRole()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'customer' })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSandbox, setIsSandbox] = useState(false)

  const roleMap = {
    superadmin: 'Super Admin',
    owner: 'Pharmacy Owner',
    pharmacist: 'Pharmacist',
    assistant: 'Store Assistant',
    customer: 'Customer',
    supplier: 'Supplier'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (tab === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        })
        const data = await res.json()
        
        if (res.ok) {
          localStorage.setItem('token', data.token)
          const backToFrontRole = Object.keys(roleMap).find(key => roleMap[key] === data.role) || 'customer'
          const userWithToken = { ...data, token: data.token }
          setRole(backToFrontRole, userWithToken)
          
          const dest = { 
            superadmin: '/superadmin', owner: '/admin', pharmacist: '/prescriptions', 
            assistant: '/pos', customer: '/home', supplier: '/supplier/dashboard' 
          }
          navigate(dest[backToFrontRole] || '/home')
        } else {
          if (data.message?.includes('ETIMEDOUT') || data.message?.includes('ECONNREFUSED') || data.message?.includes('querySrv')) {
            console.warn('Database connection failed, falling back to Sandbox Mode:', data.message);
            throw new Error('Database connection failed');
          }
          setError(data.message || 'Login failed')
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: roleMap[form.role]
          })
        })
        const data = await res.json()
        
        if (res.ok) {
          if (data.token) {
            localStorage.setItem('token', data.token)
            setRole(form.role)
            navigate('/home')
          } else {
            alert(data.message)
            setTab('login')
          }
        } else {
          setError(data.message || 'Registration failed')
        }
      }
    } catch (err) {
      console.error('Backend connection failed, returning simulated UI login:', err)
      setIsSandbox(true)
      
      let simRole = 'customer'
      if (form.email.includes('admin')) simRole = 'superadmin'
      else if (form.email.includes('owner')) simRole = 'owner'
      else if (form.email.includes('pharm')) simRole = 'pharmacist'
      else if (form.email.includes('supp')) simRole = 'supplier'
      
      setRole(simRole, { 
        name: form.name || 'Demo User',
        email: form.email,
        role: simRole,
        assignedPharmacy: null
      })
      const dest = { superadmin: '/superadmin', owner: '/admin', pharmacist: '/prescriptions', assistant: '/pos', customer: '/home', supplier: '/supplier/dashboard' }
      
      setTimeout(() => navigate(dest[simRole] || '/home'), 100)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-panel-left">
        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="particle" style={{
              width: Math.random() * 8 + 2 + 'px',
              height: Math.random() * 8 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDuration: Math.random() * 10 + 15 + 's',
              animationDelay: Math.random() * 5 + 's'
            }} />
          ))}
        </div>

        <div className="login-brand">
          <div className="login-brand-icon">
            <span className="material-icons">medication</span>
          </div>
          <div>
            <div className="login-brand-name">SPMIS</div>
            <div className="login-brand-tag">Pharmacy Management System</div>
          </div>
        </div>

        <div className="login-hero">
          <h1 className="login-hero-title">Optimizing <br/>Pharmacy Intelligence</h1>
          <p className="login-hero-sub">
            The Clinical Curator for modern healthcare management. Seamlessly manage inventory, orders, and clinical data.
          </p>
          <div className="login-quote typewriter-tag">
            "Precision in every dose, clarity in every report."
          </div>
        </div>

        <div className="login-features">
          {[
            { icon: 'inventory_2', text: 'Real-time Inventory Tracking' },
            { icon: 'description', text: 'Digital Prescription Management' },
            { icon: 'analytics', text: 'Sales & Compliance Analytics' },
          ].map(f => (
            <div className="login-feature-item" key={f.text}>
              <span className="material-icons">{f.icon}</span>
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
            <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => {
              setTab('register');
              if (['superadmin', 'owner', 'assistant'].includes(form.role)) {
                setForm(p => ({ ...p, role: 'customer' }));
              }
            }}>Register</button>
          </div>

          {tab === 'register' && (
            <div className="tab-pane" style={{ background: 'var(--primary-fixed)', color: 'var(--primary-container)', padding: '12px 14px', borderRadius: 8, fontSize: '0.8125rem', display: 'flex', alignItems: 'flex-start', gap: 10, border: '1px solid var(--primary-fixed-dim)' }}>
              <span className="material-icons" style={{ fontSize: 18, marginTop: 2 }}>info</span>
              <div>
                <strong>Want to register your Pharmacy?</strong><br/>
                Please contact our team at <a href="mailto:admin@spmis.com" style={{fontWeight: 700, textDecoration: 'underline'}}>admin@spmis.com</a> to set up your business account.
              </div>
            </div>
          )}

          {isSandbox && (
            <div className="error-shake" style={{ background: '#fff3e0', color: '#e65100', padding: '10px 14px', borderRadius: 8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #ffe0b2' }}>
              <span className="material-icons" style={{ fontSize: 18 }}>science</span>
              <div><strong>Sandbox Mode:</strong> Backend server offline. Using simulated credentials.</div>
            </div>
          )}

          {error && (
            <div className="error-shake" style={{ background: '#fce4e4', color: '#c62828', padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form tab-pane" key={tab}>
            {tab === 'register' && (
              <div className={`floating-group ${form.name ? 'has-value' : ''}`}>
                <input id="name" className="floating-input" type="text" placeholder=" " value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <span className="material-icons floating-icon">badge</span>
                <label className="floating-label" htmlFor="name">Full Name</label>
              </div>
            )}

            <div className={`floating-group ${form.email ? 'has-value' : ''}`}>
              <input id="email" className="floating-input" type="email" placeholder=" " value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <span className="material-icons floating-icon">email</span>
              <label className="floating-label" htmlFor="email">Email Address</label>
            </div>

            <div className={`floating-group ${form.password ? 'has-value' : ''}`}>
              <input id="password" className="floating-input" type={showPassword ? 'text' : 'password'} placeholder=" " value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              <span className="material-icons floating-icon">lock</span>
              <label className="floating-label" htmlFor="password">Password</label>
              <button type="button" tabIndex="-1" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <span className="material-icons">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            {/* Role selector */}
            <div className="role-select-box">
              <label className="role-label-text">Access Role</label>
              <div className="role-select-grid">
                {[
                  { key: 'customer', icon: 'person', label: 'Customer' },
                  { key: 'assistant', icon: 'storefront', label: 'Assistant' },
                  { key: 'pharmacist', icon: 'medical_services', label: 'Pharmacist' },
                  { key: 'owner', icon: 'admin_panel_settings', label: 'Owner' },
                  { key: 'supplier', icon: 'local_shipping', label: 'Supplier' },
                  { key: 'superadmin', icon: 'supervisor_account', label: 'Super Admin' },
                ].filter(r => tab === 'login' ? true : !['superadmin', 'owner', 'assistant'].includes(r.key))
                .map(r => (
                  <button
                    type="button"
                    key={r.key}
                    className={`role-chip ${form.role === r.key ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, role: r.key }))}
                  >
                    <span className="material-icons">{r.icon}</span>
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

            <button type="submit" className="btn-cta" disabled={loading}>
              <span className={`material-icons ${loading ? 'spinner' : ''}`}>{loading ? 'sync' : 'login'}</span>
              {loading ? 'Authenticating...' : (tab === 'login' ? 'Sign In to SPMIS' : 'Create Account')}
            </button>
          </form>

          <div>
            <p className="login-footer-text" style={{ marginBottom: 12 }}>
              {tab === 'login' ? "Don't have an account? " : 'Already registered? '}
              <button className="btn-ghost" style={{ padding: 0, fontWeight: 600, color: 'var(--primary-container)', fontSize: 'inherit' }} onClick={() => setTab(tab === 'login' ? 'register' : 'login')}>
                {tab === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
            <p className="login-disclaimer">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
