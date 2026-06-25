import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobsApi } from '../services/api.js'
import { formatDistanceToNow, format } from 'date-fns'

const PRIORITY_COLOR = {
  critical:'#ef4444', high:'#f97316', medium:'#fbbf24', low:'#22c55e'
}

const PIPELINE = [
  { id:'reported',      label:'Reported' },
  { id:'sega_job',      label:'Supplier Job' },
  { id:'in_progress',   label:'In Progress' },
  { id:'parts_ordered', label:'Parts Ordered' },
  { id:'parts_delayed', label:'Parts Delayed', branch: true },
  { id:'parts_arrived', label:'Parts Arrived' },
  { id:'installing',    label:'Installing' },
  { id:'resolved',      label:'Resolved' },
]

const SELF_FIX_PIPELINE = [
  { id:'self_fix',  label:'Self Fix' },
  { id:'installing', label:'Installing' },
  { id:'resolved',  label:'Resolved' },
]

// What comes next for each status
const NEXT_STATUS = {
  reported:      'sega_job',
  sega_job:      'in_progress',
  in_progress:   'parts_ordered',
  parts_ordered: 'parts_arrived',
  parts_delayed: 'parts_arrived',
  parts_arrived: 'installing',
  installing:    'resolved',
  self_fix:      'installing',
}

const STATUS_COLOR = {
  reported:      '#64748b',
  sega_job:      '#818cf8',
  in_progress:   '#f59e0b',
  parts_ordered: '#06b6d4',
  parts_delayed: '#ef4444',
  parts_arrived: '#a78bfa',
  installing:    '#f97316',
  resolved:      '#22c55e',
  self_fix:      '#22c55e',
}

const inputStyle = {
  width:'100%', padding:'0.625rem', background:'#0a0a0a',
  border:'1px solid #1a1a1a', borderRadius:'8px',
  color:'#e2e8f0', fontSize:'0.8rem', outline:'none', marginTop:'0.25rem'
}
const labelStyle = { fontSize:'0.7rem', color:'#64748b', display:'block', marginTop:'0.625rem' }

function StageForm({ currentStatus, nextStatus, onSubmit, updating }) {
  const [fields, setFields] = useState({})
  const [isDelayed, setIsDelayed] = useState(false)
  const set = (k, v) => setFields(p => ({ ...p, [k]: v }))

  function handleSubmit(status) {
    onSubmit(status, fields)
  }

  // Parts ordered — capture part name, ETA, reference
  if (currentStatus === 'in_progress') {
    return (
      <div>
        <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginBottom:'0.75rem' }}>
          Moving to <strong>Parts Ordered</strong> — enter what's been ordered:
        </div>
        <label style={labelStyle}>Part name / description</label>
        <input value={fields.parts_name||''} onChange={e => set('parts_name', e.target.value)}
          placeholder="e.g. Power supply board, monitor PCB" style={inputStyle} />
        <label style={labelStyle}>Estimated arrival date</label>
        <input type="date" value={fields.parts_eta||''} onChange={e => set('parts_eta', e.target.value)} style={inputStyle} />
        <label style={labelStyle}>Supplier reference / order number (optional)</label>
        <input value={fields.parts_reference||''} onChange={e => set('parts_reference', e.target.value)}
          placeholder="e.g. SEG-2026-4521" style={inputStyle} />

        <div style={{ marginTop:'1rem', background:'#1a0a0a', border:'1px solid #7f1d1d', borderRadius:'8px', padding:'0.75rem' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'0.625rem', cursor:'pointer' }}>
            <input type="checkbox" checked={isDelayed} onChange={e => setIsDelayed(e.target.checked)}
              style={{ width:'16px', height:'16px', accentColor:'#ef4444' }} />
            <div>
              <div style={{ fontSize:'0.8rem', color:'#fca5a5', fontWeight:500 }}>Parts are delayed</div>
              <div style={{ fontSize:'0.7rem', color:'#64748b' }}>Supplier has flagged a delay on this order</div>
            </div>
          </label>
          {isDelayed && (
            <>
              <label style={labelStyle}>Reason for delay</label>
              <input value={fields.delay_reason||''} onChange={e => set('delay_reason', e.target.value)}
                placeholder="e.g. Out of stock, supplier delay" style={inputStyle} />
              <label style={labelStyle}>New estimated arrival</label>
              <input type="date" value={fields.new_eta||''} onChange={e => set('new_eta', e.target.value)} style={inputStyle} />
            </>
          )}
        </div>

        <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.875rem' }}>
          <button onClick={() => handleSubmit(isDelayed ? 'parts_delayed' : 'parts_ordered')} disabled={updating}
            style={{ flex:1, padding:'0.75rem', background:'#06b6d4', color:'#fff', border:'none', borderRadius:'10px', fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>
            {updating ? 'Updating...' : isDelayed ? '→ Mark parts delayed' : '→ Mark parts ordered'}
          </button>
        </div>
      </div>
    )
  }

  // Parts delayed — update delay info or mark arrived
  if (currentStatus === 'parts_ordered' || currentStatus === 'parts_delayed') {
    return (
      <div>
        <div style={{ display:'flex', gap:'0.5rem', flexDirection:'column' }}>
          <div style={{ background:'#1a0a0a', border:'1px solid #7f1d1d', borderRadius:'8px', padding:'0.75rem', marginBottom:'0.5rem' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'0.625rem', cursor:'pointer' }}>
              <input type="checkbox" checked={isDelayed} onChange={e => setIsDelayed(e.target.checked)}
                style={{ width:'16px', height:'16px', accentColor:'#ef4444' }} />
              <div>
                <div style={{ fontSize:'0.8rem', color:'#fca5a5', fontWeight:500 }}>Update — parts are delayed</div>
                <div style={{ fontSize:'0.7rem', color:'#64748b' }}>Tick if ETA has slipped</div>
              </div>
            </label>
            {isDelayed && (
              <>
                <label style={labelStyle}>Reason for delay</label>
                <input value={fields.delay_reason||''} onChange={e => set('delay_reason', e.target.value)}
                  placeholder="e.g. Back ordered until next month" style={inputStyle} />
                <label style={labelStyle}>New estimated arrival</label>
                <input type="date" value={fields.new_eta||''} onChange={e => set('new_eta', e.target.value)} style={inputStyle} />
                <button onClick={() => handleSubmit('parts_delayed')} disabled={updating}
                  style={{ width:'100%', marginTop:'0.625rem', padding:'0.625rem', background:'#450a0a', color:'#fca5a5', border:'1px solid #7f1d1d', borderRadius:'8px', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
                  {updating ? 'Updating...' : 'Save delay update'}
                </button>
              </>
            )}
          </div>

          <button onClick={() => handleSubmit('parts_arrived')} disabled={updating}
            style={{ width:'100%', padding:'0.75rem', background:'#4c1d95', color:'#c4b5fd', border:'1px solid #6d28d9', borderRadius:'10px', fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>
            {updating ? 'Updating...' : '✓ Parts have arrived'}
          </button>
        </div>
      </div>
    )
  }

  // Installing — capture estimated fix time
  if (currentStatus === 'parts_arrived' || currentStatus === 'self_fix') {
    return (
      <div>
        <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginBottom:'0.75rem' }}>
          Moving to <strong>Installing</strong> — how long should the fix take?
        </div>
        <label style={labelStyle}>Estimated time to fix</label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.375rem', marginTop:'0.375rem' }}>
          {['30 mins','1 hour','2 hours','Half day'].map(t => (
            <button key={t} type="button" onClick={() => set('estimated_fix_hours', t)}
              style={{ padding:'0.5rem 0.25rem', borderRadius:'8px', border:'1px solid', fontSize:'0.7rem', fontWeight:500, cursor:'pointer', textAlign:'center',
                background: fields.estimated_fix_hours === t ? '#431407' : '#111',
                color: fields.estimated_fix_hours === t ? '#fdba74' : '#475569',
                borderColor: fields.estimated_fix_hours === t ? '#7c2d12' : '#1a1a1a',
              }}>
              {t}
            </button>
          ))}
        </div>
        <label style={labelStyle}>Or enter custom estimate</label>
        <input value={fields.estimated_fix_hours||''} onChange={e => set('estimated_fix_hours', e.target.value)}
          placeholder="e.g. 3 hours, overnight" style={inputStyle} />
        <button onClick={() => handleSubmit('installing')} disabled={updating}
          style={{ width:'100%', marginTop:'0.875rem', padding:'0.75rem', background:'#431407', color:'#fdba74', border:'1px solid #7c2d12', borderRadius:'10px', fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>
          {updating ? 'Updating...' : '→ Start installing'}
        </button>
      </div>
    )
  }

  // Resolved — capture what was done
  if (currentStatus === 'installing') {
    return (
      <div>
        <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginBottom:'0.75rem' }}>
          Marking as <strong>Resolved</strong> — what was done?
        </div>
        <label style={labelStyle}>Parts replaced / work done</label>
        <input value={fields.parts_used||''} onChange={e => set('parts_used', e.target.value)}
          placeholder="e.g. Replaced power supply board" style={inputStyle} />
        <label style={labelStyle}>Actual time taken</label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.375rem', marginTop:'0.375rem' }}>
          {['30 mins','1 hour','2 hours','Half day'].map(t => (
            <button key={t} type="button" onClick={() => set('actual_fix_hours', t)}
              style={{ padding:'0.5rem 0.25rem', borderRadius:'8px', border:'1px solid', fontSize:'0.7rem', fontWeight:500, cursor:'pointer',
                background: fields.actual_fix_hours === t ? '#14532d' : '#111',
                color: fields.actual_fix_hours === t ? '#86efac' : '#475569',
                borderColor: fields.actual_fix_hours === t ? '#166534' : '#1a1a1a',
              }}>
              {t}
            </button>
          ))}
        </div>
        <label style={labelStyle}>Or enter actual time</label>
        <input value={fields.actual_fix_hours||''} onChange={e => set('actual_fix_hours', e.target.value)}
          placeholder="e.g. 45 mins" style={inputStyle} />
        <button onClick={() => handleSubmit('resolved')} disabled={updating}
          style={{ width:'100%', marginTop:'0.875rem', padding:'0.75rem', background:'#14532d', color:'#86efac', border:'1px solid #166534', borderRadius:'10px', fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>
          {updating ? 'Updating...' : '✓ Mark as resolved'}
        </button>
      </div>
    )
  }

  // Default — simple advance button
  if (nextStatus) {
    const next = PIPELINE.find(s => s.id === nextStatus)
    return (
      <button onClick={() => handleSubmit(nextStatus)} disabled={updating}
        style={{ width:'100%', padding:'0.75rem', background:'#1a1a1a', color:'#e2e8f0', border:'1px solid #334155', borderRadius:'10px', fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>
        {updating ? 'Updating...' : `→ Mark as ${next?.label}`}
      </button>
    )
  }

  return null
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [note, setNote]         = useState('')
  const [author, setAuthor]     = useState('')
  const [updating, setUpdating] = useState(false)

  async function load() {
    const data = await jobsApi.get(id)
    setJob(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleStatusUpdate(status, fields) {
    setUpdating(true)
    try {
      await jobsApi.updateStatus(id, { status, ...fields })
      await load()
    } finally {
      setUpdating(false)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!note.trim() || !author.trim()) return
    await jobsApi.addNote(id, { author, body: note })
    setNote('')
    await load()
  }

  if (loading) return <div style={{ color:'#475569', textAlign:'center', padding:'3rem' }}>Loading...</div>
  if (!job) return <div style={{ color:'#ef4444', textAlign:'center', padding:'3rem' }}>Job not found</div>

  const pipeline = job.is_self_fix ? SELF_FIX_PIPELINE : PIPELINE.filter(s => s.id !== 'parts_delayed' || job.status === 'parts_delayed')
  const currentIdx = pipeline.findIndex(s => s.id === job.status)
  const nextStatus = NEXT_STATUS[job.status]
  const hoursOpen = Math.round(Number(job.hours_open) * 10) / 10
  const meta = job.meta || {}
  const statusColor = STATUS_COLOR[job.status] || '#64748b'

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
        <button onClick={() => navigate(-1)} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'8px', padding:'0.5rem 0.75rem', color:'#94a3b8', cursor:'pointer', fontSize:'0.8rem' }}>← Back</button>
        <span style={{ fontSize:'0.75rem', color: PRIORITY_COLOR[job.priority], fontWeight:700, textTransform:'uppercase' }}>{job.priority}</span>
        <span style={{ fontSize:'0.75rem', color: statusColor, fontWeight:600, marginLeft:'auto', background:'#111', border:`1px solid ${statusColor}`, padding:'2px 8px', borderRadius:'20px' }}>
          {pipeline.find(s => s.id === job.status)?.label || job.status}
        </span>
      </div>

      {/* Machine + fault info */}
      <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem', borderLeft:`3px solid ${PRIORITY_COLOR[job.priority]}` }}>
        <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'0.25rem' }}>{job.machine_name}</div>
        <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.5rem' }}>{job.title}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem', marginBottom:'0.75rem' }}>
          <span style={{ fontSize:'0.7rem', background:'#1a1a1a', color:'#94a3b8', padding:'2px 8px', borderRadius:'4px' }}>{job.venue_name}</span>
          {job.location_in_venue && <span style={{ fontSize:'0.7rem', background:'#1a1a1a', color:'#94a3b8', padding:'2px 8px', borderRadius:'4px' }}>{job.location_in_venue}</span>}
        </div>
        <div style={{ fontSize:'0.75rem', color:'#475569' }}>
          Logged by {job.reported_by} · {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </div>
        {job.status !== 'resolved' && (
          <div style={{ fontSize:'0.75rem', marginTop:'0.25rem', color: hoursOpen > 48 ? '#ef4444' : '#f97316', fontWeight:500 }}>
            ⏱ Machine down {hoursOpen}h
          </div>
        )}
        {job.resolved_at && (
          <div style={{ fontSize:'0.75rem', color:'#22c55e', marginTop:'0.25rem' }}>
            ✓ Resolved {format(new Date(job.resolved_at), 'd MMM yyyy HH:mm')}
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
        <div style={{ fontSize:'0.7rem', color:'#475569', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Description</div>
        <p style={{ fontSize:'0.875rem', color:'#94a3b8', lineHeight:'1.6' }}>{job.description}</p>
      </div>

      {/* Photos */}
      {job.photo_urls?.length > 0 && (
        <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#475569', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Photos</div>
          <div style={{ display:'flex', gap:'0.5rem', overflowX:'auto' }}>
            {job.photo_urls.map((url, i) => (
              <img key={i} src={url} style={{ height:'100px', borderRadius:'8px', border:'1px solid #1a1a1a', objectFit:'cover', flexShrink:0 }} />
            ))}
          </div>
        </div>
      )}

      {/* Parts info if ordered */}
      {(meta.parts_name || meta.parts_eta || meta.parts_reference) && (
        <div style={{ background:'#0a1628', border:'1px solid #1e3a5f', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#475569', marginBottom:'0.625rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Parts info</div>
          {meta.parts_name && <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.25rem' }}>Part: <span style={{ color:'#e2e8f0' }}>{meta.parts_name}</span></div>}
          {meta.parts_reference && <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.25rem' }}>Ref: <span style={{ color:'#e2e8f0' }}>{meta.parts_reference}</span></div>}
          {meta.parts_eta && (
            <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.25rem' }}>
              ETA: <span style={{ color: new Date(meta.parts_eta) < new Date() ? '#ef4444' : '#4ade80' }}>
                {format(new Date(meta.parts_eta), 'd MMM yyyy')}
                {new Date(meta.parts_eta) < new Date() && job.status !== 'resolved' ? ' — OVERDUE' : ''}
              </span>
            </div>
          )}
          {meta.parts_ordered_at && <div style={{ fontSize:'0.7rem', color:'#475569' }}>Ordered {formatDistanceToNow(new Date(meta.parts_ordered_at), { addSuffix: true })}</div>}
          {meta.parts_arrived_at && <div style={{ fontSize:'0.75rem', color:'#4ade80', marginTop:'0.25rem' }}>✓ Arrived {format(new Date(meta.parts_arrived_at), 'd MMM yyyy HH:mm')}</div>}
        </div>
      )}

      {/* Delay info */}
      {(meta.delay_reason || meta.new_eta) && (
        <div style={{ background:'#1a0a0a', border:'1px solid #7f1d1d', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#f87171', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>⚠ Parts delayed</div>
          {meta.delay_reason && <div style={{ fontSize:'0.8rem', color:'#fca5a5', marginBottom:'0.25rem' }}>{meta.delay_reason}</div>}
          {meta.new_eta && <div style={{ fontSize:'0.8rem', color:'#94a3b8' }}>New ETA: <span style={{ color:'#fca5a5' }}>{format(new Date(meta.new_eta), 'd MMM yyyy')}</span></div>}
          {meta.delayed_at && <div style={{ fontSize:'0.7rem', color:'#475569', marginTop:'0.25rem' }}>Flagged {formatDistanceToNow(new Date(meta.delayed_at), { addSuffix: true })}</div>}
        </div>
      )}

      {/* Installing info */}
      {meta.estimated_fix_hours && job.status !== 'resolved' && (
        <div style={{ background:'#1a0e00', border:'1px solid #7c2d12', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#f97316', marginBottom:'0.375rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Install in progress</div>
          <div style={{ fontSize:'0.8rem', color:'#fdba74' }}>Estimated: {meta.estimated_fix_hours}</div>
          {meta.install_started_at && <div style={{ fontSize:'0.7rem', color:'#475569', marginTop:'0.25rem' }}>Started {formatDistanceToNow(new Date(meta.install_started_at), { addSuffix: true })}</div>}
        </div>
      )}

      {/* Resolution summary */}
      {job.status === 'resolved' && (meta.actual_fix_hours || meta.parts_used) && (
        <div style={{ background:'#0a1f0a', border:'1px solid #166534', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#4ade80', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>✓ Resolution summary</div>
          {meta.parts_used && <div style={{ fontSize:'0.8rem', color:'#86efac', marginBottom:'0.25rem' }}>Work done: {meta.parts_used}</div>}
          {meta.actual_fix_hours && <div style={{ fontSize:'0.8rem', color:'#86efac' }}>Time taken: {meta.actual_fix_hours}</div>}
        </div>
      )}

      {/* Technician */}
      {job.technician_name && (
        <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#475569', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Technician</div>
          <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{job.technician_name}</div>
          <div style={{ fontSize:'0.75rem', color:'#475569' }}>{job.technician_company}</div>
          {job.technician_phone && (
            <a href={`https://wa.me/${job.technician_phone.replace(/\s/g,'')}?text=${encodeURIComponent(`Hi, logging a fault at ${job.venue_name}:\n\nMachine: ${job.machine_name}\nFault: ${job.title}\n\n${job.description}`)}`}
              style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', marginTop:'0.625rem', fontSize:'0.8rem', color:'#4ade80', background:'#14532d', border:'1px solid #166534', padding:'0.375rem 0.75rem', borderRadius:'8px' }}>
              💬 WhatsApp {job.technician_name.split(' ')[0]}
            </a>
          )}
        </div>
      )}

      {/* Pipeline progress */}
      <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
        <div style={{ fontSize:'0.7rem', color:'#475569', marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Pipeline</div>
        <div style={{ display:'flex', gap:'0.25rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
          {pipeline.map((s, i) => (
            <div key={s.id} style={{ flex:1, minWidth:'20px', height:'4px', borderRadius:'2px',
              background: i <= currentIdx ? (STATUS_COLOR[s.id] || '#ef4444') : '#1a1a1a' }} />
          ))}
        </div>

        {job.status === 'resolved'
          ? <div style={{ fontSize:'0.875rem', color:'#22c55e', fontWeight:500 }}>✓ This job is fully resolved</div>
          : <StageForm
              currentStatus={job.status}
              nextStatus={nextStatus}
              onSubmit={handleStatusUpdate}
              updating={updating}
            />
        }
      </div>

      {/* Notes */}
      <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
        <div style={{ fontSize:'0.7rem', color:'#475569', marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Notes ({job.notes?.length || 0})</div>
        {job.notes?.map(n => (
          <div key={n.id} style={{ padding:'0.625rem 0', borderBottom:'1px solid #1a1a1a' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.25rem' }}>
              <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#94a3b8' }}>{n.author}</span>
              <span style={{ fontSize:'0.7rem', color:'#475569' }}>{format(new Date(n.created_at), 'd MMM HH:mm')}</span>
            </div>
            <p style={{ fontSize:'0.8rem', color:'#64748b', lineHeight:'1.5' }}>{n.body}</p>
          </div>
        ))}
        <form onSubmit={handleAddNote} style={{ marginTop:'0.75rem' }}>
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name"
            style={{ width:'100%', padding:'0.5rem 0.625rem', background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:'8px', color:'#e2e8f0', fontSize:'0.8rem', outline:'none', marginBottom:'0.375rem' }} />
          <div style={{ display:'flex', gap:'0.375rem' }}>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
              style={{ flex:1, padding:'0.5rem 0.625rem', background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:'8px', color:'#e2e8f0', fontSize:'0.8rem', outline:'none' }} />
            <button type="submit" style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 0.75rem', fontSize:'0.8rem', cursor:'pointer', fontWeight:500 }}>Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}
