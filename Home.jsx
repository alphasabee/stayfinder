import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, Search } from 'lucide-react'

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    navigate(query ? `/properties?q=${encodeURIComponent(query)}` : '/properties')
  }

  return (
    <div>
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Compass className="w-10 h-10" />
            <h1 className="text-5xl font-bold">SpaceFinder</h1>
          </div>
          <p className="text-xl text-blue-100 mb-10">Find your perfect space — from cozy apartments to stunning villas</p>
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl shadow-lg overflow-hidden max-w-lg mx-auto">
            <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by city or country…"
              className="flex-1 px-4 py-4 text-gray-800 text-sm outline-none" />
            <button type="submit" className="bg-blue-600 text-white px-6 py-4 text-sm font-semibold hover:bg-blue-700">Search</button>
          </form>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why SpaceFinder?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { emoji: '🏡', title: 'Unique Spaces', desc: 'From city apartments to countryside retreats' },
            { emoji: '🔒', title: 'Secure Booking', desc: 'Your payment and data are always protected' },
            { emoji: '⭐', title: 'Verified Hosts', desc: 'Every listing is reviewed for quality' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-blue-50 border-t border-blue-100 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Have a space to share?</h2>
        <p className="text-gray-500 mb-6">Join hundreds of hosts earning with SpaceFinder</p>
        <a href="/auth/signup" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 inline-block">Become a Host</a>
      </div>
    </div>
  )
}
