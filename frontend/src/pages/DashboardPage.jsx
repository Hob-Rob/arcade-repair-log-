import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsApi } from '../services/api.js'
import { formatDistanceToNow } from 'date-fns'

const PRIORITY_COLOR = { critical:'#ef4444', high:'#f97316', medium:'#fbbf24', low:'#22c55e' }
const STATUS_LABEL = {
  reported:'Reported', self_fix:'Self Fix', sega_job:'Supplier Job',
  in_progress:'In Progress', parts_ordered:'Parts Ordered', resolved:'Resolved'
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', flex:1 }}>
      <div style={{ fontSize:'0.65rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.375rem' }}>{label}</div>
      <div style={{ fontSize:'1.75rem', fontWeight:700, color: color || '#e2e8f0', lineHeight:1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize:'0.7rem', color:'#475569', marginTop:'0.25rem' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats]   = useState(null)
  const [jobs, setJobs]     = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      jobsApi.stats(),
      jobsApi.list({ status: 'reported' }),
      jobsApi.list({ status: 'in_progress' }),
      jobsApi.list({ status: 'sega_job' }),
    ]).then(([s, reported, inProgress, supplierJob]) => {
      setStats(s)
      setJobs([...reported, ...inProgress, ...supplierJob].slice(0, 8))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color:'#475569', textAlign:'center', padding:'3rem' }}>Loading...</div>

  return (
    <div>
      <h1 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1rem', color:'#e2e8f0' }}>Overview</h1>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem', marginBottom:'1.25rem' }}>
        <StatCard label="Open jobs"    value={stats?.open_jobs}    color='#ef4444' />
        <StatCard label="Critical"     value={stats?.critical_open} color='#f97316' />
        <StatCard label="Self fixes"   value={stats?.self_fixes}   color='#22c55e' />
        <StatCard label="Avg resolve"  value={stats?.avg_resolution_hours ? `${stats.avg_resolution_hours}h` : 'N/A'} color='#818cf8' />
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
        <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'#94a3b8' }}>Open jobs</h2>
        <button onClick={() => navigate('/jobs')} style={{ fontSize:'0.75rem', color:'#ef4444', background:'none', border:'none', cursor:'pointer' }}>See all →</button>
      </div>

      {jobs.length === 0
        ? <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'2rem', textAlign:'center', color:'#475569', fontSize:'0.875rem' }}>
            No open jobs — nice work!
          </div>
        : jobs.map(job => (
          <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
            style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.625rem', cursor:'pointer', borderLeft:`3px solid ${PRIORITY_COLOR[job.priority]}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:'0.25rem' }}>{job.machine_name}</div>
                <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.375rem' }}>{job.title}</div>
                <div style={{ fontSize:'0.7rem', color:'#475569' }}>{job.venue_name} · {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.25rem', flexShrink:0 }}>
                <span style={{ fontSize:'0.65rem', background:'#1a1a1a', color:'#94a3b8', padding:'2px 6px', borderRadius:'4px' }}>{STATUS_LABEL[job.status]}</span>
                <span style={{ fontSize:'0.65rem', color: PRIORITY_COLOR[job.priority], fontWeight:600, textTransform:'uppercase' }}>{job.priority}</span>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}
