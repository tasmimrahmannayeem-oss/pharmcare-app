import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { setRole } = useRole()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'customer', otp: '', newPassword: '' })

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

  // Auto-redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('userRole')
    if (token && savedRole) {
      const dest = {
        superadmin: '/superadmin',
        owner: '/admin',
        pharmacist: '/prescriptions',
        assistant: '/pos',
        customer: '/home',
        supplier: '/supplier/dashboard'
      }
      const lower = savedRole.toLowerCase()
      const normalized = lower.includes('owner') ? 'owner' :
                         lower.includes('pharmacist') ? 'pharmacist' :
                         lower.includes('assistant') ? 'assistant' :
                         lower.includes('admin') ? 'superadmin' :
                         lower.includes('supplier') ? 'supplier' : 'customer'
      navigate(dest[normalized] || '/home', { replace: true })
    }
  }, [navigate])



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
      } else if (tab === 'register') {
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
            const backToFrontRole = Object.keys(roleMap).find(key => roleMap[key] === data.role) || 'customer'
            setRole(backToFrontRole, { ...data, token: data.token })
            navigate('/home')
          } else {
            alert(data.message)
            setTab('login')
          }
        } else {
          setError(data.message || 'Registration failed')
        }
      } else if (tab === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email })
        })
        const data = await res.json()
        if (res.ok) {
          alert('OTP has been sent to your email (simulated in console).')
          setTab('reset')
        } else {
          setError(data.message || 'Failed to send OTP')
        }
      } else if (tab === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, otp: form.otp, newPassword: form.newPassword })
        })
        const data = await res.json()
        if (res.ok) {
          alert('Password successfully reset. You can now login.')
          setTab('login')
        } else {
          setError(data.message || 'Failed to reset password')
        }
      }
    } catch (err) {
      console.error('Backend connection failed, returning simulated UI login:', err)
      setIsSandbox(true)

      let simRole = form.role || 'customer'
      if (form.email.includes('admin')) simRole = 'superadmin'
      else if (form.email.includes('owner')) simRole = 'owner'
      else if (form.email.includes('pharm')) simRole = 'pharmacist'
      else if (form.email.includes('supp')) simRole = 'supplier'

      setRole(simRole, {
        name: form.name || 'Demo User',
        email: form.email || `${simRole}@spmis.com`,
        role: roleMap[simRole] || 'Customer',
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
      {/* Subtle Background Glow */}
      <div className="login-backdrop-glow"></div>

      {/* Left Hero Panel */}
      <div className="login-panel-left">
        {/* Floating Particles Effect */}
        <div className="particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                width: `${(i % 5) * 2 + 3}px`,
                height: `${(i % 5) * 2 + 3}px`,
                left: `${(i * 17) % 95}%`,
                top: `${(i * 23) % 95}%`,
                animationDuration: `${(i % 4) * 4 + 14}s`,
                animationDelay: `${(i % 5) * 1.5}s`
              }} 
            />
          ))}
        </div>

        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <span className="material-icons">medication</span>
          </div>
          <div>
            <div className="login-brand-name">SPMIS</div>
            <div className="login-brand-tag">Smart Pharmacy Management And Information System</div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="login-hero">
          <div className="hero-pill">
            <span className="hero-pill-dot"></span>
            <span>Pharmacy Management Platform</span>
          </div>

          <h1 className="login-hero-title">
            প্রযুক্তির ছোঁয়ায়, <br />
            <span>ফার্মেসীর উন্নয়ন</span>
          </h1>

          <p className="login-hero-sub">
            ফার্মেসী ব্যবস্থাপনা কি জটিল মনে হচ্ছে? এখন নয়।<br />
            ইনভেন্টরি, অর্ডার ও ক্লিনিক্যাল তথ্য— সবকিছু একসাথে, সহজ নিয়ন্ত্রণে।
          </p>

          <div className="login-quote">
            "Precision in every dose, clarity in every report."
          </div>
        </div>

        {/* Features Row */}
        <div className="login-features">
          {[
            { icon: 'inventory_2', title: 'Real-time Inventory Tracking', desc: 'Automatic stock & batch updates' },
            { icon: 'description', title: 'Digital Prescription Management', desc: 'Pharmacist review & verification' },
            { icon: 'analytics', title: 'Sales & Compliance Analytics', desc: 'Real-time revenue & audit reports' },
          ].map(f => (
            <div className="login-feature-item" key={f.title}>
              <div className="feature-item-icon">
                <span className="material-icons">{f.icon}</span>
              </div>
              <div className="feature-item-text">
                <div className="feature-item-title">{f.title}</div>
                <div className="feature-item-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-panel-right">
        {/* Pharmacy Themed Watermark Background */}
        <div className="pharmacy-bg-watermarks">
          <span className="material-icons wm-icon wm-1">local_pharmacy</span>
          <span className="material-icons wm-icon wm-2">medication</span>
          <span className="material-icons wm-icon wm-3">medical_services</span>
          <span className="material-icons wm-icon wm-4">vaccines</span>
          <span className="material-icons wm-icon wm-5">health_and_safety</span>
          <span className="material-icons wm-icon wm-6">healing</span>
          <svg className="wm-ecg-line" viewBox="0 0 500 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50 L120 50 L140 20 L160 80 L180 30 L200 65 L215 50 L500 50" stroke="rgba(37, 99, 235, 0.09)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-logo">
              <div className="login-brand-icon sm">
                <span className="material-icons">medication</span>
              </div>
              <span className="login-brand-name sm">SPMIS</span>
            </div>

            {/* Tabs */}
            <div className="login-tabs">
              <button 
                type="button" 
                className={`login-tab ${tab === 'login' ? 'active' : ''}`} 
                onClick={() => { setTab('login'); setError(''); }}
              >
                Sign In
              </button>
              <button 
                type="button" 
                className={`login-tab ${tab === 'register' ? 'active' : ''}`} 
                onClick={() => {
                  setTab('register');
                  setError('');
                  if (['superadmin', 'owner', 'assistant'].includes(form.role)) {
                    setForm(p => ({ ...p, role: 'customer' }));
                  }
                }}
              >
                Register
              </button>
            </div>
          </div>



          {tab === 'register' && (
            <div className="tab-notice info">
              <span className="material-icons">info</span>
              <div>
                <strong>Want to register your Pharmacy?</strong><br />
                Contact us at <a href="mailto:admin@spmis.com">admin@spmis.com</a> to onboard your branch.
              </div>
            </div>
          )}

          {isSandbox && (
            <div className="tab-notice warning">
              <span className="material-icons">science</span>
              <div><strong>Sandbox Mode:</strong> Server offline. Using simulated test credentials.</div>
            </div>
          )}

          {error && (
            <div className="tab-notice error">
              <span className="material-icons">error</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" key={tab}>
            {tab === 'register' && (
              <div className="input-field-group">
                <label className="field-label" htmlFor="name">Full Name</label>
                <div className="field-control">
                  <span className="material-icons field-icon">badge</span>
                  <input 
                    id="name" 
                    className="field-input" 
                    type="text" 
                    placeholder="Enter your full name" 
                    required
                    value={form.name} 
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                  />
                </div>
              </div>
            )}

            <div className="input-field-group">
              <label className="field-label" htmlFor="email">Email Address</label>
              <div className="field-control">
                <span className="material-icons field-icon">email</span>
                <input 
                  id="email" 
                  className="field-input" 
                  type="email" 
                  placeholder="Enter your email" 
                  required
                  value={form.email} 
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-control">
                <span className="material-icons field-icon">lock</span>
                <input 
                  id="password" 
                  className="field-input" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter your password" 
                  required
                  value={form.password} 
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
                />
                <button 
                  type="button" 
                  tabIndex="-1" 
                  className="field-toggle-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-icons">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Role selector */}
            {(tab === 'login' || tab === 'register') && (
              <div className="role-select-box">
                <label className="role-label-text">Select Role</label>
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
                        <span>{r.label}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '2px 0', fontSize: '0.8125rem', color: 'var(--primary-container)' }}
                  onClick={() => setTab('forgot')}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {tab === 'reset' && (
              <>
                <div className="input-field-group">
                  <label className="field-label" htmlFor="otp">OTP Code</label>
                  <div className="field-control">
                    <span className="material-icons field-icon">vpn_key</span>
                    <input 
                      id="otp" 
                      className="field-input" 
                      type="text" 
                      placeholder="Enter 6-digit OTP" 
                      value={form.otp} 
                      onChange={e => setForm(p => ({ ...p, otp: e.target.value }))} 
                    />
                  </div>
                </div>
                <div className="input-field-group">
                  <label className="field-label" htmlFor="newPassword">New Password</label>
                  <div className="field-control">
                    <span className="material-icons field-icon">lock_reset</span>
                    <input 
                      id="newPassword" 
                      className="field-input" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Enter new password" 
                      value={form.newPassword} 
                      onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} 
                    />
                    <button 
                      type="button" 
                      tabIndex="-1" 
                      className="field-toggle-btn" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-icons">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn-cta" disabled={loading}>
              <span className={`material-icons ${loading ? 'spinner' : ''}`}>
                {loading ? 'sync' : (tab === 'forgot' ? 'send' : (tab === 'reset' ? 'lock_reset' : 'arrow_forward'))}
              </span>
              <span>
                {loading ? 'Processing...' : (tab === 'login' ? 'Sign In to SPMIS' : (tab === 'register' ? 'Create Account' : (tab === 'forgot' ? 'Send OTP' : 'Reset Password')))}
              </span>
            </button>
          </form>

          <div className="login-card-footer">
            <p className="login-footer-text">
              {(tab === 'login' || tab === 'forgot' || tab === 'reset') ? "Don't have an account? " : 'Already registered? '}
              <button 
                type="button"
                className="login-footer-link" 
                onClick={() => setTab((tab === 'login' || tab === 'forgot' || tab === 'reset') ? 'register' : 'login')}
              >
                {(tab === 'login' || tab === 'forgot' || tab === 'reset') ? 'Register' : 'Sign In'}
              </button>
            </p>
            <p className="login-disclaimer">
              By continuing, you agree to SPMIS Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
