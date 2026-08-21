import { useState } from 'react'
import { ChevronLeft, ShieldCheck, User, Hospital, Shield } from 'lucide-react'
import FormInput from '../../components/auth/FormInput'
import PasswordInput from '../../components/auth/PasswordInput'
import styles from './LoginPage.module.css'

export default function LoginPage({ onLogin, onPatientRegister, onHospitalRegister, onBack }) {
  const [role, setRole]           = useState('patient') // 'patient' | 'hospital' | 'cms'
  const [fields, setFields]       = useState({ identifier: '', password: '' })
  const [errors, setErrors]       = useState({ identifier: '', password: '' })
  const [rememberMe, setRemember] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [submitErr, setSubmitErr] = useState('')

  const handle = (f) => (e) => {
    const v = e.target.value
    setFields(p => ({ ...p, [f]: v }))
    if (errors[f] && v.trim()) setErrors(p => ({ ...p, [f]: '' }))
  }

  const validate = () => {
    const e = { identifier: '', password: '' }
    let ok = true
    if (!fields.identifier.trim()) {
      e.identifier = role === 'patient' 
        ? 'Please enter your Member ID.' 
        : role === 'hospital'
        ? 'Please enter your organization name.'
        : 'Please enter your CMS Admin ID.'
      ok = false
    }
    if (!fields.password) {
      e.password = 'Please enter your password.'
      ok = false
    }
    setErrors(e)
    return ok
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setSubmitErr('')
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 200))
    // Explicitly send role so auth dispatcher routes to the exact portal
    const result = await onLogin({ role, identifier: fields.identifier, password: fields.password }, rememberMe)
    if (result && !result.ok) {
      setSubmitErr(result.error || 'Authentication failed. Please check your credentials.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      {/* Left brand panel */}
      <aside className={styles.brand} aria-label="CTS Healthcare">
        <button className={styles.back} onClick={onBack}>
          <ChevronLeft size={16} strokeWidth={2}/> Back to Home
        </button>

        <div className={styles.brandLogo}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.1)"/>
            <rect x="15" y="6"  width="10" height="28" rx="2.5" fill="white"/>
            <rect x="6"  y="15" width="28" height="10" rx="2.5" fill="white"/>
          </svg>
          <div>
            <div className={styles.brandName}>CTS Healthcare</div>
            <div className={styles.brandSub}>Connected Healthcare Platform</div>
          </div>
        </div>

        <div className={styles.brandMsg}>
          <h1 className={styles.brandHeadline}>One Platform.<br/>Connected Healthcare.</h1>
          <p className={styles.brandText}>
            Your account connects you to the healthcare services relevant to you —
            patients, hospital teams, and CMS administrators all enter here.
          </p>
        </div>

        <div className={styles.brandIllustration} aria-hidden="true">
          <BrandDiagram />
        </div>

        <div className={styles.brandFeatures} role="list">
          {[
            { icon: <User       size={14} strokeWidth={2}/>, label: 'Patient Access' },
            { icon: <Hospital   size={14} strokeWidth={2}/>, label: 'Hospital Access' },
            { icon: <Shield     size={14} strokeWidth={2}/>, label: 'CMS Admin Access' },
          ].map(f => (
            <div key={f.label} className={styles.brandPill} role="listitem">
              <span aria-hidden="true">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Right form panel */}
      <main className={styles.form} aria-label="Sign in to CTS Healthcare">
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.roleTabs} role="tablist" aria-label="Select role to sign in">
              <button
                type="button"
                role="tab"
                aria-selected={role === 'patient'}
                className={[styles.roleTab, role === 'patient' ? styles.roleTabPatientActive : ''].filter(Boolean).join(' ')}
                onClick={() => {
                  setRole('patient')
                  setSubmitErr('')
                }}
              >
                <User size={15} strokeWidth={2.2} />
                <span>Patient</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={role === 'hospital'}
                className={[styles.roleTab, role === 'hospital' ? styles.roleTabHospitalActive : ''].filter(Boolean).join(' ')}
                onClick={() => {
                  setRole('hospital')
                  setSubmitErr('')
                }}
              >
                <Hospital size={15} strokeWidth={2.2} />
                <span>Hospital</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={role === 'cms'}
                className={[styles.roleTab, role === 'cms' ? styles.roleTabCmsActive : ''].filter(Boolean).join(' ')}
                onClick={() => {
                  setRole('cms')
                  setSubmitErr('')
                }}
              >
                <Shield size={15} strokeWidth={2.2} />
                <span>CMS / Admin</span>
              </button>
            </div>

            <h2 className={styles.heading} style={{ marginTop: '0.75rem' }}>
              {role === 'patient' ? 'Patient Sign In' : role === 'hospital' ? 'Hospital Sign In' : 'CMS / Admin Sign In'}
            </h2>
            <p className={styles.subheading}>
              {role === 'patient' 
                ? 'Access your personal health records, care plans, and assessments.'
                : role === 'hospital'
                ? 'Manage clinical workflows, patient intake, and department operations.'
                : 'Access health plan analytics, utilization intelligence, and network monitoring.'}
            </p>
          </div>

          {submitErr && (
            <div className={styles.errBanner} role="alert" aria-live="assertive">
              <ShieldCheck size={15} strokeWidth={2}/> {submitErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fields}>
              <FormInput
                id="identifier"
                label={role === 'patient' ? 'Member ID' : role === 'hospital' ? 'Organization Name' : 'CMS Admin ID'}
                placeholder={
                  role === 'patient' 
                    ? 'Enter Member ID (e.g. PT-2024-8821)' 
                    : role === 'hospital'
                    ? 'Enter hospital / organization name'
                    : 'Enter Admin ID (e.g. CMS-ADMIN-01 or admin)'
                }
                value={fields.identifier}
                onChange={handle('identifier')}
                error={errors.identifier}
                disabled={loading}
                autoComplete="username"
                icon={
                  role === 'patient' 
                    ? <User size={16} strokeWidth={2}/> 
                    : role === 'hospital' 
                    ? <Hospital size={16} strokeWidth={2}/> 
                    : <Shield size={16} strokeWidth={2}/>
                }
              />
              <PasswordInput
                id="login-password"
                label="Password"
                placeholder="Enter your password"
                value={fields.password}
                onChange={handle('password')}
                error={errors.password}
                disabled={loading}
              />
            </div>

            <div className={styles.options}>
              <label className={styles.remember}>
                <input type="checkbox" className={styles.checkbox}
                  checked={rememberMe} onChange={e => setRemember(e.target.checked)}
                  disabled={loading} aria-label="Remember me"/>
                <span>Remember me</span>
              </label>
              <button type="button" className={styles.forgot}
                onClick={() => alert('Password reset verification available for authorized accounts.')}>
                Forgot Password?
              </button>
            </div>

            <button type="submit" className={styles.submit} disabled={loading}
              aria-label={loading ? 'Signing in…' : 'Sign In'}>
              {loading
                ? <><span className={styles.spin} aria-hidden="true"/>Signing In…</>
                : 'Sign In'
              }
            </button>
          </form>

          {/* Registration links */}
          <div className={styles.reg}>
            <p className={styles.regLabel}>New to CTS Healthcare?</p>
            <div className={styles.regLinks}>
              <button className={styles.regBtn} onClick={onPatientRegister} type="button">
                <User size={14} strokeWidth={2}/> Register as a Patient
              </button>
              <span className={styles.regDivider} aria-hidden="true">·</span>
              <button className={styles.regBtn} onClick={onHospitalRegister} type="button">
                <Hospital size={14} strokeWidth={2}/> Register your Hospital
              </button>
            </div>
          </div>

          <footer className={styles.footer}>
            © 2026 CTS Healthcare. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  )
}

function BrandDiagram() {
  const HUB   = { cx: 130, cy: 112, r: 28 }
  const NODES = [
    { cx: 40,  cy: 48,  r: 20, label: 'Patient',  dx: 0, dy: -12 },
    { cx: 220, cy: 48,  r: 20, label: 'Hospital', dx: 0, dy: -12 },
    { cx: 130, cy: 184, r: 20, label: 'CMS Admin', dx: 0, dy: 14 },
  ]

  return (
    <svg
      viewBox="0 0 260 215"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.diagramSvg}
      role="img"
      aria-label="CTS Healthcare — Patient, Hospital, and CMS Admin connected to the central platform"
    >
      <circle cx={HUB.cx} cy={HUB.cy} r="85"  stroke="rgba(0,110,182,0.12)" strokeWidth="1"/>
      <circle cx={HUB.cx} cy={HUB.cy} r="108" stroke="rgba(0,110,182,0.06)" strokeWidth="1"/>

      {/* Connection lines */}
      {NODES.map((node, idx) => (
        <line
          key={idx}
          x1={node.cx}
          y1={node.cy}
          x2={HUB.cx}
          y2={HUB.cy}
          stroke="#3BB7B2" strokeWidth="1.4"
          strokeDasharray="5 4" opacity="0.65"
        />
      ))}

      {/* Nodes */}
      {NODES.map((node, idx) => (
        <g key={idx}>
          <circle
            cx={node.cx} cy={node.cy} r={node.r}
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
          {node.label === 'Patient' && (
            <g transform={`translate(${node.cx - 8}, ${node.cy - 10})`} stroke="#3BB7B2" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="5" r="3"/>
              <path d="M1 17c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeWidth="1.2"/>
            </g>
          )}
          {node.label === 'Hospital' && (
            <g transform={`translate(${node.cx - 8}, ${node.cy - 9})`} stroke="#3BB7B2" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="14" height="11" rx="1"/>
              <path d="M3 4V3a4 4 0 018 0v1"/>
              <line x1="8" y1="7" x2="8" y2="12"/>
              <line x1="5.5" y1="9.5" x2="10.5" y2="9.5"/>
            </g>
          )}
          {node.label === 'CMS Admin' && (
            <g transform={`translate(${node.cx - 8}, ${node.cy - 9})`} stroke="#3BB7B2" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5L2 4.5v5c0 4 3 6.5 6 7.5 3-1 6-3.5 6-7.5v-5L8 1.5z"/>
            </g>
          )}
          <text
            x={node.cx}
            y={node.cy + (node.dy > 0 ? node.r + node.dy : -(node.r + Math.abs(node.dy)) + 2)}
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="600"
            fontFamily="'Source Sans 3', sans-serif"
            fill="rgba(255,255,255,0.75)"
            letterSpacing="0.02em"
          >
            {node.label}
          </text>
        </g>
      ))}

      {/* Central Hub */}
      <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r + 7}
        fill="none" stroke="#006EB6" strokeWidth="10" opacity="0.18"/>
      <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r}
        fill="#006EB6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>

      <g transform={`translate(${HUB.cx - 12}, ${HUB.cy - 12})`}
        stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20C5.5 15.7 2 11.5 2 7.8A5 5 0 0112 5.5a5 5 0 0110 2.3c0 3.7-3.5 7.9-10 12.2z"/>
        <polyline points="6.5,11 9.2,8.3 11,13 13,7.3 15.5,11"/>
      </g>

      <text
        x={HUB.cx} y={HUB.cy + HUB.r + 12}
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fontFamily="'Source Sans 3', sans-serif"
        fill="rgba(255,255,255,0.45)"
        letterSpacing="0.08em"
      >
        CTS HEALTHCARE
      </text>
    </svg>
  )
}
