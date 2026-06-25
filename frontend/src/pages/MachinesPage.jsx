import { useState, useEffect } from 'react'
import { machinesApi, venuesApi } from '../services/api.js'

export default function MachinesPage() {
  const [machines, setMachines] = useState([])
  const [venues, setVenues]     = useState([])
  const [venueId, setVenueId]   = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [form, setForm] = useState({ venue_id:'', name:'', manufacturer:'', model:'', serial_number:'', location_in_venue:'' })

  useEffect(() => { venuesApi.list().then(setVenues) }, [])
  useEffect(() => {
    machinesApi.list(venueId ? { venue_id: venueId } : {}).then(setMachines)
  }, [venueId])

  const inputStyle = { width:'100%', padding:'0.625rem', background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:'8px', color:'#e2e8f0', fontSize:'0.8rem', outline:'none', marginTop:'0.25rem' }

  async function handleAdd(e) {
    e.preventDefault()
    await machinesApi.create(form)
    setShowAdd(false)
    setForm({ venue_id:'', name:'', manufacturer:'', model:'', serial_number:'', location_in_venue:'' })
    machinesApi.list(venueId ? { venue_id: venueId } : {}).then(setMachines)
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <h1 style={{ fontSize:'1.1rem', fontWeight:700 }}>Machines</h1>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 0.75rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
          + Add
        </button>
      </div>

      <select value={venueId} onChange={e => setVenueId(e.target.value)}
        style={{ width:'100%', padding:'0.625rem', background:'#111', border:'1px solid #1a1a1a', borderRadius:'8px', color:'#e2e8f0', fontSize:'0.8rem', outline:'none', marginBottom:'1rem' }}>
        <option value="">All venues</option>
        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>

      {showAdd && (
        <form onSubmit={handleAdd} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.75rem', fontWeight:500 }}>Add machine</div>
          {[['venue_id','Venue','select'],['name','Machine name','text'],['manufacturer','Manufacturer','text'],['model','Model','text'],['serial_number','Serial number','text'],['location_in_venue','Location in venue','text']].map(([field, label, type]) => (
            <div key={field} style={{ marginBottom:'0.625rem' }}>
              <label style={{ fontSize:'0.7rem', color:'#64748b', display:'block' }}>{label}</label>
              {type === 'select'
                ? <select value={form[field]} onChange={e => setForm(p => ({...p,[field]:e.target.value}))} style={inputStyle} required>
                    <option value="">Select venue...</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                : <input value={form[field]} onChange={e => setForm(p => ({...p,[field]:e.target.value}))} style={inputStyle} required={['name'].includes(field)} />
              }
            </div>
          ))}
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
            <button type="submit" style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', cursor:'pointer' }}>Save</button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background:'transparent', color:'#64748b', border:'1px solid #1a1a1a', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', cursor:'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {machines.map(m => (
        <div key={m.id} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.625rem' }}>
          <div style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:'0.25rem' }}>{m.name}</div>
          <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.25rem' }}>{m.manufacturer}{m.model ? ` · ${m.model}` : ''}</div>
          <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.7rem', background:'#1a1a1a', color:'#64748b', padding:'2px 6px', borderRadius:'4px' }}>{m.venue_name}</span>
            {m.location_in_venue && <span style={{ fontSize:'0.7rem', background:'#1a1a1a', color:'#64748b', padding:'2px 6px', borderRadius:'4px' }}>{m.location_in_venue}</span>}
            {m.serial_number && <span style={{ fontSize:'0.7rem', background:'#1a1a1a', color:'#475569', padding:'2px 6px', borderRadius:'4px' }}>S/N: {m.serial_number}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
