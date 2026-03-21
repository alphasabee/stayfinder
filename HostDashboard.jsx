import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'
import { Plus, Pencil, Trash2, Calendar, Users, DollarSign, CheckCircle2, XCircle, Building2 } from 'lucide-react'

const STATUS_STYLE = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' }

export default function HostDashboard() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('listings')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: props } = await supabase.from('properties').select('*').eq('host_id', user.id).order('created_at', { ascending: false })
      const ids = (props || []).map(p => p.id)
      const { data: bkgs } = ids.length > 0
        ? await supabase.from('bookings').select('*, properties(title, photos)').in('property_id', ids).order('created_at', { ascending: false })
        : { data: [] }
      setProperties(props || [])
      setBookings(bkgs || [])
      setLoading(false)
    }
    load()
  }, [user])

  async function deleteProperty(id) {
    if (!confirm('Delete this property? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('properties').delete().eq('id', id)
    setProperties(p => p.filter(x => x.id !== id))
    setDeleting(null)
  }

  async function updateBooking(id, status) {
    setUpdating(id)
    const { data } = await supabase.from('bookings').update({ status }).eq('id', id).select().single()
    if (data) setBookings(b => b.map(x => x.id === id ? data : x))
    setUpdating(null)
  }

  const revenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.total_price, 0)
  const pending = bookings.filter(b => b.status === 'pending').length

  if (loading) return <div className="flex items-center justify-center py-32"><p className="text-gray-400">Loading…</p></div>

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your listings and bookings</p>
        </div>
        <Link to="/host/properties/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" />Add Listing
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[{ label: 'Listings', value: properties.length, icon: <Building2 className="w-5 h-5" /> },
          { label: 'Total Bookings', value: bookings.length, icon: <Calendar className="w-5 h-5" /> },
          { label: 'Pending', value: pending, icon: <Users className="w-5 h-5" /> },
          { label: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" /> }
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">{s.icon}</div>
            <div><div className="text-lg font-bold text-gray-900">{s.value}</div><div className="text-xs text-gray-500">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="flex border-b border-gray-200 mb-6">
        {[['listings', `My Listings (${properties.length})`], ['bookings', `Bookings (${bookings.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`pb-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
            {key === 'bookings' && pending > 0 && <span className="ml-1.5 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">{pending} new</span>}
          </button>
        ))}
      </div>
      {tab === 'listings' && (
        properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">You haven't listed any spaces yet.</p>
            <Link to="/host/properties/new" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700">Create your first listing</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                <img src={p.photos?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200'} alt={p.title} className="w-24 h-20 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/properties/${p.id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm">{p.title}</Link>
                      <p className="text-gray-500 text-xs mt-0.5">{p.city}, {p.country} · ${p.price}/night</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.available ? 'Active' : 'Hidden'}</span>
                      <Link to={`/host/properties/${p.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></Link>
                      <button onClick={() => deleteProperty(p.id)} disabled={deleting === p.id} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {tab === 'bookings' && (
        bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-500">No bookings yet.</p></div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <img src={b.properties?.photos?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200'} alt="" className="w-16 h-14 object-cover rounded-lg shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{b.properties?.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{b.check_in} → {b.check_out}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{b.guests} guest{b.guests !== 1 ? 's' : ''}</span>
                        <span className="font-medium text-gray-900">${b.total_price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[b.status]}`}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                    {b.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => updateBooking(b.id, 'confirmed')} disabled={updating === b.id} className="flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"><CheckCircle2 className="w-3.5 h-3.5" />Confirm</button>
                        <button onClick={() => updateBooking(b.id, 'cancelled')} disabled={updating === b.id} className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-200 disabled:opacity-50"><XCircle className="w-3.5 h-3.5" />Decline</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </main>
  )
}
