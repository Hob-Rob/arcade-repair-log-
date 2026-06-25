import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsApi } from '../services/api.js'
import { formatDistanceToNow } from 'date-fns'

const PRIORITY_COLOR = { critical:'#ef4444', high:'#f97316', medium:'#fbbf24', low:'#22c55e' }
const STATUS_LABEL = {
  reported:'Reported', self_fix:'Self Fix', sega_job:'Supplier Job',
  in_progress:'In Progress', parts_ordered:'Parts Ordered', resolved:'Resolved'
}
const STATUSES = ['all','reported','sega_job','in_progress','parts_ordered','self_fix','resolved']

export default function JobsPage() {
  const [jobs, setJobs]         = useState([])
  const [status, setStatus]     = useState('all')
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    jobsApi.list(status !== 'all' ? { status } : {})
      .then(setJobs).finally(() => setLoading(false))
  }, [status])

  return (
    <div>
      <h1 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1rem' }}>All jobs</h1>

      <div style={{ display:'flex', gap:'0.375rem', overflowX:'auto', paddingBottom:'0.5rem', marginBottom:'1rem', scrollbarWidth:'none' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            style={{ padding:'0.375rem 0.75rem', borderRadius:'20px', border:'1px solid', fontSize:'0.75rem', fontWeight:500, cursor:'pointer', whiteSpace:'nowrap',
              background: status===s ? '#ef4444' : '#111',
              color: status===s ? '#fff' : '#64748b',
              borderColor: status===s ? '#ef4444' : '#1a1a1a',
            }}>
            {s === 'all' ? 'All' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading
        ? <div style={{ color:'#475569', textAlign:'center', padding:'2rem' }}>Loading...</div>
        : jobs.length === 0
          ? <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'2rem', textAlign:'center', color:'#475569', fontSize:'0.875rem' }}>No jobs found.</div>
          : jobs.map(job => (
            <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
              style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.625rem', cursor:'pointer', borderLeft:`3px solid ${PRIORITY_COLOR[job.priority]}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:'0.2rem' }}>{job.machine_name}</div>
                  <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.375rem' }}>{job.title}</div>
                  <div style={{ fontSize:'0.7rem', color:'#475569' }}>
                    {job.venue_name} · {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    {job.hours_open && job.status !== 'resolved' && (
                      <span style={{ color: Number(job.hours_open) > 48 ? '#ef4444' : '#475569' }}> · {Math.round(job.hours_open)}h down</span>
                    )}
                  </div>
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
