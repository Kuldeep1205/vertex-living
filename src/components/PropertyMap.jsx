import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

// Fix Vite + Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '' });

// ── Properties with real Gurgaon coordinates ──────────────────
const MAP_PROPERTIES = [
  {
    id: 0,
    name: 'DLF The Dahlias',
    developer: 'DLF India',
    lat: 28.4295, lng: 77.0872,
    price: '₹65 Cr+', priceShort: '₹65Cr',
    location: 'Sector 54, Golf Course Rd',
    type: '4–6 BHK Penthouses',
    status: 'Under Construction',
    tag: 'Ultra Luxury', tagColor: 'gold',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=320&h=200&fit=crop&q=80',
    beds: '4–6 BHK', area: '9,500–16,000 sq.ft',
    amenities: ['Smart Home', 'Plunge Pool', 'Spa', 'Concierge'],
  },
  {
    id: 1,
    name: 'Godrej Meridien',
    developer: 'Godrej Properties',
    lat: 28.5016, lng: 77.0328,
    price: '₹1.62 Cr+', priceShort: '₹1.6Cr',
    location: 'Sector 106, Dwarka Expwy',
    type: '2–4 BHK Apartments',
    status: 'Ready to Move',
    tag: 'Best Value', tagColor: 'green',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=320&h=200&fit=crop&q=80',
    beds: '2–4 BHK', area: '1,200–3,000 sq.ft',
    amenities: ['Cineplex', 'Olympic Pool', 'Art Gallery', 'Wine Tasting'],
  },
  {
    id: 2,
    name: 'Elan The Presidential',
    developer: 'Elan Group',
    lat: 28.4972, lng: 77.0301,
    price: '₹3.35 Cr+', priceShort: '₹3.3Cr',
    location: 'Sector 106, Dwarka Expwy',
    type: '3–5 BHK Luxury',
    status: 'Under Construction',
    tag: 'Premium Pick', tagColor: 'purple',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=320&h=200&fit=crop&q=80',
    beds: '3–5 BHK', area: '1,800–3,500+ sq.ft',
    amenities: ['Horse-Riding', 'Shooting Range', 'Floating Sauna', 'Amphitheatre'],
  },
  {
    id: 3,
    name: 'Sobha City',
    developer: 'Sobha Limited',
    lat: 28.4954, lng: 77.0267,
    price: '₹1.40 Cr+', priceShort: '₹1.4Cr',
    location: 'Sector 108, Dwarka Expwy',
    type: '2–4 BHK Apartments',
    status: 'Ready to Move',
    tag: 'Top Rated', tagColor: 'blue',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=320&h=200&fit=crop&q=80',
    beds: '2–4 BHK', area: '1,380–2,342 sq.ft',
    amenities: ['Resort Lakelet', 'Mega Clubhouse', 'Urban Green', 'Island Deck'],
  },
  {
    id: 4,
    name: 'Smartworld Orchard',
    developer: 'Smartworld Developers',
    lat: 28.4068, lng: 77.0540,
    price: '₹2.21 Cr+', priceShort: '₹2.2Cr',
    location: 'Sector 61, Golf Course Ext',
    type: '2–3 BHK Low-Rise Floors',
    status: 'Ready to Move',
    tag: 'Ready Now', tagColor: 'teal',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=320&h=200&fit=crop&q=80',
    beds: '2–3 BHK', area: '1,200–2,200 sq.ft',
    amenities: ['Private Terraces', 'Sun Deck Pool', 'Lounge Café', 'Yoga Rooms'],
  },
  {
    id: 5,
    name: 'Central Park Flower Valley',
    developer: 'Central Park',
    lat: 28.4180, lng: 77.0390,
    price: '₹2.42 Cr+', priceShort: '₹2.4Cr',
    location: 'Sector 32–33, Sohna Road',
    type: 'Apartments, Villas & Floors',
    status: 'Ready to Move',
    tag: 'Township', tagColor: 'orange',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=320&h=200&fit=crop&q=80',
    beds: '3–4 BHK + Villas', area: '1,800–6,500 sq.ft',
    amenities: ['500 Acres', '10 Sports Academies', 'Golf Academy', 'Organic Farm'],
  },
  {
    id: 6,
    name: 'M3M Antalya Hills',
    developer: 'M3M India',
    lat: 28.4195, lng: 77.0052,
    price: '₹1.45 Cr+', priceShort: '₹1.4Cr',
    location: 'Sector 79, Dwarka Expwy',
    type: '2.5–3.5 BHK Apartments',
    status: 'Under Construction',
    tag: 'New Launch', tagColor: 'red',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=320&h=200&fit=crop&q=80',
    beds: '2.5–3.5 BHK', area: '1,200–2,000 sq.ft',
    amenities: ['Dual Clubhouses', 'Mini Theatre', 'Cycling Tracks', 'Spa'],
  },
  {
    id: 7,
    name: 'Signature Global City 37D',
    developer: 'Signature Global',
    lat: 28.5072, lng: 77.0396,
    price: '₹61 Lac+', priceShort: '₹61L',
    location: 'Sector 37D, Dwarka Expwy',
    type: '2–3 BHK Independent Floors',
    status: 'Ready to Move',
    tag: 'Affordable', tagColor: 'lime',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=320&h=200&fit=crop&q=80',
    beds: '2–3 BHK', area: '990–1,440 sq.ft',
    amenities: ['Cricket Pitch', 'Skating Rink', 'Dedicated Lift', 'Basketball'],
  },
];

const FILTERS = [
  { key: 'all',   label: 'All' },
  { key: 'ready', label: '🔑 Ready to Move' },
  { key: 'uc',    label: '🏗️ Under Construction' },
  { key: 'value', label: '💰 Under ₹2 Cr' },
  { key: 'lux',   label: '👑 Luxury ₹5Cr+' },
];

// ── Map fly-to controller ──────────────────────────────────────
const FlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.1, easeLinearity: 0.3 });
  }, [target, map]);
  return null;
};

// ── Create custom price pin divIcon ───────────────────────────
const createPriceIcon = (priceShort, isActive, isHovered) => {
  const cls = ['price-pin', isActive ? 'pin-active' : '', isHovered ? 'pin-hovered' : ''].filter(Boolean).join(' ');
  return L.divIcon({
    className: '',
    html: `<div class="${cls}"><span>${priceShort}</span></div>`,
    iconSize: [80, 34],
    iconAnchor: [40, 42],
    popupAnchor: [0, -46],
  });
};

// ── Main Component ─────────────────────────────────────────────
const PropertyMap = ({ onViewDetails }) => {
  const [activeId,  setActiveId]  = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [filter,    setFilter]    = useState('all');
  const [flyTarget, setFlyTarget] = useState(null);
  const listRefs    = useRef({});

  const filtered = MAP_PROPERTIES.filter((p) => {
    if (filter === 'ready') return p.status === 'Ready to Move';
    if (filter === 'uc')    return p.status === 'Under Construction';
    if (filter === 'value') return parseFloat(p.price.replace(/[₹,Lac+\s]/g, '')) < 200;
    if (filter === 'lux')   return p.price.includes('Cr') && parseFloat(p.price.replace(/[₹,Cr+\s]/g, '')) >= 5;
    return true;
  });

  const selectProperty = useCallback((property) => {
    setActiveId(property.id);
    setFlyTarget(property);
    // Scroll listing card into view
    const el = listRefs.current[property.id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <section className="map-section" id="map">
      {/* Header */}
      <div className="map-section-header">
        <div className="map-header-left">
          <div className="map-badge">
            <span className="map-badge-icon">📍</span>
            <span>Live Map</span>
          </div>
          <h2 className="map-section-title">
            Explore Properties <span className="map-title-accent">on the Map</span>
          </h2>
          <p className="map-section-sub">
            {MAP_PROPERTIES.length} premium properties across Gurugram — hover to preview, click to explore
          </p>
        </div>

        {/* Filters */}
        <div className="map-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`map-filter-btn${filter === f.key ? ' map-filter-active' : ''}`}
              onClick={() => { setFilter(f.key); setActiveId(null); }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout */}
      <div className="map-layout">

        {/* ── Left: listings panel ── */}
        <div className="map-listings-panel">
          <div className="map-listings-count">
            <span className="mlc-num">{filtered.length}</span> properties found
          </div>

          <div className="map-listings-scroll">
            {filtered.map((property) => {
              const isActive  = activeId  === property.id;
              const isHovered = hoveredId === property.id;
              return (
                <div
                  key={property.id}
                  ref={(el) => (listRefs.current[property.id] = el)}
                  className={`map-listing-card${isActive ? ' card-active' : ''}${isHovered ? ' card-hovered' : ''}`}
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => selectProperty(property)}
                >
                  {/* Thumbnail */}
                  <div className="mlc-img-wrap">
                    <img src={property.image} alt={property.name} className="mlc-img" loading="lazy" />
                    <span className={`mlc-tag mlc-tag-${property.tagColor}`}>{property.tag}</span>
                  </div>

                  {/* Info */}
                  <div className="mlc-info">
                    <div className="mlc-developer">{property.developer}</div>
                    <div className="mlc-name">{property.name}</div>
                    <div className="mlc-loc">📍 {property.location}</div>

                    <div className="mlc-bottom">
                      <div className="mlc-price">{property.price}</div>
                      <span className={`mlc-status ${property.status === 'Ready to Move' ? 'st-ready' : 'st-uc'}`}>
                        {property.status === 'Ready to Move' ? '🔑 Ready' : '🏗️ UC'}
                      </span>
                    </div>

                    <div className="mlc-meta">
                      <span>🛏 {property.beds}</span>
                      <span>📐 {property.area}</span>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && <div className="mlc-active-bar" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: map ── */}
        <div className="map-container-wrap">
          <MapContainer
            center={[28.4595, 77.0266]}
            zoom={12}
            className="leaflet-map"
            zoomControl={false}
            attributionControl={true}
          >
            {/* Dark premium tiles */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={20}
            />

            <FlyTo target={flyTarget} />

            {filtered.map((property) => {
              const isActive  = activeId  === property.id;
              const isHovered = hoveredId === property.id;
              return (
                <Marker
                  key={`${property.id}-${isActive}-${isHovered}`}
                  position={[property.lat, property.lng]}
                  icon={createPriceIcon(property.priceShort, isActive, isHovered)}
                  eventHandlers={{
                    mouseover: () => setHoveredId(property.id),
                    mouseout:  () => setHoveredId(null),
                    click:     () => selectProperty(property),
                  }}
                >
                  <Popup className="map-popup">
                    <div className="popup-card">
                      <img src={property.image} alt={property.name} className="popup-img" />
                      <div className="popup-body">
                        <div className="popup-developer">{property.developer}</div>
                        <div className="popup-name">{property.name}</div>
                        <div className="popup-loc">📍 {property.location}</div>
                        <div className="popup-price">{property.price}</div>
                        <div className="popup-chips">
                          {property.amenities.slice(0, 2).map((a, i) => (
                            <span key={i} className="popup-chip">{a}</span>
                          ))}
                        </div>
                        <div className="popup-actions">
                          <button
                            className="popup-btn-primary"
                            onClick={() => onViewDetails && onViewDetails(property)}
                          >
                            View Details
                          </button>
                          <a
                            href="https://wa.me/919671009931"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-btn-wa"
                          >
                            💬
                          </a>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map overlay UI */}
          <div className="map-top-right">
            <div className="map-legend">
              <div className="legend-row"><span className="legend-dot dot-ready" />Ready to Move</div>
              <div className="legend-row"><span className="legend-dot dot-uc" />Under Construction</div>
            </div>
          </div>

          {/* Active property detail strip */}
          {activeId !== null && (() => {
            const p = MAP_PROPERTIES.find((x) => x.id === activeId);
            return p ? (
              <div className="map-detail-strip">
                <img src={p.image} alt={p.name} className="strip-img" />
                <div className="strip-info">
                  <div className="strip-name">{p.name}</div>
                  <div className="strip-loc">📍 {p.location}</div>
                  <div className="strip-price">{p.price}</div>
                </div>
                <div className="strip-actions">
                  <button className="strip-btn-primary" onClick={() => onViewDetails && onViewDetails(
                    // Map to AI_PICKS format for modal compatibility
                    { ...p, about: `${p.name} is a premium property in ${p.location}.`, highlights: p.amenities, configurations: [] }
                  )}>
                    Full Details
                  </button>
                  <button className="strip-close" onClick={() => { setActiveId(null); setFlyTarget(null); }}>✕</button>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </div>
    </section>
  );
};

export default PropertyMap;
