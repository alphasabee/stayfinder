import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'
import { MapPin, Users, BedDouble, Bath, Star, ChevronLeft, Wifi, Tv, UtensilsCrossed, Wind, Thermometer, WashingMachine, Car, Waves, Dumbbell, PawPrint, CheckCircle2, Calendar } from 'lucide-react'

const AMENITY_ICONS = {
  WiFi: <Wifi className="w-4 h-4" />, TV: <Tv className="w-4 h-4" />, Kitchen: <UtensilsCrossed className="w-4 h-4" />,
  'Air conditioning': <Wind className="w-4 h-4" />, Heating: <Thermometer className="w-4 h-4" />,
  'Washing machine': <WashingMachine className="w-4 h-4" />, 'Free parking': <Car className="w-4 h-4" />,
  'Swimming pool': <Waves className="w-4 h-4" />, 'Hot tub': <Waves className="w-4 h-4" />,
  Gym: <Dumbbell className="w-4 h-4" />, 'Pet friendly': <PawPrint className="w-4 h-4" />,
}

export default function PropertyDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState('')
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    supabase.from('properties').select('*, profiles(full_name)').eq('id', id).single()
      .then(({ data }) => { setProperty(data); setLoading(false) })
  }, [id])

  const today = new Date().toISOString().split('T')[0]
  const nights = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0
  const total = nights * (property?.price || 0)

  async function handleBook(e) {
    e.preventDefault()
    if (!user) return navigate('/auth/login')
    if (nights < 1) return setError('Please select valid dates.')
    setBooking(true); setError('')
    const { error: err } = await supabase.from('bookings').insert({
      property_id: id, guest_id: user.id, check_in: checkIn, check_out: checkOut, guests, total_price: total, status: 'pending',
    })
    if (err) setError(err.message)
    else setBooked(true)
    setBooking(false)
  }

  if (loading) return <div className="flex items-center justify-center py-32"><p className="text-gray-400">Loading…</p></div>
  if (!property) return <div className="text-center py-32 text-gray-500">Space not found.</div>

  if (booked) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-1">Your booking at <strong>{property.title}</strong> is pending host confirmation.</p>
      <p className="text-gray-400 text-sm mb-8">{checkIn} → {checkOut} · {guests} guest{guests > 1 ? 's' : ''} · ${total} total</p>
      <Link to="/guest/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700">View My Trips</Link>
    </div>
  )

  const photos = property.photos?.length ? property.photos : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/properties" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600 mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to spaces
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
        <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />4.8 (24 reviews)</span>
        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{property.location}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-8 h-80 md:h-96">
        <div className="relative"><img src={photos[activePhoto]} alt={property.title} className="w-full h-full object-cover" /></div>
        {photos.length > 1 && (
          <div className="grid grid-rows-2 gap-2">
            {photos.slice(1, 3).map((p, i) => (
              <img key={i} src={p} alt="" className="w-full h-full object-cover cursor-pointer hover:opacity-90" onClick={() => setActivePhoto(i + 1)} />
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="pb-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Hosted by {property.profiles?.full_name || 'Host'}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{property.max_guests} guests max</span>
              <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" />{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About this space</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>
          {property.amenities?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What this space offers</h3>
              <div className="grid grid-cols-2 gap-3">
                {property.amenities.map(a => (
                  <div key={a} className="flex items-center gap-3 text-gray-700">
                    <span className="text-gray-500">{AMENITY_ICONS[a] || <CheckCircle2 className="w-4 h-4" />}</span>{a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24">
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-2xl font-bold text-gray-900">${property.price}</span>
              <span className="text-gray-500 text-sm">/ night</span>
            </div>
            <form onSubmit={handleBook} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Check in</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" min={today} required value={checkIn} onChange={e => setCheckIn(e.target.value)}
                      className="w-full pl-8 pr-2 py-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Check out</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" min={checkIn || today} required value={checkOut} onChange={e => setCheckOut(e.target.value)}
                      className="w-full pl-8 pr-2 py-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                    {Array.from({ length: property.max_guests }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} guest{n !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {nights > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>${property.price} × {nights} night{nights !== 1 ? 's' : ''}</span><span>${property.price * nights}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total</span><span>${total}</span>
                  </div>
                </div>
              )}
              <button type="submit" disabled={booking}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {booking ? 'Processing…' : user ? 'Reserve' : 'Log in to book'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
