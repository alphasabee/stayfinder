import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'
import { MapPin, Calendar, Users, XCircle } from 'lucide-react'

const STATUS_STYLE = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' }

export default function GuestDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    supabase.from('bookings').select('*, properties(title, city, photos)').eq('guest_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false) })
  }, [user])

  async function handleCancel(id) {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    const { data } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id).select().single()
    if (data) setBookings(b => b.map(x => x.id === id ? data : x))
    setCancelling(null)
  }

  const upcoming = bookings.filter(b => b.status !== 'cancelled' && new Date(b.check_out) >= new Date())
  const past = bookings.filter(b => b.status === 'cancelled' || new Date(b.check_out) < new Date())

  if (loading) return <div className="flex items-center justify-center py-32"><p className="text-gray-400">Loading…</p></div>

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <p className="text-gray-500 mt-1">Your upcoming and past reservations</p>
      </div>
      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-2">No trips yet</p>
          <p className="text-gray-400 text-sm mb-6">Start exploring spaces and book your next adventure</p>
          <Link to="/properties" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700">Browse Spaces</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Trips</h2>
              <div className="space-y-4">{upcoming.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} />)}</div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Trips</h2>
              <div className="space-y-4">{past.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} isPast />)}</div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}

function BookingCard({ booking: b, onCancel, cancelling, isPast }) {
  const photo = b.properties?.photos?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200'
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${isPast ? 'opacity-70' : ''}`}>
      <div className="flex gap-4">
        <Link to={`/properties/${b.property_id}`}>
          <img src={photo} alt={b.properties?.title} className="w-24 h-20 object-cover rounded-lg shrink-0 hover:opacity-90" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/properties/${b.property_id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm">{b.properties?.title}</Link>
              <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{b.properties?.city}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{b.check_in} → {b.check_out}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{b.guests} guest{b.guests !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">Total: ${b.total_price}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[b.status]}`}>
                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
              </span>
              {b.status === 'pending' && !isPast && (
                <button onClick={() => onCancel(b.id)} disabled={cancelling === b.id}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-50">
                  <XCircle className="w-3.5 h-3.5" />Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
