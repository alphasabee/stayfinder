import { Link } from 'react-router-dom'
import { MapPin, Users, BedDouble, Bath, Star } from 'lucide-react'

export default function PropertyCard({ property }) {
  const photo = property.photos?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
  return (
    <Link to={`/properties/${property.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={photo} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-sm font-medium">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /><span>4.8</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">{property.title}</h3>
          <div className="text-right shrink-0">
            <span className="font-bold text-gray-900">${property.price}</span>
            <span className="text-gray-500 text-xs"> /night</span>
          </div>
        </div>
        <p className="text-gray-500 text-xs flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3 shrink-0" />{property.city}, {property.country}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{property.max_guests} guests</span>
          <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  )
}
