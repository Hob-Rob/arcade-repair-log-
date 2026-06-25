import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsApi, machinesApi, venuesApi, techsApi } from '../services/api.js'

const inputStyle = {
  width:'100%', padding:'0.75rem', background:'#111', border:'1px solid #1a1a1a',
  borderRadius:'10px', color:'#e2e8f0', fontSize:'0.875rem', outline:'none',
}
const labelStyle = { fontSize:'0.75rem', color:'#64748b', display:'block', marginBottom:'0.375rem', fontWeight:500 }

export default function NewJobPage() {
  const navigate = useNavigate()
  const [venues, setVenues]     = useState([])
  const [machines, setMachines] = useState([])
  const [techs, setTechs]       = useState([])
  const [photos, setPhotos]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const fileRef = useRef()

  const [form, setForm] = useState({
    venue_id:'', machine_id:'', reported_by:'',
    title:'', description:'', priority:'medium',
    is_self_fix: false, technician_id:'',
  })

  useEffect(() => {
    Promise.all([venuesApi.list(), techsApi.list()]).then(([v, t]) => {
      setVenues(v); setTechs(t)
    })
  }, [])

  useEffect(() => {
    if (!form.venue_id) { setMachines([]); return }
    machinesApi.list({ venue_id: form.venue_id }).then(setMachines)
  }, [form.venue_id])

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  function handlePhoto(e) {
    const files = Array.from(e.target.files)
    const previews = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setPhotos(p => [...p, ...previews])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.venue_id || !form.machine_id || !form.reported_by || !form.title || !form.description) {
      setError('Please fill in all required fields'); return
    }
    setLoading(true); setError(null)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      photos.forEach(p => fd.append('photos', p.file))
      const job = await jobsApi.create(fd)
      navigate(`/jobs/${job.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log fault')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
        <button onClick={() => navigate(-1)} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'8px', padding:'0.5rem 0.75rem', color:'#94a3b8', cursor:'pointer', fontSize:'0.8rem' }}>← Back</button>
        <h1 style={{ fontSize:'1.1rem', fontWeight:700 }}>Log a fault</h1>
      </div>

      {error && <div style={{ background:'#450a0a', border:'1px solid #7f1d1d', borderRadius:'10px', padding:'0.75rem', marginBottom:'1rem', color:'#fca5a5', fontSize:'0.8rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Venue *</label>
          <select value={form.venue_id} onChange={e => { set('venue_id', e.target.value); set('machine_id', '') }} style={inputStyle}>
            <option value="">Select venue...</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Machine *</label>
          <select value={form.machine_id} onChange={e => set('machine_id', e.target.value)} style={inputStyle} disabled={!form.venue_id}>
            <option value="">Select machine...</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Your name *</label>
          <input value={form.reported_by} onChange={e => set('reported_by', e.target.value)} placeholder="e.g. Robert" style={inputStyle} />
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Fault title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Screen flickering, machine not booting" style={inputStyle} />
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Describe what's wrong in as much detail as possible..." rows={4}
            style={{ ...inputStyle, resize:'vertical', lineHeight:'1.5' }} />
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Priority</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.375rem' }}>
            {['low','medium','high','critical'].map(p => (
              <button key={p} type="button" onClick={() => set('priority', p)}
                style={{ padding:'0.5rem', borderRadius:'8px', border:'1px solid', fontSize:'0.75rem', fontWeight:500, cursor:'pointer', textTransform:'capitalize',
                  background: form.priority === p ? (p==='critical'?'#450a0a':p==='high'?'#431407':p==='medium'?'#422006':'#14532d') : '#111',
                  color: form.priority === p ? (p==='critical'?'#fca5a5':p==='high'?'#fdba74':p==='medium'?'#fcd34d':'#86efac') : '#475569',
                  borderColor: form.priority === p ? (p==='critical'?'#7f1d1d':p==='high'?'#7c2d12':p==='medium'?'#78350f':'#14532d') : '#1a1a1a',
                }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:'1rem', background:'#111', border:'1px solid #1a1a1a', borderRadius:'10px', padding:'1rem' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer' }}>
            <input type="checkbox" checked={form.is_self_fix} onChange={e => set('is_self_fix', e.target.checked)}
              style={{ width:'18px', height:'18px', accentColor:'#22c55e' }} />
            <div>
              <div style={{ fontSize:'0.875rem', fontWeight:500 }}>I can fix this myself</div>
              <div style={{ fontSize:'0.75rem', color:'#475569', marginTop:'0.125rem' }}>Within your scope — no supplier callout needed</div>
            </div>
          </label>
        </div>

        {!form.is_self_fix && (
          <div style={{ marginBottom:'1rem' }}>
            <label style={labelStyle}>Assign technician</label>
            <select value={form.technician_id} onChange={e => set('technician_id', e.target.value)} style={inputStyle}>
              <option value="">Unassigned</option>
              {techs.map(t => <option key={t.id} value={t.id}>{t.name} ({t.region})</option>)}
            </select>
          </div>
        )}

        <div style={{ marginBottom:'1.5rem' }}>
          <label style={labelStyle}>Photos</label>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.5rem' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position:'relative' }}>
                <img src={p.url} style={{ width:'72px', height:'72px', objectFit:'cover', borderRadius:'8px', border:'1px solid #1a1a1a' }} />
                <button type="button" onClick={() => setPhotos(prev => prev.filter((_,j) => j!==i))}
                  style={{ position:'absolute', top:'-6px', right:'-6px', background:'#ef4444', border:'none', borderRadius:'50%', width:'18px', height:'18px', color:'#fff', fontSize:'0.65rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()}
              style={{ width:'72px', height:'72px', background:'#111', border:'1px dashed #334155', borderRadius:'8px', color:'#475569', fontSize:'1.5rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handlePhoto} style={{ display:'none' }} />
          <div style={{ fontSize:'0.7rem', color:'#475569' }}>Tap + to take a photo or upload from gallery</div>
        </div>

        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:'0.875rem', background: loading ? '#1a1a1a' : '#ef4444', color: loading ? '#475569' : '#fff', border:'none', borderRadius:'10px', fontSize:'0.9rem', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Logging fault...' : 'Log fault'}
        </button>
      </form>
    </div>
  )
}
