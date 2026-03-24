import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from './supabase'
import PropertyCard from './PropertyCard'
import { Search } from 'lucide-react'

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')

  async function fetchProperties(search = '') {
    setLoading(true)
    let q = supabase.from('properties').select('*').eq('available', true).order('created_at', { ascending: false })
    if (search) q = q.or(`city.ilike.%${search}%,country.ilike.%${search}%,title.ilike.%${search}%`)
    const { data, error } = await q
    if (!error) setProperties(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProperties(searchParams.get('q') || '') }, [searchParams])

  function handleSearch(e) {
    e.preventDefault()
    if (query) setSearchParams({ q: query })
    else setSearchParams({})
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
        <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-xl px-3 gap-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search city, country, or keyword…"
            className="flex-1 py-2.5 text-sm outline-none" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700">Search</button>
        {searchParams.get('q') && (
          <button type="button" onClick={() => { setQuery(''); setSearchParams({}) }} className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Clear</button>
        )}
      </form>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {searchParams.get('q') ? `Results for "${searchParams.get('q')}"` : 'All Spaces'}
          {!loading && <span className="text-gray-400 font-normal text-base ml-2">({properties.length})</span>}
        </h1>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-2">No spaces found</p>
          <p className="text-gray-400 text-sm">Try a different search or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </main>
  )
}
