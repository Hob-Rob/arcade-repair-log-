import { useState, useEffect } from 'react'
import { machinesApi, venuesApi, techsApi } from '../services/api.js'

const inputStyle = { width:'100%', padding:'0.625rem', background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:'8px', color:'#e2e8f0', fontSize:'0.8rem', outline:'none', marginTop:'0.25rem' }
const labelStyle = { fontSize:'0.7rem', color:'#64748b', display:'block' }

export default function MachinesPage() {
  const [tab, setTab]           = useState('machines')
  const [machines, setMachines] = useState([])
  const [venues, setVenues]     = useState([])
  const [techs, setTechs]       = useState([])
  const [venueId, setVenueId]   = useState('')
  const [showAdd, setShowAdd]   = useState(false)

  const [machineForm, setMachineForm] = useState({ venue_id:'', name:'', manufacturer:'', model:'', serial_number:'', location_in_venue:'' })
  const [venueForm, setVenueForm]     = useState({ name:'', location:'' })
  const [techForm, setTechForm]       = useState({ name:'', company:'', phone:'', email:'', region:'' })

  function loadAll() {
    venuesApi.list().then(setVenues)
    machinesApi.list(venueId ? { venue_id: venueId } : {}).then(setMachines)
    techsApi.list().then(setTechs)
  }

  useEffect(() => { loadAll() }, [])
  useEffect(() => {
    machinesApi.list(venueId ? { venue_id: venueId } : {}).then(setMachines)
  }, [venueId])

  async function handleAddMachine(e) {
    e.preventDefault()
    await machinesApi.create(machineForm)
    setShowAdd(false)
    setMachineForm({ venue_id:'', name:'', manufacturer:'', model:'', serial_number:'', location_in_venue:'' })
    loadAll()
  }

  async function handleAddVenue(e) {
    e.preventDefault()
    await venuesApi.create(venueForm)
    setShowAdd(false)
    setVenueForm({ name:'', location:'' })
    loadAll()
  }

  async function handleAddTech(e) {
    e.preventDefault()
    await techsApi.create(techForm)
    setShowAdd(false)
    setTechForm({ name:'', company:'', phone:'', email:'', region:'' })
    loadAll()
  }

  const tabStyle = (active) => ({
    flex:1, padding:'0.5rem', fontSize:'0.75rem', fontWeight:500, cursor:'pointer', border:'none',
    background: active ? '#ef4444' : '#111',
    color: active ? '#fff' : '#64748b',
    borderBottom: active ? '2px solid #ef4444' : '2px solid #1a1a1a',
  })

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <h1 style={{ fontSize:'1.1rem', fontWeight:700 }}>Manage</h1>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 0.75rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
          + Add
        </button>
      </div>

      <div style={{ display:'flex', marginBottom:'1rem', background:'#111', borderRadius:'8px', overflow:'hidden' }}>
        {[['machines','Machines'],['venues','Venues'],['techs','Technicians']].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setShowAdd(false) }} style={tabStyle(tab===id)}>{label}</button>
        ))}
      </div>

      {/* ADD FORMS */}
      {showAdd && tab === 'venues' && (
        <form onSubmit={handleAddVenue} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.75rem', fontWeight:500 }}>Add venue</div>
          <div style={{ marginBottom:'0.625rem' }}>
            <label style={labelStyle}>Venue name *</label>
            <input value={venueForm.name} onChange={e => setVenueForm(p=>({...p,name:e.target.value}))} style={inputStyle} required placeholder="e.g. Level X Glasgow" />
          </div>
          <div style={{ marginBottom:'0.75rem' }}>
            <label style={labelStyle}>Location</label>
            <input value={venueForm.location} onChange={e => setVenueForm(p=>({...p,location:e.target.value}))} style={inputStyle} placeholder="e.g. Glasgow" />
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button type="submit" style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', cursor:'pointer' }}>Save</button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background:'transparent', color:'#64748b', border:'1px solid #1a1a1a', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', cursor:'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {showAdd && tab === 'machines' && (
        <form onSubmit={handleAddMachine} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.75rem', fontWeight:500 }}>Add machine</div>
          {[['venue_id','Venue','select'],['name','Machine name','text'],['manufacturer','Manufacturer','text'],['model','Model','text'],['serial_number','Serial number','text'],['location_in_venue','Location in venue','text']].map(([field, label, type]) => (
            <div key={field} style={{ marginBottom:'0.625rem' }}>
              <label style={labelStyle}>{label}</label>
              {type === 'select'
                ? <select value={machineForm[field]} onChange={e => setMachineForm(p=>({...p,[field]:e.target.value}))} style={inputStyle} required>
                    <option value="">Select venue...</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                : <input value={machineForm[field]} onChange={e => setMachineForm(p=>({...p,[field]:e.target.value}))} style={inputStyle} required={field==='name'} />
              }
            </div>
          ))}
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
            <button type="submit" style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', cursor:'pointer' }}>Save</button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background:'transparent', color:'#64748b', border:'1px solid #1a1a1a', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', cursor:'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {showAdd && tab === 'techs' && (
        <form onSubmit={handleAddTech} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.75rem', fontWeight:500 }}>Add technician</div>
          {[['name','Name'],['company','Company'],['phone','Phone'],['email','Email'],['region','Region / area covered']].map(([field, label]) => (
            <div key={field} style={{ marginBottom:'0.625rem' }}>
              <label style={labelStyle}>{label}</label>
              <input value={techForm[field]} onChange={e => setTechForm(p=>({...p,[field]:e.target.value}))} style={inputStyle} required={field==='name'} />
            </div>
          ))}
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
            <button type="submit" style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', cursor:'pointer' }}>Save</button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background:'transparent', color:'#64748b', border:'1px solid #1a1a1a', borderRadius:'8px', padding:'0.5rem 0.875rem', fontSize:'0.8rem', cursor:'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* VENUES LIST */}
      {tab === 'venues' && (
        venues.length === 0
          ? <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'2rem', textAlign:'center', color:'#475569', fontSize:'0.875rem' }}>No venues yet — add one above</div>
          : venues.map(v => (
            <div key={v.id} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.625rem' }}>
              <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{v.name}</div>
              {v.location && <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:'0.25rem' }}>{v.location}</div>}
            </div>
          ))
      )}

      {/* MACHINES LIST */}
      {tab === 'machines' && (
        <>
          <select value={venueId} onChange={e => setVenueId(e.target.value)}
            style={{ width:'100%', padding:'0.625rem', background:'#111', border:'1px solid #1a1a1a', borderRadius:'8px', color:'#e2e8f0', fontSize:'0.8rem', outline:'none', marginBottom:'1rem' }}>
            <option value="">All venues</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          {machines.length === 0
            ? <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'2rem', textAlign:'center', color:'#475569', fontSize:'0.875rem' }}>No machines yet — add one above</div>
            : machines.map(m => (
              <div key={m.id} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.625rem' }}>
                <div style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:'0.25rem' }}>{m.name}</div>
                <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.25rem' }}>{m.manufacturer}{m.model ? ` · ${m.model}` : ''}</div>
                <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'0.7rem', background:'#1a1a1a', color:'#64748b', padding:'2px 6px', borderRadius:'4px' }}>{m.venue_name}</span>
                  {m.location_in_venue && <span style={{ fontSize:'0.7rem', background:'#1a1a1a', color:'#64748b', padding:'2px 6px', borderRadius:'4px' }}>{m.location_in_venue}</span>}
                  {m.serial_number && <span style={{ fontSize:'0.7rem', background:'#1a1a1a', color:'#475569', padding:'2px 6px', borderRadius:'4px' }}>S/N: {m.serial_number}</span>}
                </div>
              </div>
            ))
          }
        </>
      )}

      {/* TECHNICIANS LIST */}
      {tab === 'techs' && (
        techs.length === 0
          ? <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'2rem', textAlign:'center', color:'#475569', fontSize:'0.875rem' }}>No technicians yet — add one above</div>
          : techs.map(t => (
            <div key={t.id} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'1rem', marginBottom:'0.625rem' }}>
              <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{t.name}</div>
              <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:'0.25rem' }}>{t.company}{t.region ? ` · ${t.region}` : ''}</div>
              {t.phone && <a href={`tel:${t.phone}`} style={{ fontSize:'0.75rem', color:'#ef4444', display:'block', marginTop:'0.25rem' }}>{t.phone}</a>}
            </div>
          ))
      )}
    </div>
  )
}
