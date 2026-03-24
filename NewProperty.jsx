import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'
import { Upload, X } from 'lucide-react'

const AMENITIES = ['WiFi','TV','Kitchen','Air conditioning','Heating','Washing machine','Dishwasher','Free parking','Swimming pool','Hot tub','Gym','Balcony','Pet friendly','Wheelchair accessible']
const MAX_PHOTOS = 5
const MAX_SIZE_MB = 2
const BUCKET = 'photos'

export default function NewProperty() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [price, setPrice] = useState('')
  const [maxGuests, setMaxGuests] = useState('2')
  const [bedrooms, setBedrooms] = useState('1')
  const [bathrooms, setBathrooms] = useState('1')
  const [amenities, setAmenities] = useState([])
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [photos, setPhotos] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    supabase.from('properties').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setTitle(data.title); setDescription(data.description); setLocation(data.location)
      setCity(data.city); setCountry(data.country); setPrice(String(data.price))
      setMaxGuests(String(data.max_guests)); setBedrooms(String(data.bedrooms)); setBathrooms(String(data.bathrooms))
      setPhotos(data.photos || []); setAmenities(data.amenities || []); setAvailable(data.available)
    })
  }, [id, isEdit])

  function handleFileChange(e) {
    setPhotoError('')
    const files = Array.from(e.target.files)
    const totalCount = photos.length + newFiles.length + files.length
    if (totalCount > MAX_PHOTOS) { setPhotoError(`Max ${MAX_PHOTOS} photos allowed.`); return }
    const oversized = files.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024)
    if (oversized.length > 0) { setPhotoError(`Each photo must be under ${MAX_SIZE_MB}MB.`); return }
    setNewFiles(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  function removeExistingPhoto(url) { setPhotos(prev => prev.filter(p => p !== url)) }

  function removeNewPhoto(index) {
    URL.revokeObjectURL(previews[index])
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadPhotos() {
    if (newFiles.length === 0) return []
    setUploading(true)
    const urls = []
    for (const file of newFiles) {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) { setUploading(false); throw new Error(`Upload failed: ${upErr.message}`) }
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
      urls.push(urlData.publicUrl)
    }
    setUploading(false)
    return urls
  }

  function toggleAmenity(a) { setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]) }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      const uploadedUrls = await uploadPhotos()
      const payload = {
        title, description, location, city, country,
        price: Number(price), max_guests: Number(maxGuests),
        bedrooms: Number(bedrooms), bathrooms: Number(bathrooms),
        photos: [...photos, ...uploadedUrls], amenities, available, host_id: user.id
      }
      const { error: err } = isEdit
        ? await supabase.from('properties').update(payload).eq('id', id)
        : await supabase.from('properties').insert(payload)
      if (err) throw new Error(err.message)
      navigate('/host/dashboard')
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const totalPhotos = photos.length + newFiles.length

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isEdit ? 'Edit Space' : 'List Your Space'}</h1>
      <p className="text-gray-500 mb-8">{isEdit ? 'Update your space details.' : 'Share your space with travellers around the world.'}</p>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl border border-gray-200 p-8">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Cozy apartment in city center" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your space…" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" /></div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Full address *</label>
              <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Downtown Lagos" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="Lagos" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input type="text" required value={country} onChange={e => setCountry(e.target.value)} placeholder="Nigeria" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ label:'Price/night ($) *', value:price, set:setPrice, min:1 },{ label:'Max guests *', value:maxGuests, set:setMaxGuests, min:1, max:50 },{ label:'Bedrooms *', value:bedrooms, set:setBedrooms, min:0, max:20 },{ label:'Bathrooms *', value:bathrooms, set:setBathrooms, min:0, max:20 }].map(f => (
              <div key={f.label}><label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type="number" required min={f.min} max={f.max} value={f.value} onChange={e => f.set(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Photos</h2>
          <p className="text-xs text-gray-500 mb-4">Up to {MAX_PHOTOS} photos · Max {MAX_SIZE_MB}MB each</p>
          {photoError && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{photoError}</div>}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
            {photos.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingPhoto(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                {i === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">Cover</span>}
              </div>
            ))}
            {previews.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewPhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                <span className="absolute bottom-1 left-1 bg-blue-500/80 text-white text-xs px-1.5 py-0.5 rounded">New</span>
              </div>
            ))}
            {totalPhotos < MAX_PHOTOS && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Add photo</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileChange} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">{totalPhotos}/{MAX_PHOTOS} photos added</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES.map(a => (
              <label key={a} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer text-sm transition-colors ${amenities.includes(a) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} className="sr-only" />
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${amenities.includes(a) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                  {amenities.includes(a) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>{a}
              </label>
            ))}
          </div>
        </section>

        <section>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setAvailable(!available)} className={`relative w-12 h-6 rounded-full transition-colors ${available ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${available ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
            <div><div className="text-sm font-medium text-gray-900">Available for booking</div>
              <div className="text-xs text-gray-500">Toggle off to temporarily hide this listing</div></div>
          </label>
        </section>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving || uploading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {uploading ? 'Uploading photos…' : saving ? 'Saving…' : isEdit ? 'Save Changes' : 'List Space'}
          </button>
          <button type="button" onClick={() => navigate('/host/dashboard')} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </main>
  )
}
