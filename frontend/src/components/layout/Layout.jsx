import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/dashboard', label: 'Home',     icon: '⬡' },
  { to: '/jobs',      label: 'Jobs',     icon: '🔧' },
  { to: '/machines',  label: 'Machines', icon: '🕹️' },
]

export default function Layout() {
  const location = useLocation()
  const isNewJob = location.pathname === '/jobs/new'
  const isDetail = location.pathname.match(/^\/jobs\/.+/)

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#0a0a0a' }}>
      <header style={{ padding:'1rem', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#0a0a0a', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ fontSize:'1.25rem' }}>🕹️</span>
          <span style={{ fontWeight:700, fontSize:'1rem', color:'#e2e8f0', letterSpacing:'-0.02em' }}>Repair Log</span>
        </div>
        {!isNewJob && (
          <NavLink to="/jobs/new" style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.375rem' }}>
            + Log Fault
          </NavLink>
        )}
      </header>

      <main style={{ flex:1, padding:'1rem', paddingBottom:'5rem', overflowY:'auto' }}>
        <Outlet />
      </main>

      <nav style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'480px', background:'#111', borderTop:'1px solid #1a1a1a', display:'flex', zIndex:10 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:'0.625rem 0', fontSize:'0.65rem', fontWeight:500, gap:'0.2rem',
            color: isActive ? '#ef4444' : '#64748b',
            borderTop: isActive ? '2px solid #ef4444' : '2px solid transparent',
          })}>
            <span style={{ fontSize:'1.25rem', lineHeight:1 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
