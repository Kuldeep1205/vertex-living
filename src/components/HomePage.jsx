import React, { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import StickyAssistant from './StickyAssistant';
import BookingModal from './BookingModal';

const PriceTimeline    = lazy(() => import('./PriceTimeline'));
const LifeSimulator    = lazy(() => import('./LifeSimulator'));
const CompareBar       = lazy(() => import('./CompareBar'));
const ChatWidget       = lazy(() => import('./ChatWidget'));
const Footer           = lazy(() => import('./Footer'));
const SavingsCalculator = lazy(() => import('./SavingsCalculator'));
const HowItWorks       = lazy(() => import('./HowItWorks'));
const BuilderCTA          = lazy(() => import('./BuilderCTA'));
const DualContactForm     = lazy(() => import('./DualContactForm'));
const BuilderListingPanel = lazy(() => import('./BuilderListingPanel'));
const BuyerProfilePanel   = lazy(() => import('./BuyerProfilePanel'));

const API = import.meta.env.VITE_API_URL || 'https://vertex-living-server.onrender.com';

const CinematicView        = lazy(() => import('./CinematicView'));
const PropertyMap          = lazy(() => import('./PropertyMap'));
const InteriorPreviewModal = lazy(() => import('./InteriorPreviewModal'));
const RoomPlanner          = lazy(() => import('./RoomPlanner'));
import {
  PropertyCardSkeleton,
  AgentCardSkeleton,
  FeatureCardSkeleton,
  StatSkeleton,
  SectionHeaderSkeleton,
} from './Skeleton';
import { PROPERTY_DETAILS } from '../data/properties';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useIntelligence, IntelligenceContext } from '../hooks/useIntelligence';
import SmartGreeting from './SmartGreeting';
import LiveActivity from './LiveActivity';
import MarketPulse from './MarketPulse';
import SocialProof from './SocialProof';
import './HomePage.css';
import './Skeleton.css';

// Comprehensive Property Database for Gurgaon/Gurugram
const PROPERTY_DATABASE = [
  // Sector 42
  { id: 1, name: 'DLF The Camellias', sector: 'Sector 42', location: 'DLF Phase 5, Sector 42, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 8.5, priceDisplay: '₹8.5 Cr', area: '5500 sqft', status: 'Ready to Move' },
  { id: 2, name: 'DLF Magnolias', sector: 'Sector 42', location: 'DLF Phase 5, Sector 42, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 7.8, priceDisplay: '₹7.8 Cr', area: '5200 sqft', status: 'Ready to Move' },
  { id: 3, name: 'DLF Aralias', sector: 'Sector 42', location: 'DLF Phase 5, Sector 42, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 9.2, priceDisplay: '₹9.2 Cr', area: '5800 sqft', status: 'Ready to Move' },

  // Sector 43
  { id: 4, name: 'DLF The Peak', sector: 'Sector 43', location: 'DLF Phase 5, Sector 43, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 6.5, priceDisplay: '₹6.5 Cr', area: '4800 sqft', status: 'Under Construction' },

  // Sector 49
  { id: 5, name: 'Vatika Seven Lamps', sector: 'Sector 49', location: 'Sohna Road, Sector 49, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.8, priceDisplay: '₹1.8 Cr', area: '2200 sqft', status: 'Ready to Move' },
  { id: 6, name: 'Vatika India Next', sector: 'Sector 49', location: 'Sohna Road, Sector 49, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.65, priceDisplay: '₹1.65 Cr', area: '1950 sqft', status: 'Ready to Move' },
  { id: 7, name: 'Raheja Revanta', sector: 'Sector 49', location: 'Sohna Road, Sector 49, Gurgaon', city: 'Gurgaon', type: 'Villa', bedrooms: 4, price: 4.5, priceDisplay: '₹4.5 Cr', area: '4500 sqft', status: 'Ready to Move' },
  { id: 8, name: 'Tulip Violet', sector: 'Sector 49', location: 'Sohna Road, Sector 49, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.45, priceDisplay: '₹1.45 Cr', area: '1750 sqft', status: 'Ready to Move' },
  { id: 9, name: 'ECHS Jaypee Greens', sector: 'Sector 49', location: 'Sohna Road, Sector 49, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.55, priceDisplay: '₹1.55 Cr', area: '1850 sqft', status: 'Ready to Move' },

  // Sector 57
  { id: 10, name: 'Spaze Privy', sector: 'Sector 57', location: 'Golf Course Road Ext, Sector 57, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 2.2, priceDisplay: '₹2.2 Cr', area: '2500 sqft', status: 'Ready to Move' },
  { id: 11, name: 'Emaar Palm Gardens', sector: 'Sector 57', location: 'Golf Course Road Ext, Sector 57, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 2.5, priceDisplay: '₹2.5 Cr', area: '2650 sqft', status: 'Ready to Move' },
  { id: 12, name: 'Vatika City', sector: 'Sector 57', location: 'Golf Course Road Ext, Sector 57, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.95, priceDisplay: '₹1.95 Cr', area: '2300 sqft', status: 'Ready to Move' },

  // Sector 65
  { id: 13, name: 'M3M Golf Estate', sector: 'Sector 65', location: 'Golf Course Road, Sector 65, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 4.2, priceDisplay: '₹4.2 Cr', area: '4200 sqft', status: 'Ready to Move' },
  { id: 14, name: 'Emerald Hills', sector: 'Sector 65', location: 'Golf Course Road, Sector 65, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 6.8, priceDisplay: '₹6.8 Cr', area: '5200 sqft', status: 'Ready to Move' },
  { id: 15, name: 'Bestech Park View', sector: 'Sector 65', location: 'Golf Course Road, Sector 65, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 2.8, priceDisplay: '₹2.8 Cr', area: '2800 sqft', status: 'Under Construction' },
  { id: 16, name: 'M3M Woodshire', sector: 'Sector 65', location: 'Golf Course Road, Sector 65, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 3.8, priceDisplay: '₹3.8 Cr', area: '3800 sqft', status: 'Ready to Move' },

  // Sector 66
  { id: 17, name: 'Tata Primanti', sector: 'Sector 66', location: 'Gurgaon-Faridabad Road, Sector 66, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 3.5, priceDisplay: '₹3.5 Cr', area: '3500 sqft', status: 'Ready to Move' },
  { id: 18, name: 'Tata Primanti Villa', sector: 'Sector 66', location: 'Gurgaon-Faridabad Road, Sector 66, Gurgaon', city: 'Gurgaon', type: 'Villa', bedrooms: 4, price: 5.2, priceDisplay: '₹5.2 Cr', area: '5000 sqft', status: 'Ready to Move' },

  // Sector 67
  { id: 19, name: 'Raheja Oma', sector: 'Sector 67', location: 'Gurgaon-Faridabad Road, Sector 67, Gurgaon', city: 'Gurgaon', type: 'Villa', bedrooms: 4, price: 4.8, priceDisplay: '₹4.8 Cr', area: '4800 sqft', status: 'Ready to Move' },

  // Sector 82
  { id: 20, name: 'Godrej Infinity', sector: 'Sector 82', location: 'New Gurgaon, Sector 82', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.35, priceDisplay: '₹1.35 Cr', area: '1850 sqft', status: 'Under Construction' },
  { id: 21, name: 'Hero Homes', sector: 'Sector 82', location: 'New Gurgaon, Sector 82', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.25, priceDisplay: '₹1.25 Cr', area: '1750 sqft', status: 'Under Construction' },

  // Sector 83
  { id: 22, name: 'Gurgaon One', sector: 'Sector 83', location: 'New Gurgaon, Sector 83', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.45, priceDisplay: '₹1.45 Cr', area: '1950 sqft', status: 'Under Construction' },

  // Sector 84
  { id: 23, name: 'Emaar Gurgaon Greens', sector: 'Sector 84', location: 'New Gurgaon, Sector 84', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.15, priceDisplay: '₹1.15 Cr', area: '1650 sqft', status: 'Ready to Move' },
  { id: 24, name: 'Emaar Gurgaon Greens Premium', sector: 'Sector 84', location: 'New Gurgaon, Sector 84', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 1.85, priceDisplay: '₹1.85 Cr', area: '2500 sqft', status: 'Ready to Move' },

  // Sector 85
  { id: 25, name: 'BPTP Park Generations', sector: 'Sector 85', location: 'New Gurgaon, Sector 85', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 1.05, priceDisplay: '₹1.05 Cr', area: '1650 sqft', status: 'Under Construction' },

  // Sector 86
  { id: 26, name: 'BPTP Park Prime', sector: 'Sector 86', location: 'New Gurgaon, Sector 86', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 0.95, priceDisplay: '₹95 Lac', area: '1550 sqft', status: 'Ready to Move' },

  // Sector 102
  { id: 27, name: 'UBL Palm Gardens', sector: 'Sector 102', location: 'New Gurgaon, Sector 102', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 0.85, priceDisplay: '₹85 Lac', area: '1450 sqft', status: 'Ready to Move' },

  // Sector 103
  { id: 28, name: 'BPTP Amstoria', sector: 'Sector 103', location: 'New Gurgaon, Sector 103', city: 'Gurgaon', type: 'Villa', bedrooms: 4, price: 2.2, priceDisplay: '₹2.2 Cr', area: '3500 sqft', status: 'Ready to Move' },
  { id: 29, name: 'BPTP Astoria Gardens', sector: 'Sector 103', location: 'New Gurgaon, Sector 103', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 0.78, priceDisplay: '₹78 Lac', area: '1400 sqft', status: 'Ready to Move' },

  // DLF Cyber City
  { id: 30, name: 'DLF Cyber Hub', sector: 'Cyber City', location: 'DLF Cyber City, Gurgaon', city: 'Gurgaon', type: 'Commercial', bedrooms: 0, price: 15, priceDisplay: '₹15 Cr', area: '50000 sqft', status: 'Ready to Move' },
  { id: 31, name: 'DLF Tower B', sector: 'Cyber City', location: 'DLF Cyber City, Gurgaon', city: 'Gurgaon', type: 'Commercial', bedrooms: 0, price: 12, priceDisplay: '₹12 Cr', area: '40000 sqft', status: 'Ready to Move' },

  // Udyog Vihar
  { id: 32, name: 'Udyog Vihar Phase 5', sector: 'Udyog Vihar', location: 'Udyog Vihar, Gurgaon', city: 'Gurgaon', type: 'Commercial', bedrooms: 0, price: 3.5, priceDisplay: '₹3.5 Cr', area: '15000 sqft', status: 'Ready to Move' },

  // Sohna Road
  { id: 33, name: 'Central Park 2', sector: 'Sohna Road', location: 'Sohna Road, Gurgaon', city: 'Gurgaon', type: 'Villa', bedrooms: 4, price: 3.8, priceDisplay: '₹3.8 Cr', area: '4000 sqft', status: 'Ready to Move' },
  { id: 34, name: 'Central Park Flower Valley', sector: 'Sohna Road', location: 'Sohna Road, Gurgaon', city: 'Gurgaon', type: 'Villa', bedrooms: 4, price: 2.9, priceDisplay: '₹2.9 Cr', area: '3500 sqft', status: 'Under Construction' },

  // Golf Course Road
  { id: 35, name: 'The Leela Residency', sector: 'Golf Course Road', location: 'Golf Course Road, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 4, price: 12, priceDisplay: '₹12 Cr', area: '6000 sqft', status: 'Ready to Move' },

  // MG Road
  { id: 36, name: 'MGF Metropolitan', sector: 'MG Road', location: 'MG Road, Gurgaon', city: 'Gurgaon', type: 'Commercial', bedrooms: 0, price: 8, priceDisplay: '₹8 Cr', area: '25000 sqft', status: 'Ready to Move' },

  // ── Signature Global ──
  { id: 37, name: 'Signature Global Titanium SPR', sector: 'Sector 71',  location: 'NH-48 Corridor, Sector 71, Gurgaon',         city: 'Gurgaon', type: 'Apartment', bedrooms: 2, price: 0.55, priceDisplay: '₹55 Lac',  area: '950 sqft',  status: 'Ready to Move' },
  { id: 38, name: 'Signature Global 37D',          sector: 'Sector 37D', location: 'Dwarka Expressway, Sector 37D, Gurgaon',      city: 'Gurgaon', type: 'Apartment', bedrooms: 2, price: 0.48, priceDisplay: '₹48 Lac',  area: '850 sqft',  status: 'Ready to Move' },
  { id: 39, name: 'Signature Global The Roselia',  sector: 'Sector 95A', location: 'Dwarka Expressway, Sector 95A, Gurgaon',      city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 0.75, priceDisplay: '₹75 Lac',  area: '1150 sqft', status: 'Under Construction' },
  { id: 40, name: 'Signature Global City 93',      sector: 'Sector 93',  location: 'NH-8, Sector 93, New Gurgaon',                city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 0.95, priceDisplay: '₹95 Lac',  area: '1350 sqft', status: 'Under Construction' },
  { id: 41, name: 'Signature Global Superbia',     sector: 'Sector 95',  location: 'Dwarka Expressway, Sector 95, Gurgaon',       city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 0.85, priceDisplay: '₹85 Lac',  area: '1200 sqft', status: 'Under Construction' },
  { id: 42, name: 'Signature Global Proxima',      sector: 'Sector 89',  location: 'Dwarka Expressway, Sector 89, Gurgaon',       city: 'Gurgaon', type: 'Apartment', bedrooms: 2, price: 0.62, priceDisplay: '₹62 Lac',  area: '1050 sqft', status: 'Ready to Move' },

  // ── ROF Infratech ──
  { id: 43, name: 'ROF Ananda',  sector: 'Sector 95',  location: 'Dwarka Expressway, Sector 95, Gurgaon',  city: 'Gurgaon', type: 'Apartment', bedrooms: 2, price: 0.58, priceDisplay: '₹58 Lac',  area: '1000 sqft', status: 'Ready to Move' },
  { id: 44, name: 'ROF Aalayas', sector: 'Sector 102', location: 'New Gurgaon, Sector 102',                city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 0.72, priceDisplay: '₹72 Lac',  area: '1200 sqft', status: 'Under Construction' },
  { id: 45, name: 'ROF Prelude', sector: 'Sector 93',  location: 'NH-8 Corridor, Sector 93, New Gurgaon',  city: 'Gurgaon', type: 'Apartment', bedrooms: 2, price: 0.45, priceDisplay: '₹45 Lac',  area: '900 sqft',  status: 'Ready to Move' },
  { id: 46, name: 'ROF Alante',  sector: 'Sector 108', location: 'Dwarka Expressway, Sector 108, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 3, price: 0.68, priceDisplay: '₹68 Lac',  area: '1100 sqft', status: 'Under Construction' },
  { id: 47, name: 'ROF Raah',    sector: 'Sector 108', location: 'Dwarka Expressway, Sector 108, Gurgaon', city: 'Gurgaon', type: 'Apartment', bedrooms: 2, price: 0.55, priceDisplay: '₹55 Lac',  area: '1000 sqft', status: 'Under Construction' },
];

// AI Picks — Top Gurugram Projects (AI Researched 2025)
const AI_PICKS_PROJECTS = [
  {
    name: 'DLF The Dahlias',
    developer: 'DLF India',
    location: 'Sector 54, Golf Course Road',
    price: '₹65 Cr+',
    pricePerSqft: '₹80,000+ / sq.ft',
    type: '4–6 BHK Penthouses',
    status: 'Under Construction',
    possession: 'December 2030',
    totalUnits: '400 Units',
    landArea: '17 Acres',
    towers: '29 Towers',
    tag: 'Ultra Luxury',
    tagColor: 'gold',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&h=440&fit=crop&q=80',
    amenities: ['Smart Home Automation', 'Private Terraces', 'Plunge Pools', 'Spa & Wellness', 'Concierge Service', 'Floor-to-Ceiling Glass', 'Premium Marble Flooring', 'Landscaped Gardens'],
    configurations: [
      { config: '4 BHK', size: '9,500 sq.ft', price: '₹65 Cr+' },
      { config: '5 BHK', size: '12,000 sq.ft', price: '₹85 Cr+' },
      { config: '6 BHK Penthouse', size: '16,000 sq.ft', price: '₹1 Cr+' },
    ],
    about: 'DLF The Dahlias is an ultra-luxury residential masterpiece on Golf Course Road. With panoramic views, bespoke interiors, and world-class amenities, it redefines luxury living in Gurugram. Located near Rapid Metro station with seamless connectivity.',
    highlights: ['Near Rapid Metro Station', 'Golf Course Road Frontage', 'LEED Certified Building', 'Smart Home Ready', '24/7 Concierge'],
    aiNote: 'Possession Dec 2030 · Near Rapid Metro · 29 Towers on 17 Acres',
  },
  {
    name: 'Godrej Meridien',
    developer: 'Godrej Properties',
    location: 'Sector 106, Dwarka Expressway',
    price: '₹1.62 Cr+',
    pricePerSqft: '₹15,600–15,700 / sq.ft',
    type: '2–4 BHK Apartments',
    status: 'Ready to Move',
    possession: 'September 2025',
    totalUnits: '700 Units',
    landArea: '14.79 Acres',
    towers: '7 Towers, 34 Floors',
    tag: 'Best Value',
    tagColor: 'green',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&h=440&fit=crop&q=80',
    amenities: ['48-Seat Cineplex', 'Olympic Swimming Pool', 'Art Gallery', 'Squash Courts', 'Valet Parking', 'Wine Tasting Area', 'Indoor Pool + Jacuzzi', 'Music & Karaoke Room'],
    configurations: [
      { config: '2 BHK', size: '1,200–1,400 sq.ft', price: '₹1.62 Cr+' },
      { config: '3 BHK', size: '1,700–2,000 sq.ft', price: '₹2.40 Cr+' },
      { config: '4 BHK', size: '2,500–3,000 sq.ft', price: '₹3.80 Cr+' },
    ],
    about: 'Godrej Meridien offers premium apartments with 86% open space and world-class amenities on Dwarka Expressway. The project features a 2-acre clubhouse with a wine tasting area, art gallery, cineplex with butler service and a full Olympic-size swimming pool.',
    highlights: ['86% Open Space', '2-Acre Clubhouse', 'Ready to Move', 'Dwarka Expressway Connectivity', 'Trusted Godrej Brand'],
    aiNote: '86% open space · 700 units · 7 towers · Sep 2025 possession',
  },
  {
    name: 'Elan The Presidential',
    developer: 'Elan Group',
    location: 'Sector 106, Dwarka Expressway',
    price: '₹3.35 Cr+',
    pricePerSqft: '₹21,650–21,850 / sq.ft',
    type: '3–5 BHK Luxury Apartments',
    status: 'Under Construction',
    possession: 'October 2027',
    totalUnits: '106 Units',
    landArea: '30 Acres',
    towers: '18 Towers, 38 Floors',
    tag: 'Premium Pick',
    tagColor: 'purple',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&h=440&fit=crop&q=80',
    amenities: ['Infinity Swimming Pool', 'Horse-Riding Track', 'Shooting Range', 'Rooftop Jogging Track', 'Amphitheatre', 'Floating Sauna', 'Meditation Zones', 'Grand Podium Clubhouse'],
    configurations: [
      { config: '3 BHK', size: '1,800–2,200 sq.ft', price: '₹3.35 Cr+' },
      { config: '4 BHK', size: '2,500–3,000 sq.ft', price: '₹4.80 Cr+' },
      { config: '5 BHK', size: '3,500+ sq.ft', price: '₹6.50 Cr+' },
    ],
    about: 'Elan The Presidential is a super-premium residential development spread across 30 acres with exclusive amenities including a horse-riding track and shooting range. With only 106 housing units across 18 towers, it offers unmatched privacy and exclusivity.',
    highlights: ['Only 106 Exclusive Units', 'Horse-Riding Track', 'Shooting Range', '30 Acres of Land', 'Floating Sauna'],
    aiNote: 'Possession Oct 2027 · 30 Acres · 38-Floor Towers · 106 Units',
  },
  {
    name: 'Sobha City',
    developer: 'Sobha Limited',
    location: 'Sector 108, Dwarka Expressway',
    price: '₹1.40 Cr+',
    pricePerSqft: '₹19,750–19,850 / sq.ft',
    type: '2–4 BHK Apartments',
    status: 'Ready to Move',
    possession: 'Ready (50%+ Complete)',
    totalUnits: 'Large Township',
    landArea: '39 Acres',
    towers: 'Multiple Towers',
    tag: 'Top Rated',
    tagColor: 'blue',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=700&h=440&fit=crop&q=80',
    amenities: ['2 Clubhouses (40,000 sq.ft)', 'Olympic Swimming Pool', 'Resort-Style Lakelet', '8.5 Acres Urban Green', 'Indoor Badminton & Tennis', 'Jogging Tracks', 'Island Deck', 'Meditation Zones'],
    configurations: [
      { config: '2 BHK', size: '1,380 sq.ft', price: '₹1.40 Cr+' },
      { config: '3 BHK', size: '1,800–2,000 sq.ft', price: '₹2.10 Cr+' },
      { config: '4 BHK', size: '2,342 sq.ft', price: '₹3.00 Cr+' },
    ],
    about: 'Sobha City is a premium 39-acre township on Dwarka Expressway featuring two world-class clubhouses totalling 40,000 sq.ft, a resort-style lakelet with island deck, and 8.5 acres of urban green spaces. Built by Sobha — known for its impeccable construction quality.',
    highlights: ['Sobha Quality Construction', '39-Acre Township', 'Two Mega Clubhouses', 'Resort-Style Lakelet', 'Ready to Move'],
    aiNote: '39 Acres township · 40,000 sq.ft clubhouse · 50%+ complete',
  },
  {
    name: 'Smartworld Orchard',
    developer: 'Smartworld Developers',
    location: 'Sector 61, Golf Course Extension',
    price: '₹2.21 Cr+',
    pricePerSqft: '₹16,450–16,550 / sq.ft',
    type: '2–3 BHK Low-Rise Floors',
    status: 'Ready to Move',
    possession: 'December 2024',
    totalUnits: 'Low-Rise Community',
    landArea: '25 Acres',
    towers: 'Low-Rise Floors',
    tag: 'Ready Now',
    tagColor: 'teal',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&h=440&fit=crop&q=80',
    amenities: ['Private Terraces', 'Basement Dens', 'Sun Deck Pool', 'Lounge Café', 'Jogging Trails', 'Designer Clubhouse', 'Yoga & Meditation Rooms', 'Community Amphitheatre'],
    configurations: [
      { config: '2 BHK', size: '1,200–1,500 sq.ft', price: '₹2.21 Cr+' },
      { config: '3 BHK', size: '1,700–2,000 sq.ft', price: '₹2.90 Cr+' },
      { config: '3 BHK + Terrace', size: '2,200+ sq.ft', price: '₹3.50 Cr+' },
    ],
    about: 'Smartworld Orchard offers a rare low-rise premium lifestyle on Golf Course Extension Road. Each floor comes with private terraces and basement dens, providing the feel of an independent home with the security and amenities of a gated community.',
    highlights: ['Low-Rise Premium Lifestyle', 'Private Terraces on Each Floor', 'Golf Course Extension Road', 'December 2024 Possession', 'Designer Podium Clubhouse'],
    aiNote: '25 Acres · Dec 2024 possession · Low-rise premium lifestyle',
  },
  {
    name: 'Central Park Flower Valley',
    developer: 'Central Park',
    location: 'Sector 32–33, Sohna Road',
    price: '₹2.42 Cr+',
    pricePerSqft: '₹22,000 / sq.ft',
    type: 'Apartments, Villas & Floors',
    status: 'Ready to Move',
    possession: 'Ready to Move',
    totalUnits: 'Integrated Township',
    landArea: '500 Acres',
    towers: 'Multiple Phases',
    tag: 'Township Living',
    tagColor: 'orange',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&h=440&fit=crop&q=80',
    amenities: ['500 Acres Township', '10 World-Class Sports Academies', 'Golf Academy', 'Organic Farming', 'Fine Dining Restaurants', 'Aquatic Gym', 'Wellness Sanctuary', '9,000 Trees & Flora Fountain'],
    configurations: [
      { config: '3 BHK Apartment', size: '1,800–2,200 sq.ft', price: '₹2.42 Cr+' },
      { config: '4 BHK Apartment', size: '2,500–3,000 sq.ft', price: '₹6.09 Cr+' },
      { config: 'Villa', size: '6,000–6,500 sq.ft', price: '₹13.5 Cr+' },
    ],
    about: 'Central Park Flower Valley is a magnificent 500-acre integrated township on Sohna Road. It features 10 world-class academies for boxing, tennis, cricket, golf, badminton and more. With 9,000 trees, organic farming and a wellness sanctuary, it is unlike any other project.',
    highlights: ['500 Acres Integrated Township', '10 Sports Academies', '9,000 Trees', 'Organic Farming', 'Villas Available'],
    aiNote: '9,000 trees · Villas from ₹13.5 Cr · World-class sports academies',
  },
  {
    name: 'M3M Antalya Hills',
    developer: 'M3M India',
    location: 'Sector 79, Dwarka Expressway',
    price: '₹1.45 Cr+',
    pricePerSqft: '₹12,000–14,000 / sq.ft',
    type: '2.5–3.5 BHK Apartments',
    status: 'Under Construction',
    possession: 'Phase 1: Dec 2025 | Phase 2: Jun 2026',
    totalUnits: 'Large Community',
    landArea: 'Premium Location',
    towers: 'Multiple Towers',
    tag: 'New Launch',
    tagColor: 'red',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=700&h=440&fit=crop&q=80',
    amenities: ['Dual Clubhouses', 'Mini Theatre', 'Spa & Gymnasium', 'Cycling Tracks', 'Multipurpose Sports Courts', 'Children Play Area', 'Jogging Track', 'Swimming Pool'],
    configurations: [
      { config: '2.5 BHK', size: '1,200–1,400 sq.ft', price: '₹1.45 Cr+' },
      { config: '3.5 BHK', size: '1,700–2,000 sq.ft', price: '₹2.10 Cr+' },
    ],
    about: 'M3M Antalya Hills brings Mediterranean-inspired architecture to Gurugram. Located near Dwarka Expressway with easy NH-48 access, the project features dual clubhouses, a mini theatre, and a full range of sports facilities.',
    highlights: ['Mediterranean Architecture', 'Dual Clubhouses', 'Near NH-48', 'M3M Trusted Brand', 'Phase 1 Ready Dec 2025'],
    aiNote: 'Phase 1: Dec 2025 · Phase 2: Jun 2026 · Easy NH-48 access',
  },
  {
    name: 'Signature Global City 37D',
    developer: 'Signature Global',
    location: 'Sector 37D, Dwarka Expressway',
    price: '₹61 Lac+',
    pricePerSqft: '₹6,200–7,000 / sq.ft',
    type: '2–3 BHK Independent Floors',
    status: 'Ready to Move',
    possession: 'April 2025',
    totalUnits: '600 Units',
    landArea: '23 Acres',
    towers: '5 Towers (S+4 Floors)',
    tag: 'Affordable',
    tagColor: 'lime',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=700&h=440&fit=crop&q=80',
    amenities: ['Cricket Pitch', 'Skating Rink', 'Swimming Pool', 'Badminton Court', 'Dedicated Lift per Floor', 'Basketball Court', 'Jogging & Cycling Track', 'Rainwater Harvesting'],
    configurations: [
      { config: '2 BHK', size: '990 sq.ft', price: '₹61 Lac+' },
      { config: '3 BHK', size: '1,200–1,440 sq.ft', price: '₹80–90 Lac' },
    ],
    about: 'Signature Global City 37D is one of Gurugram\'s best affordable housing options with RERA registration. Located on Dwarka Expressway, each floor has its dedicated lift, and the township spans 23 acres with extensive sports and recreational facilities.',
    highlights: ['RERA Registered (GGM/462/194/2021/30)', 'Dedicated Lift per Plot', 'April 2025 Possession', 'Best Affordable Option', '23 Acres Township'],
    aiNote: 'RERA Registered · 600 units · 23 Acres · April 2025 possession',
  },
];

/**
 * HomePage Component
 *
 * A modern, responsive home page with hero, features, about, and contact sections.
 * Built with mobile-first approach and smooth animations.
 */
const TRENDING_LOCATIONS = [
  { icon: '🏙️', name: 'Sector 42', tag: 'DLF Phase 5 · Ultra Luxury' },
  { icon: '⛳', name: 'Golf Course Road', tag: 'Premium Corridor' },
  { icon: '🛣️', name: 'Dwarka Expressway', tag: 'Trending · New Launch' },
  { icon: '💼', name: 'Cyber City', tag: 'Commercial Hub' },
  { icon: '🌿', name: 'Sohna Road', tag: 'Affordable · Growing' },
  { icon: '🏗️', name: 'New Gurgaon', tag: 'Best Value · Upcoming' },
];

const POPULAR_CHIPS = [
  { label: 'Delhi NCR', icon: '🏙️' },
  { label: 'Under ₹50L', icon: '💰' },
  { label: 'Near Metro', icon: '🚇' },
  { label: '3 BHK', icon: '🛏️' },
  { label: 'Ready to Move', icon: '🔑' },
  { label: 'New Launch', icon: '✨' },
  { label: 'Luxury Villas', icon: '🏡' },
  { label: 'Under ₹1 Cr', icon: '📊' },
];

const LUXURY_VIDEOS = [
  {
    src: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    poster: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920',
    label: 'Premium Gurgaon'
  },
  {
    src: 'https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920',
    label: 'Luxury Villas'
  },
  {
    src: 'https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920',
    label: 'Dream Homes'
  },
  {
    src: 'https://videos.pexels.com/video-files/1739010/1739010-hd_1920_1080_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920',
    label: 'Elite Properties'
  }
];

// ── Hero 3D element positions — computed once, never on re-render ──
const HERO_CUBES = Array.from({ length: 6 }, (_, i) => ({
  left: `${[8, 22, 45, 62, 78, 88][i]}%`,
  top:  `${[15, 70, 25, 80, 12, 55][i]}%`,
  delay: `${i * 2}s`,
  duration: `${[15,18,16,20,14,17][i]}s`,
  size: i % 3,
}));
const HERO_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 5.1 + 3) % 100}%`,
  top:  `${(i * 7.3 + 5) % 100}%`,
  width:  `${5 + (i % 5) * 2}px`,
  height: `${5 + (i % 5) * 2}px`,
  delay:    `${(i * 0.4) % 6}s`,
  duration: `${9 + (i % 6)}s`,
}));
const HERO_SHAPES = Array.from({ length: 6 }, (_, i) => ({
  left: `${[5, 20, 50, 70, 85, 38][i]}%`,
  top:  `${[20, 65, 10, 75, 35, 50][i]}%`,
  delay:    `${i * 1.5}s`,
  duration: `${[12,14,11,13,15,10][i]}s`,
  width:  `${[32,45,28,40,35,30][i]}px`,
  height: `${[32,45,28,40,35,30][i]}px`,
}));

// ── Smart Badge Logic ──
const HOT_IDS      = new Set([1, 3, 13, 14, 35, 7, 18, 33]);   // High demand
const DROPPING_IDS = new Set([4, 15, 20, 21, 22, 25, 34]);      // UC / price negotiable
const NEW_IDS      = new Set([20, 21, 22, 23, 24, 25]);          // New Gurgaon launches
const BEST_VAL_IDS = new Set([26, 27, 29, 8, 5]);                // Best price/sqft

// Builders who list directly (no broker)
const BUILDER_DIRECT_IDS = new Set([1,2,3,4,13,14,16,20,21,22,23,24,30,31,35,37,38,39,40,41,42]);
const ZERO_BROKER_IDS    = new Set([5,6,7,8,9,10,11,12,15,17,18,19,25,26,27,28,29,33,34,43,44,45,46,47]);

function getPropertyBadge(p) {
  if (!p) return null;
  const psf = (p.price * 1e7) / parseInt(p.area);
  if (BUILDER_DIRECT_IDS.has(p.id)) return { label: '🏗 Builder Direct', cls: 'badge-direct' };
  if (ZERO_BROKER_IDS.has(p.id))    return { label: '✅ Zero Brokerage',  cls: 'badge-zero'   };
  if (HOT_IDS.has(p.id))            return { label: '🔥 Hot Deal',        cls: 'badge-hot'    };
  if (p.price >= 5)                  return { label: '⭐ Premium',          cls: 'badge-premium'};
  if (DROPPING_IDS.has(p.id))       return { label: '📈 Price Dropping',  cls: 'badge-drop'   };
  if (NEW_IDS.has(p.id))            return { label: '🆕 New Launch',       cls: 'badge-new'    };
  if (BEST_VAL_IDS.has(p.id) || psf < 6000)
                                     return { label: '💎 Best Value',       cls: 'badge-value'  };
  if (p.status === 'Ready to Move' && p.price < 2)
                                     return { label: '⚡ Quick Possession', cls: 'badge-quick'  };
  return null;
}

// Badge for AI Picks projects (text-based)
function getPickBadge(project) {
  const t = (project.tag || '').toLowerCase();
  const n = (project.name || '').toLowerCase();
  if (t.includes('ultra') || t.includes('luxury') || project.price?.includes('65 Cr') || project.price?.includes('12 Cr'))
    return { label: '⭐ Premium', cls: 'badge-premium' };
  if (t.includes('new') || t.includes('launch') || t.includes('pre'))
    return { label: '🆕 New Launch', cls: 'badge-new' };
  if (t.includes('affordable') || t.includes('best value') || t.includes('budget'))
    return { label: '💎 Best Value', cls: 'badge-value' };
  if (t.includes('trending') || n.includes('m3m') || n.includes('smartworld'))
    return { label: '🔥 Hot Deal', cls: 'badge-hot' };
  if (project.status === 'Under Construction')
    return { label: '📈 Price Dropping', cls: 'badge-drop' };
  return null;
}

// ── Property hover preview videos (free Mixkit stock) ──
const PREVIEW_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-luxury-house-in-a-neighborhood-4048-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-white-modern-house-1928-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-buildings-in-a-big-city-4047-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-apartment-life-in-a-building-1940-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-modern-house-exterior-4044-large.mp4',
];
const onCardEnter = e => {
  const v = e.currentTarget.querySelector('.prop-video');
  v?.play().catch(() => {});
};
const onCardLeave = e => {
  const v = e.currentTarget.querySelector('.prop-video');
  if (v) { v.pause(); v.currentTime = 0; }
};

/* ══════════════════════════════════════════════
   INSTANT DECISION METER
   Compares price/sqft against sector benchmarks
══════════════════════════════════════════════ */
const SECTOR_BENCHMARKS = {
  'Sector 42': 16500,  'Sector 43': 14800,
  'Sector 49':  9000,  'Sector 57':  9500,
  'Sector 65': 12000,  'Sector 66': 11000,  'Sector 67': 11000,
  'Sector 82':  8000,  'Sector 83':  8000,
  'Sector 84':  7500,  'Sector 85':  7000,
  'Sector 86':  6800,  'Sector 102': 6500,  'Sector 103': 6200,
  'Cyber City': 35000, 'Udyog Vihar': 25000,
  'Sohna Road': 9500,  'Golf Course Road': 22000,  'MG Road': 32000,
  // Signature Global & ROF corridors
  'Sector 37D': 5500,  'Sector 71': 6000,
  'Sector 76': 6200,   'Sector 89': 5800,
  'Sector 93': 6000,   'Sector 95': 5500,
  'Sector 95A': 5800,  'Sector 108': 5800,
};

function computeMeter(priceInCr, areaSqft, sector, type) {
  if (!areaSqft || !priceInCr) return null;
  if (type === 'Commercial') return {
    label: 'Market Rate', icon: '🏢', tier: 'avg',
    color: '#6366f1', bg: 'rgba(99,102,241,0.12)', desc: 'Commercial segment pricing',
  };
  const pricePerSqft = (priceInCr * 1e7) / areaSqft;
  const benchmark    = SECTOR_BENCHMARKS[sector] || 10000;
  const ratio        = pricePerSqft / benchmark;
  if (ratio < 0.93) return {
    label: 'Good Deal', icon: '👍', tier: 'good',
    color: '#10b981', bg: 'rgba(16,185,129,0.16)',
    desc: `${Math.round((1 - ratio) * 100)}% below sector avg`,
  };
  if (ratio <= 1.07) return {
    label: 'Fair Price', icon: '⚖️', tier: 'avg',
    color: '#f59e0b', bg: 'rgba(245,158,11,0.16)',
    desc: 'Priced at sector market rate',
  };
  return {
    label: 'Overpriced', icon: '❌', tier: 'over',
    color: '#ef4444', bg: 'rgba(239,68,68,0.16)',
    desc: `${Math.round((ratio - 1) * 100)}% above sector avg`,
  };
}

function getDecisionMeter(p) {
  const sqft = parseFloat(String(p.area || '').replace(/[^0-9.]/g, '')) || 0;
  return computeMeter(p.price, sqft, p.sector, p.type);
}

/* Pre-computed meters for the 3 featured showcase cards
   (their real prices are in a different scale than DB prices) */
const FEATURED_CARD_METERS = [
  { label: 'Good Deal', icon: '👍', tier: 'good', color: '#10b981', bg: 'rgba(16,185,129,0.16)', desc: '10% below Sec 42 ultra-luxury avg' },
  { label: 'Fair Price', icon: '⚖️', tier: 'avg',  color: '#f59e0b', bg: 'rgba(245,158,11,0.16)',  desc: 'At Golf Course Ext. market rate' },
  { label: 'Good Deal', icon: '👍', tier: 'good', color: '#10b981', bg: 'rgba(16,185,129,0.16)', desc: '8% below Sec 65 panoramic avg' },
];

/* ══════════════════════════════════════════════
   HOVER-TO-EXPLORE  —  Image Slideshow + Quick Peek
══════════════════════════════════════════════ */
const HC_IMG_POOL = [
  'photo-1545324418-cc1a3fa10c00',
  'photo-1600585154340-be6161a56a0c',
  'photo-1613490493576-7fde63acd811',
  'photo-1560185127-6ed189bf02f4',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1484154218962-a197022b5858',
  'photo-1512917774080-9991f1c4c750',
  'photo-1571939228382-b2f2b585ce15',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1567767292278-a4f21aa2d36e',
  'photo-1560448204-e02f11c3d0e2',
  'photo-1574362848149-11496d93a7c7',
  'photo-1558618666-fcd25c85cd64',
  'photo-1613977257363-707ba9348227',
  'photo-1501183638710-841dd1904471',
  'photo-1564013799919-ab600027ffc6',
];

function getHoverImages(primarySrc, id) {
  const imgs = [primarySrc];
  for (let i = 1; i < 4; i++) {
    const idx = ((id * 7) + i * 5) % HC_IMG_POOL.length;
    imgs.push(`https://images.unsplash.com/${HC_IMG_POOL[idx]}?w=700&h=440&fit=crop&q=80`);
  }
  return imgs;
}

function getHoverAmenities(price, type) {
  if (type === 'Villa')  return ['🏊 Private Pool', '🌿 Private Garden', '🅿️ 3-Car Parking'];
  if (price >= 8)        return ['⛳ Golf Access', '🧖 Spa & Sauna', '🎭 Private Theatre'];
  if (price >= 4)        return ['🏊 Rooftop Pool', '🏋️ Olympic Gym', '🎾 Sports Club'];
  if (price >= 2)        return ['🏊 Pool', '🏋️ Premium Gym', '🎾 Tennis Court'];
  return ['🏊 Pool', '🏋️ Gym', '⚡ 24/7 Power Backup'];
}

function HoverCard({ children, imgs, amenities, price, status, beds, area, type, onViewDetails, onBookNow, className, wrapClass, imgStyle, skyStyle, ovlStyle, badges, video, motionProps, meter, propName, propLocation, propId }) {
  const [hovered,  setHovered]  = React.useState(false);
  const [imgIdx,   setImgIdx]   = React.useState(0);
  const [expanded, setExpanded] = React.useState(false);
  const [expImgIdx, setExpImgIdx] = React.useState(0);
  const timerRef = React.useRef(null);
  const details = PROPERTY_DETAILS.default;

  const enter = () => {
    setHovered(true);
    let cur = 0;
    timerRef.current = setInterval(() => {
      cur = (cur + 1) % imgs.length;
      setImgIdx(cur);
    }, 1400);
    const v = timerRef.current && document.querySelector('.hc-card:hover .prop-video');
    v?.play().catch(() => {});
  };

  const leave = () => {
    setHovered(false);
    setImgIdx(0);
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  React.useEffect(() => () => clearInterval(timerRef.current), []);

  const toggleExpand = (e) => {
    if (e.target.closest('button, a')) return;
    if (!expanded && propId) {
      // Notify intelligence engine
      const prop = { id: propId, name: propName, price: parseFloat(price) || 0,
        bedrooms: beds, sector: propLocation?.split(',')[0]?.trim(), type, city: 'Gurgaon' };
      window.__trackView?.(prop);
    }
    setExpanded(v => !v);
    if (!expanded) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  };

  const closeExpand = () => {
    setExpanded(false);
    document.body.style.overflow = '';
  };

  const Wrapper = motionProps ? motion.div : 'div';
  return (
    <>
    <Wrapper
      className={`property-card hc-card tilt-card spotlight-card ${className || ''}${expanded ? ' hc-card--expanded-source' : ''}`}
      onMouseEnter={e => { if (!expanded) { enter(); onCardEnter(e); } }}
      onMouseLeave={e => { if (!expanded) { leave(); onCardLeave(e); } }}
      onClick={toggleExpand}
      style={{ cursor: 'pointer', ...(motionProps?.style || {}) }}
      {...(motionProps ? { ...motionProps, style: motionProps.style } : {})}
    >
      <div className={`property-image ${wrapClass || ''}`}>
        {imgs.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className={`hc-slide${i === imgIdx ? ' hc-active' : ''}`}
            style={i === 0 ? (imgStyle || {}) : {}}
          />
        ))}
        {skyStyle && <div className="hp-tod-card-sky" style={skyStyle} />}
        {ovlStyle && <div className="hp-tod-card-overlay" style={ovlStyle} />}
        {video && (
          <>
            <video className="prop-video" src={video} muted loop playsInline preload="none" />
            <span className="prop-video-badge">▶ Preview</span>
          </>
        )}
        {badges}

        {/* ── Decision Meter badge (always visible, sits at bottom-left) ── */}
        {meter && (
          <div className={`hc-meter-badge hc-meter-${meter.tier}`}
            style={{ background: meter.bg, color: meter.color, borderColor: meter.color }}>
            <span>{meter.icon}</span>
            <span>{meter.label}</span>
          </div>
        )}

        {/* Slide dots */}
        <AnimatePresence>
          {hovered && (
            <motion.div className="hc-dots"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {imgs.map((_, i) => (
                <span key={i} className={`hc-dot${i === imgIdx ? ' hc-dot-active' : ''}`} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick-peek panel — slides up from bottom */}
        <AnimatePresence>
          {hovered && (
            <motion.div className="hc-peek"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hc-peek-top">
                <span className="hc-peek-price">{price}</span>
                <span className={`hc-peek-status ${status === 'Ready to Move' ? 'hc-ready' : 'hc-uc'}`}>
                  {status === 'Ready to Move' ? '✓ Ready' : '⚙ UC'}
                </span>
              </div>
              <div className="hc-peek-tags">
                {beds > 0 && <span>{beds} BHK</span>}
                {area && <span>{area}</span>}
                {type && <span>{type}</span>}
              </div>
              <div className="hc-peek-amenities">
                {amenities.map((a, i) => <span key={i}>{a}</span>)}
              </div>
              {/* Decision Meter row inside peek */}
              {meter && (
                <div className="hc-peek-meter" style={{ '--mc': meter.color }}>
                  <span className={`hc-pm-verdict hc-meter-${meter.tier}`}
                    style={{ background: meter.bg, color: meter.color, borderColor: meter.color }}>
                    {meter.icon} {meter.label}
                  </span>
                  <span className="hc-pm-desc">{meter.desc}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="hc-peek-btn" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); onViewDetails(); }}>
                  Explore →
                </button>
                {onBookNow && (
                  <button className="hc-peek-btn" style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none' }}
                    onClick={e => { e.stopPropagation(); onBookNow(); }}>
                    🔐 Book
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {children}
    </Wrapper>

    {/* Inline Expanded Card */}
    <AnimatePresence>
      {expanded && (
        <motion.div
          className="hce-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={closeExpand}
        >
          <motion.div
            className="hce-panel"
            initial={{ opacity: 0, scale: 0.93, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button className="hce-close" onClick={closeExpand}>✕</button>

            <div className="hce-body">
              {/* Left — Image gallery */}
              <div className="hce-left">
                <div className="hce-main-img-wrap">
                  <img
                    src={imgs[expImgIdx] || imgs[0]}
                    alt={propName}
                    className="hce-main-img"
                  />
                  <div className="hce-status-tag">{status === 'Ready to Move' ? '✅ Ready to Move' : '🔨 Under Construction'}</div>
                </div>
                <div className="hce-thumbs">
                  {imgs.slice(0, 4).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className={`hce-thumb${expImgIdx === i ? ' hce-thumb--active' : ''}`}
                      onClick={() => setExpImgIdx(i)}
                    />
                  ))}
                </div>
                {/* Amenities */}
                <div className="hce-amenities">
                  {details.amenities.slice(0, 6).map((a, i) => (
                    <span key={i} className="hce-amenity">✓ {a}</span>
                  ))}
                </div>
              </div>

              {/* Right — Details */}
              <div className="hce-right">
                <div className="hce-badge-row">
                  {type && <span className="hce-type-badge">{type}</span>}
                  {beds > 0 && <span className="hce-beds-badge">{beds} BHK</span>}
                </div>

                <h2 className="hce-name">{propName || 'Premium Property'}</h2>
                <p className="hce-loc">📍 {propLocation || 'Gurgaon, Haryana'}</p>

                {/* Price */}
                <div className="hce-price-row">
                  <span className="hce-price">{price}</span>
                  {area && <span className="hce-area">{area}</span>}
                </div>

                {/* Quick stats */}
                <div className="hce-stats">
                  {[
                    { label: 'Floors', val: details.floors },
                    { label: 'Parking', val: details.parking },
                    { label: 'Facing', val: details.facing },
                    { label: 'Possession', val: details.possession },
                  ].map(s => (
                    <div key={s.label} className="hce-stat">
                      <span className="hce-stat-label">{s.label}</span>
                      <span className="hce-stat-val">{s.val}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <p className="hce-desc">{details.overview}</p>

                {/* Nearby */}
                <div className="hce-nearby">
                  <div className="hce-nearby-title">Nearby</div>
                  <div className="hce-nearby-grid">
                    {details.nearby.slice(0, 4).map((n, i) => (
                      <div key={i} className="hce-nearby-item">
                        <span className="hce-nearby-icon">{n.icon}</span>
                        <div>
                          <div className="hce-nearby-name">{n.name}</div>
                          <div className="hce-nearby-dist">{n.dist}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="hce-actions">
                  <button className="hce-btn-primary" onClick={() => { closeExpand(); onViewDetails(); }}>
                    View Full Details →
                  </button>
                  {onBookNow && (
                    <button className="hce-btn-primary" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                      onClick={() => { closeExpand(); onBookNow(); }}>
                      🔐 Book Now
                    </button>
                  )}
                  <button className="hce-btn-secondary" onClick={closeExpand}>
                    Close
                  </button>
                </div>

                <div className="hce-rera">RERA: {details.rera}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════
   FIND YOUR HOME — GAMIFIED QUIZ
══════════════════════════════════════════════ */
const QUIZ_STEPS = [
  {
    key: 'budget', q: "What's your budget?", icon: '💰',
    hint: 'We have perfect options for every budget',
    options: [
      { key: 'b1', label: '₹50L – ₹1 Cr',  sub: 'Smart Starter',  emoji: '🌱', min: 0.3, max: 1.0 },
      { key: 'b2', label: '₹1 Cr – ₹3 Cr', sub: 'Mid-Range',      emoji: '🏡', min: 1.0, max: 3.0 },
      { key: 'b3', label: '₹3 Cr – ₹7 Cr', sub: 'Premium',        emoji: '✨', min: 3.0, max: 7.0 },
      { key: 'b4', label: '₹7 Cr+',         sub: 'Ultra Luxury',   emoji: '👑', min: 7.0, max: 999 },
    ],
  },
  {
    key: 'family', q: "Who's moving in?", icon: '👨‍👩‍👧',
    hint: 'Helps us find the right size for you',
    options: [
      { key: 'f1', label: 'Just Me / Couple', sub: '1–2 BHK ideal', emoji: '💑',     bhk: [1, 2] },
      { key: 'f2', label: 'Small Family',      sub: '2–3 BHK ideal', emoji: '👨‍👩‍👦',   bhk: [2, 3] },
      { key: 'f3', label: 'Large Family',      sub: '3–4 BHK ideal', emoji: '👨‍👩‍👧‍👦', bhk: [3, 4] },
      { key: 'f4', label: 'Investment Buy',    sub: 'Any size works', emoji: '📈',     bhk: [] },
    ],
  },
  {
    key: 'location', q: 'Preferred area?', icon: '📍',
    hint: 'Each zone has its own character & price',
    options: [
      { key: 'l1', label: 'Golf Course Road',  sub: 'Premium Luxury',    emoji: '⛳',
        sectors: ['Sector 42','Sector 43','Sector 65','Sector 66','Sector 67','Golf Course Road'] },
      { key: 'l2', label: 'Sohna Road Belt',   sub: 'Peaceful & Green',  emoji: '🌿',
        sectors: ['Sector 49','Sector 57','Sohna Road'] },
      { key: 'l3', label: 'Dwarka Expressway', sub: 'Fast-Rising Zones',  emoji: '🚀',
        sectors: ['Sector 37D','Sector 71','Sector 89','Sector 93','Sector 95','Sector 95A','Sector 108'] },
      { key: 'l4', label: 'New Gurgaon',       sub: 'Best Value Zones',   emoji: '🏗️',
        sectors: ['Sector 82','Sector 83','Sector 84','Sector 85','Sector 86','Sector 102','Sector 103'] },
    ],
  },
];

function HomeQuiz({ onClose, navigate, properties = PROPERTY_DATABASE }) {
  const [step,     setStep]     = React.useState(0);
  const [answers,  setAnswers]  = React.useState({});
  const [selected, setSelected] = React.useState(null);
  const [results,  setResults]  = React.useState([]);
  const current = QUIZ_STEPS[step];

  const pick = (opt) => {
    setSelected(opt.key);
    const newAns = { ...answers, [current.key]: opt };
    setTimeout(() => {
      setSelected(null);
      if (step < 2) {
        setAnswers(newAns);
        setStep(s => s + 1);
      } else {
        const bOpt = newAns.budget;
        const fOpt = newAns.family;
        const lOpt = opt; // location is last
        const matched = properties.filter(p => {
          const budgetOk = p.price >= (bOpt?.min || 0) && p.price <= (bOpt?.max || 999);
          const famOk    = fOpt?.bhk?.length === 0 || (fOpt?.bhk || []).includes(p.bedrooms);
          const locOk    = (lOpt?.sectors || []).includes(p.sector);
          return budgetOk && famOk && locOk && p.type !== 'Commercial';
        }).slice(0, 5);
        setResults(matched);
        setAnswers(newAns);
        setStep(3);
      }
    }, 300);
  };

  const restart = () => { setStep(0); setAnswers({}); setSelected(null); setResults([]); };

  return (
    <motion.div className="hq-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="hq-modal"
        initial={{ scale: 0.88, y: 50, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{    scale: 0.88, y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Header */}
        <div className="hq-header">
          <div className="hq-brand">🏠 Find Your Home</div>
          <button className="hq-close" onClick={onClose}>✕</button>
        </div>

        {/* Progress */}
        {step < 3 && (
          <div className="hq-progress-wrap">
            <div className="hq-progress-bar">
              <motion.div className="hq-progress-fill"
                animate={{ width: `${((step + 1) / 3) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <span className="hq-progress-text">{step + 1} / 3</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step < 3 ? (
            <motion.div key={`step-${step}`} className="hq-step"
              initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hq-step-icon">{current.icon}</div>
              <h2 className="hq-question">{current.q}</h2>
              <p className="hq-hint">{current.hint}</p>
              <div className="hq-options">
                {current.options.map((opt, i) => (
                  <motion.button key={opt.key}
                    className={`hq-opt${selected === opt.key ? ' hq-selected' : ''}`}
                    onClick={() => pick(opt)}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                  >
                    <span className="hq-opt-emoji">{opt.emoji}</span>
                    <div className="hq-opt-body">
                      <strong>{opt.label}</strong>
                      <small>{opt.sub}</small>
                    </div>
                    {selected === opt.key && <span className="hq-check">✓</span>}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" className="hq-results"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {results.length > 0 ? (<>
                <div className="hq-results-head">
                  <motion.div className="hq-trophy"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                  >🎯</motion.div>
                  <h2 className="hq-results-title">{results.length} Match{results.length > 1 ? 'es' : ''} Found!</h2>
                  <p className="hq-results-sub">Handpicked based on your answers</p>
                </div>
                <div className="hq-cards">
                  {results.map((p, i) => (
                    <motion.div key={p.id} className="hq-card"
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.09, duration: 0.35 }}
                    >
                      <div className="hq-card-info">
                        <div className="hq-card-name">{p.name}</div>
                        <div className="hq-card-tags">
                          {p.bedrooms > 0 && <span>{p.bedrooms} BHK</span>}
                          <span>{p.area}</span>
                          <span className="hq-card-sector">{p.sector}</span>
                          <span className={`hq-card-status ${p.status === 'Ready to Move' ? 'hq-ready' : 'hq-uc'}`}>
                            {p.status === 'Ready to Move' ? '✓ Ready' : '⚙ UC'}
                          </span>
                        </div>
                      </div>
                      <div className="hq-card-right">
                        <div className="hq-card-price">{p.priceDisplay}</div>
                        <button className="hq-card-btn"
                          onClick={() => { navigate(`/property/${p.id}`); onClose(); }}>
                          View →
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="hq-cta-row">
                  <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="hq-wa-btn">
                    💬 Talk to Expert
                  </a>
                  <button className="hq-retry-btn" onClick={restart}>↺ Retry</button>
                </div>
              </>) : (
                <div className="hq-empty">
                  <div className="hq-empty-icon">🔍</div>
                  <h2>No exact matches</h2>
                  <p>Try different preferences — our experts can help!</p>
                  <div className="hq-cta-row" style={{ marginTop: '20px' }}>
                    <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="hq-wa-btn">💬 Talk to Expert</a>
                    <button className="hq-retry-btn" onClick={restart}>↺ Retry</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Area Vibe Map — sector/location → label ──
const AREA_VIBES = {
  'Sector 42':        { label: 'Elite Golf Zone',    emoji: '👑', color: '#d4a853', bg: 'rgba(212,168,83,0.14)' },
  'Sector 43':        { label: 'Elite Golf Zone',    emoji: '👑', color: '#d4a853', bg: 'rgba(212,168,83,0.14)' },
  'Sector 49':        { label: 'Peaceful & Green',   emoji: '🌿', color: '#10b981', bg: 'rgba(16,185,129,0.13)' },
  'Sector 50':        { label: 'Peaceful & Green',   emoji: '🌿', color: '#10b981', bg: 'rgba(16,185,129,0.13)' },
  'Sector 54':        { label: 'Premium Corridor',   emoji: '🌟', color: '#d4a853', bg: 'rgba(212,168,83,0.14)' },
  'Sector 57':        { label: 'Golf Belt',          emoji: '⛳', color: '#22c55e', bg: 'rgba(34,197,94,0.13)' },
  'Sector 65':        { label: 'Golf Country',       emoji: '⛳', color: '#22c55e', bg: 'rgba(34,197,94,0.13)' },
  'Sector 66':        { label: 'Quiet Residential',  emoji: '🌿', color: '#10b981', bg: 'rgba(16,185,129,0.13)' },
  'Sector 67':        { label: 'Quiet Residential',  emoji: '🌿', color: '#10b981', bg: 'rgba(16,185,129,0.13)' },
  'Sector 82':        { label: 'Emerging Hub',       emoji: '🚀', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
  'Sector 83':        { label: 'Emerging Hub',       emoji: '🚀', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
  'Sector 84':        { label: 'Emerging Hub',       emoji: '🚀', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
  'Sector 85':        { label: 'Emerging Hub',       emoji: '🚀', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
  'Sector 86':        { label: 'Emerging Hub',       emoji: '🚀', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
  'Sector 102':       { label: 'Growth Corridor',    emoji: '📈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
  'Sector 103':       { label: 'Growth Corridor',    emoji: '📈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
  'Sector 106':       { label: 'Growth Corridor',    emoji: '📈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
  'Sector 108':       { label: 'Growth Corridor',    emoji: '📈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
  'Cyber City':       { label: 'Corporate Hub',      emoji: '🏢', color: '#f59e0b', bg: 'rgba(245,158,11,0.13)' },
  'Udyog Vihar':      { label: 'Business District',  emoji: '🔥', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  'MG Road':          { label: 'Busy Commercial',    emoji: '🔥', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  'Golf Course Road': { label: 'Premium Corridor',   emoji: '🌟', color: '#d4a853', bg: 'rgba(212,168,83,0.14)' },
  'Sohna Road':       { label: 'Peaceful & Green',   emoji: '🌿', color: '#10b981', bg: 'rgba(16,185,129,0.13)' },
  'Dwarka Expressway':{ label: 'Growth Corridor',    emoji: '📈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
  // Signature Global & ROF corridors
  'Sector 37D':       { label: 'Affordable Premium', emoji: '💡', color: '#06b6d4', bg: 'rgba(6,182,212,0.13)' },
  'Sector 71':        { label: 'NH-48 Corridor',     emoji: '🛣️', color: '#06b6d4', bg: 'rgba(6,182,212,0.13)' },
  'Sector 76':        { label: 'NH-8 Corridor',      emoji: '🛣️', color: '#06b6d4', bg: 'rgba(6,182,212,0.13)' },
  'Sector 89':        { label: 'Dwarka Expressway',  emoji: '📈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
  'Sector 93':        { label: 'NH-8 New Gurgaon',   emoji: '🚀', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
  'Sector 95':        { label: 'Dwarka Expressway',  emoji: '📈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
  'Sector 95A':       { label: 'Dwarka Expressway',  emoji: '📈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
};

const getAreaVibe = (str) => {
  if (!str) return null;
  if (AREA_VIBES[str]) return AREA_VIBES[str];
  for (const [key, vibe] of Object.entries(AREA_VIBES)) {
    if (str.includes(key)) return vibe;
  }
  return null;
};

// ── Property DNA Match System ─────────────────
const DNA_BUDGETS = [
  { key: 'under1', label: 'Under ₹1 Cr', icon: '💡', min: 0,   max: 1    },
  { key: '1to3',   label: '₹1 – 3 Cr',   icon: '🏠', min: 1,   max: 3    },
  { key: '3to7',   label: '₹3 – 7 Cr',   icon: '⭐', min: 3,   max: 7    },
  { key: '7plus',  label: '₹7 Cr+',       icon: '👑', min: 7,   max: 9999 },
];

const DNA_LOCATIONS = [
  { key: 'golf',   label: 'Golf Course Rd', icon: '⛳', sectors: ['Sector 42','Sector 43','Sector 65','Sector 66','Sector 67','Golf Course Road'] },
  { key: 'sohna',  label: 'Sohna Road',     icon: '🛣️', sectors: ['Sector 49','Sector 57','Sohna Road'] },
  { key: 'newggn', label: 'New Gurgaon',    icon: '🏗️', sectors: ['Sector 82','Sector 83','Sector 84','Sector 85','Sector 86','Sector 102','Sector 103'] },
  { key: 'cyber',  label: 'Cyber / MG Rd',  icon: '🏢', sectors: ['Cyber City','MG Road','Udyog Vihar'] },
  { key: 'any',    label: 'Anywhere',        icon: '🌍', sectors: [] },
];

const DNA_LIFESTYLES = [
  { key: 'luxury',     label: 'Luxury Living',    icon: '👑', desc: 'Premium & prestige'      },
  { key: 'family',     label: 'Family Home',      icon: '🏡', desc: '3+ BHK, safe locality'  },
  { key: 'investment', label: 'Smart Investment', icon: '📈', desc: 'High appreciation'       },
  { key: 'budget',     label: 'Value Buy',        icon: '💰', desc: 'Best price per sqft'     },
  { key: 'villa',      label: 'Villa Life',       icon: '🌿', desc: 'Spacious independent'    },
];

function calcDnaMatch(p, prefs) {
  if (!prefs.budget || !prefs.location || !prefs.lifestyle) return null;
  let score = 0;

  // Budget — 40 pts
  const bud = DNA_BUDGETS.find(b => b.key === prefs.budget);
  if (bud) {
    const inRange = p.price >= bud.min && p.price <= bud.max;
    const near    = p.price >= bud.min * 0.75 && p.price <= bud.max * 1.3;
    score += inRange ? 40 : near ? 24 : 6;
  }

  // Location — 30 pts
  const loc = DNA_LOCATIONS.find(l => l.key === prefs.location);
  if (loc) {
    score += loc.key === 'any' ? 30 : loc.sectors.includes(p.sector) ? 30 : 7;
  }

  // Lifestyle — 30 pts
  switch (prefs.lifestyle) {
    case 'luxury':
      score += p.price >= 5 ? 30 : p.price >= 3 ? 20 : p.price >= 1.5 ? 10 : 3; break;
    case 'family':
      score += p.bedrooms >= 3 ? 30 : p.bedrooms >= 2 ? 18 : p.bedrooms >= 1 ? 8 : 2; break;
    case 'investment':
      score += p.status === 'Under Construction' ? 28 : (p.price >= 1.5 && p.price <= 6) ? 22 : 10; break;
    case 'budget':
      score += p.price <= 1 ? 30 : p.price <= 1.8 ? 22 : p.price <= 3 ? 12 : 3; break;
    case 'villa':
      score += p.type === 'Villa' ? 30 : p.bedrooms >= 4 ? 14 : 4; break;
  }

  // Add small random variance per property (deterministic, based on id)
  score += (p.id % 7);
  return Math.min(99, Math.max(8, score));
}

function dnaScoreColor(s) {
  if (s >= 85) return '#22c55e';
  if (s >= 70) return '#6366f1';
  if (s >= 50) return '#f59e0b';
  return '#94a3b8';
}
function dnaScoreLabel(s) {
  if (s >= 85) return 'Excellent';
  if (s >= 70) return 'Good Match';
  if (s >= 50) return 'Fair Match';
  return 'Low Match';
}

// ── Time of Day Config ────────────────────────
const HOME_TOD = {
  morning: { label: 'Morning', emoji: '☀️', filter: 'brightness(1.12) saturate(1.2) sepia(0.07)', overlay: 'rgba(255,210,80,0.13)', glow: '#f59e0b', badge: 'Golden Hour', badgeColor: '#f59e0b', sky: 'linear-gradient(180deg,rgba(255,200,60,0.18) 0%,transparent 60%)' },
  evening: { label: 'Evening', emoji: '🌆', filter: 'brightness(0.82) saturate(1.4) sepia(0.22)', overlay: 'rgba(255,100,20,0.22)', glow: '#ef4444', badge: 'Sunset View', badgeColor: '#ef4444', sky: 'linear-gradient(180deg,rgba(255,80,20,0.28) 0%,rgba(180,40,80,0.1) 60%,transparent 100%)' },
  night:   { label: 'Night',   emoji: '🌙', filter: 'brightness(0.44) saturate(0.62) hue-rotate(195deg)', overlay: 'rgba(15,25,80,0.38)', glow: '#6366f1', badge: 'Night View', badgeColor: '#818cf8', sky: 'linear-gradient(180deg,rgba(30,20,100,0.45) 0%,rgba(10,10,60,0.2) 60%,transparent 100%)' },
};

// ── Property Mood Config ──────────────────────
const MOODS = {
  luxury: {
    emoji: '😎',
    label: 'Luxury',
    sectionTitle: 'Luxury Properties',
    subtitle: 'Ultra-premium residences ₹5 Cr & above — curated for connoisseurs',
    filter: p => p.price >= 5,
    badge: '👑 Luxury Pick',
    color: '#d4a853',
    colorRgb: '212,168,83',
    gradient: 'linear-gradient(135deg, #d4a853 0%, #f0c96e 100%)',
    bgGlow: 'rgba(212,168,83,0.07)',
    images: ['1545324418-cc1a3fa10c00','1613490493576-7fde63acd811','1512917774080-9991f1c4c750'],
  },
  budget: {
    emoji: '💰',
    label: 'Budget Friendly',
    sectionTitle: 'Smart Buys Under ₹5 Cr',
    subtitle: 'Value-for-money homes under ₹5 Cr — great ROI for smart buyers',
    filter: p => p.price < 5,
    badge: '💚 Best Value',
    color: '#10b981',
    colorRgb: '16,185,129',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    bgGlow: 'rgba(16,185,129,0.07)',
    images: ['1600566753086-00f18fb6b3ea','1600607687939-ce8a6c25118c','1560184897-ae5b3b8e3f29'],
  },
  family: {
    emoji: '👨‍👩‍👧‍👦',
    label: 'Family Homes',
    sectionTitle: 'Perfect Family Homes',
    subtitle: 'Spacious 3+ BHK homes designed around your family\'s happiness',
    filter: p => p.bedrooms >= 3,
    badge: '🏡 Family Home',
    color: '#6366f1',
    colorRgb: '99,102,241',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    bgGlow: 'rgba(99,102,241,0.07)',
    images: ['1600607687939-ce8a6c25118c','1600566753086-00f18fb6b3ea','1545324418-cc1a3fa10c00'],
  },
};

const HomePage = () => {
  const { user, isBuilder, isBuyer, isAdmin, openLogin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [nlpAnalysis, setNlpAnalysis] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPickProject, setSelectedPickProject] = useState(null);
  const [bookingProperty, setBookingProperty] = useState(null); // triggers BookingModal
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const [smartSearchValue, setSmartSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vs_recentSearches') || '[]'); }
    catch { return []; }
  });
  const searchWrapperRef = useRef(null);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showVirtualModal, setShowVirtualModal] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [showBestPriceModal, setShowBestPriceModal] = useState(false);
  const [verifiedFilter, setVerifiedFilter] = useState({ type: 'All', status: 'All', search: '', priceCategory: 'All' });
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);

  // Live data from admin panel (overrides hardcoded fallback when server is running)
  const [apiProperties, setApiProperties] = useState(null);
  const [apiAgents, setApiAgents] = useState(null);
  const [apiFetched, setApiFetched] = useState(false);

  const fetchLiveData = useCallback(() => {
    Promise.allSettled([
      fetch(`${API}/api/admin/properties`)
        .then(r => r.json()).then(data => { if (Array.isArray(data) && data.length) setApiProperties(data); })
        .catch(() => {}),
      fetch(`${API}/api/admin/agents`)
        .then(r => r.json()).then(data => { if (Array.isArray(data) && data.length) setApiAgents(data); })
        .catch(() => {}),
    ]).finally(() => setApiFetched(true));
  }, []);

  // Fetch on mount
  useEffect(() => { fetchLiveData(); }, [fetchLiveData]);

  // Refetch when user comes back to this tab/window
  useEffect(() => {
    window.addEventListener('focus', fetchLiveData);
    return () => window.removeEventListener('focus', fetchLiveData);
  }, [fetchLiveData]);

  // Use API data when available, otherwise use hardcoded fallback
  const liveProperties = apiProperties || PROPERTY_DATABASE;
  const liveAgents = apiAgents || null; // null = use inline hardcoded agents below

  const { settings: siteSettings } = useSiteSettings();

  // Also update priceCategory filter to use dynamic threshold
  const luxuryThreshold = parseFloat(siteSettings.luxuryThreshold) || 5;

  // AI Chatbot States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "🏠 <strong>Welcome to Vertex Living!</strong><br><br>I'm your AI Property Assistant. I'll help you find your perfect property by understanding your requirements and showing you the best matches from our premium listings.<br><br>Let's start! What's your budget range?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userData, setUserData] = useState({
    budget: null,
    location: null,
    propertyType: null,
    purpose: null,
    timeline: null,
    name: null,
    contact: null
  });
  const [negotiationState, setNegotiationState] = useState({
    activeProperty: null,
    currentPrice: null,
    buyerOffer: null,
    stage: 'none', // none, initial_offer, counter_offer, final_push, closing
    urgencyFactors: [],
    objectionHandled: false
  });

  // Compare state
  const [compareList, setCompareList] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const { mood: navbarMood } = useTheme();
  // Filter entire DB by current mood: luxury = ₹7 Cr+, budget = under ₹7 Cr
  const moodFilteredDB = React.useMemo(() => {
    const threshold = parseFloat(siteSettings.luxuryThreshold) || 5;
    return liveProperties.filter(p => navbarMood === 'luxury' ? p.price >= threshold : p.price < threshold);
  }, [navbarMood, liveProperties, siteSettings.luxuryThreshold]
  );
  const [activeMood, setActiveMood] = useState(() => navbarMood || 'luxury');

  const moodProperties = React.useMemo(() => {
    if (!activeMood || !MOODS[activeMood]) return [];
    return moodFilteredDB.filter(MOODS[activeMood].filter).slice(0, 9);
  }, [activeMood, moodFilteredDB]);

  const [interiorProp, setInteriorProp] = useState(null);
  const [cinematicData, setCinematicData] = useState(null);
  const intelligence = useIntelligence();

  // Expose tracker globally so HoverCard (defined outside scope) can call it
  useEffect(() => {
    window.__trackView = intelligence.trackPropertyView;
    return () => { delete window.__trackView; };
  }, [intelligence.trackPropertyView]);

  // Sync navbar mood toggle → featured section filter
  useEffect(() => {
    if (navbarMood === 'luxury' || navbarMood === 'budget') {
      setActiveMood(navbarMood);
    }
  }, [navbarMood]);
  const [showRoomPlanner, setShowRoomPlanner] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (id) => {
    const isCurrentlyExpanded = !!expandedSections[id];
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    if (isCurrentlyExpanded) {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };
  const [homeTod, setHomeTod] = useState(() => {
    const h = new Date().getHours();
    return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 19 ? 'evening' : 'night';
  });
  const [dnaPrefs,  setDnaPrefs]  = useState({ budget: null, location: null, lifestyle: null });
  const [dnaOpen,   setDnaOpen]   = useState(false);
  const [dnaStep,   setDnaStep]   = useState(0); // 0=budget,1=location,2=lifestyle
  const [dnaScores, setDnaScores] = useState({});

  // Show skeletons until BOTH the 900ms timer AND the API fetch are done
  useEffect(() => {
    if (!apiFetched) return;
    const t = setTimeout(() => setPageLoaded(true), 300);
    return () => clearTimeout(t);
  }, [apiFetched]);


  // DNA match scores — recalculate when prefs or mood changes
  useEffect(() => {
    if (!dnaPrefs.budget || !dnaPrefs.location || !dnaPrefs.lifestyle) return;
    const scores = {};
    moodFilteredDB.forEach(p => { scores[p.id] = calcDnaMatch(p, dnaPrefs); });
    setDnaScores(scores);
  }, [dnaPrefs, moodFilteredDB]);

  // Top DNA-matched properties (sorted, score >= 50)
  const dnaMatched = Object.keys(dnaScores).length > 0
    ? [...moodFilteredDB]
        .map(p => ({ ...p, dnaScore: dnaScores[p.id] || 0 }))
        .filter(p => p.dnaScore >= 45)
        .sort((a, b) => b.dnaScore - a.dnaScore)
        .slice(0, 6)
    : [];

  const dnaActive = dnaPrefs.budget && dnaPrefs.location && dnaPrefs.lifestyle;

  const handleDnaSelect = (step, val) => {
    const keys = ['budget', 'location', 'lifestyle'];
    const newPrefs = { ...dnaPrefs, [keys[step]]: val };
    setDnaPrefs(newPrefs);
    if (step < 2) {
      setDnaStep(step + 1);
    } else {
      setDnaOpen(false);
    }
  };

  const resetDna = () => {
    setDnaPrefs({ budget: null, location: null, lifestyle: null });
    setDnaScores({});
    setDnaStep(0);
    setDnaOpen(false);
  };

  const toggleCompare = (p) => {
    setCompareList(prev => {
      if (prev.find(x => x.id === p.id)) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });
  };

  // Dream Home Generator state
  const [dreamInput, setDreamInput] = useState('');
  const [dreamResults, setDreamResults] = useState(null);
  const [dreamLoading, setDreamLoading] = useState(false);
  const [dreamAnimated, setDreamAnimated] = useState(false);

  // Chat qualification questions
  const qualificationQuestions = [
    {
      key: 'budget',
      question: "💰 What's your budget range? (e.g., 'Under 1 Cr', '1-2 Cr', '2-5 Cr', '5 Cr+')",
      extract: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('under') || lower.includes('below') || lower.includes('less')) {
          const match = lower.match(/(\d+(\.\d+)?)\s*cr/);
          return match ? `Under ₹${match[1]} Cr` : 'Flexible';
        }
        if (lower.includes('5 cr') || lower.includes('5cr') || lower.includes('5 crore')) return '₹5 Cr+';
        if (lower.includes('2-5') || lower.includes('2 to 5') || lower.includes('3')) return '₹2-5 Cr';
        if (lower.includes('1-2') || lower.includes('1 to 2')) return '₹1-2 Cr';
        if (lower.includes('under 1') || lower.includes('below 1') || lower.includes('50')) return 'Under ₹1 Cr';
        return 'Flexible';
      }
    },
    {
      key: 'location',
      question: "📍 Which location do you prefer? (e.g., 'Sector 49', 'DLF', 'Golf Course Road', 'Sohna Road', or say 'Any')",
      extract: (text) => {
        const sectors = ['49', '50', '57', '65', '42', '43', '56', '58', '59', '61', '62', '66', '67'];
        const areas = ['dlf', 'golf course', 'sohna road', 'mgf', 'm3m', 'emaar', 'unitech', ' vatika'];

        const lower = text.toLowerCase();
        if (lower.includes('any') || lower.includes('all') || lower.includes('flexible')) return 'Gurgaon';

        for (const sector of sectors) {
          if (lower.includes(sector)) return `Sector ${sector}`;
        }
        for (const area of areas) {
          if (lower.includes(area)) {
            if (area === 'dlf') return 'DLF Area';
            if (area === 'golf course') return 'Golf Course Road';
            return area.charAt(0).toUpperCase() + area.slice(1);
          }
        }
        return 'Gurgaon';
      }
    },
    {
      key: 'propertyType',
      question: "🏠 What type of property? (Apartment, Villa, Plot, Penthouse, Commercial)",
      extract: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('apartment') || lower.includes('flat') || lower.includes('2bhk') || lower.includes('3bhk') || lower.includes('4bhk')) return 'Apartment';
        if (lower.includes('villa') || lower.includes('house')) return 'Villa';
        if (lower.includes('plot') || lower.includes('land')) return 'Plot';
        if (lower.includes('penthouse')) return 'Penthouse';
        if (lower.includes('commercial') || lower.includes('office') || lower.includes('shop') || lower.includes('retail')) return 'Commercial';
        return 'Apartment';
      }
    },
    {
      key: 'purpose',
      question: "🎯 Is this for <strong>Investment</strong> or <strong>Personal Use</strong>?",
      extract: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('investment') || lower.includes('invest') || lower.includes('rental')) return 'Investment';
        if (lower.includes('personal') || lower.includes('end use') || lower.includes('end-use') || lower.includes('living') || lower.includes('family')) return 'Personal Use';
        return 'Exploring';
      }
    },
    {
      key: 'timeline',
      question: "⏰ How soon are you looking to buy? (Urgent, 1-3 months, 3-6 months, Just exploring)",
      extract: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('immediate') || lower.includes('urgent') || lower.includes('now') || lower.includes('asap') || lower.includes('soon')) return 'Urgent';
        if (lower.includes('1 month') || lower.includes('one month') || lower.includes('30 days')) return 'Within 1 month';
        if (lower.includes('2-3') || lower.includes('2 to 3') || lower.includes('1-3') || lower.includes('couple')) return '2-3 months';
        if (lower.includes('3-6') || lower.includes('3 to 6') || lower.includes('few')) return '3-6 months';
        return 'Just Exploring';
      }
    }
  ];

  // Handle chat message
  const handleChatMessage = (userMessage) => {
    const newUserMessage = {
      sender: 'user',
      text: userMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newUserMessage]);

    // Process user's answer
    if (currentQuestionIndex < qualificationQuestions.length) {
      const currentQ = qualificationQuestions[currentQuestionIndex];
      const extractedValue = currentQ.extract(userMessage);

      setUserData(prev => ({
        ...prev,
        [currentQ.key]: extractedValue
      }));

      // Move to next question or show summary with property matching
      setTimeout(() => {
        if (currentQuestionIndex < qualificationQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          const nextQ = qualificationQuestions[currentQuestionIndex + 1];
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: nextQ.question,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        } else {
          // Qualification complete - show property matching
          const matchedProperties = findMatchingProperties(userData);
          const leadScore = calculateLeadScore(userData);
          const leadCategory = classifyLead(leadScore);

          const summaryMessage = `
            🎯 <strong>Perfect! I've found ${matchedProperties.length} properties matching your requirements</strong><br><br>
            <strong>Your Requirements:</strong><br>
            💰 Budget: ${userData.budget || 'Flexible'}<br>
            📍 Location: ${userData.location || 'Gurgaon'}<br>
            🏠 Property Type: ${userData.propertyType || 'Any'}<br>
            🎯 Purpose: ${userData.purpose || 'Exploring'}<br><br>
            ${getLeadMessage(leadCategory)}<br><br>
          `;

          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: summaryMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            properties: matchedProperties.slice(0, 3) // Show top 3 matches
          }]);

          setCurrentQuestionIndex(qualificationQuestions.length);
        }
      }, 800);
    } else {
      // After qualification complete - handle follow-up questions & negotiation
      setTimeout(() => {
        const lower = userMessage.toLowerCase();
        const buyerPrice = extractPrice(userMessage);

        // ============================================
        // NEGOTIATION FLOW
        // ============================================

        // User mentions a price - start negotiation
        if (buyerPrice && negotiationState.activeProperty) {
          const strategy = calculateCounterOffer(buyerPrice, negotiationState.currentPrice, negotiationState.activeProperty);
          const urgency = createUrgency(negotiationState.activeProperty, negotiationState);

          let response = strategy.message + '<br><br>';
          response += strategy.reason + '<br><br>';
          response += strategy.nextStep + '<br><br>';
          if (urgency) {
            response += urgency;
          }

          setNegotiationState(prev => ({
            ...prev,
            buyerOffer: buyerPrice,
            counterPrice: strategy.counterPrice || prev.currentPrice,
            stage: strategy.canAccept ? 'closing' : 'counter_offer'
          }));

          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
        // User wants to negotiate on a specific property
        else if ((lower.includes('negotiate') || lower.includes('offer') || lower.includes('deal')) && !negotiationState.activeProperty) {
          const matchedProperties = findMatchingProperties(userData);
          if (matchedProperties.length > 0) {
            const property = matchedProperties[0];
            initializeNegotiation(property);

            setChatMessages(prev => [...prev, {
              sender: 'ai',
              text: `💬 <strong>Let's Talk Numbers!</strong><br><br>
I'd love to help you get the best deal on <strong>${property.name}</strong> in ${property.sector}.<br><br>
<strong>Current Price:</strong> ${property.priceDisplay}<br><br>
<strong>Make an Offer:</strong><br>
What price would you like to offer? (e.g., "₹7.5 Cr" or "7.5 Cr")<br><br>
💡 <em>Tip: Serious offers get better responses from owners!</em>`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          } else {
            setChatMessages(prev => [...prev, {
              sender: 'ai',
              text: "Let's first find you a property to negotiate on! Would you like me to show you some options?",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }
        }
        // User accepts counter offer or wants to close
        else if ((lower.includes('accept') || lower.includes('confirm') || lower.includes('deal') || lower.includes('book') || lower.includes('yes') || lower.includes('ok') || lower.includes('sure')) && negotiationState.stage === 'counter_offer') {
          if (negotiationState.counterPrice) {
            const finalOffer = finalDealPush(negotiationState.activeProperty, negotiationState.counterPrice);
            setNegotiationState(prev => ({ ...prev, stage: 'closing' }));

            setChatMessages(prev => [...prev, {
              sender: 'ai',
              text: finalOffer,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }
        }
        // User expresses hesitation or objection
        else if ((lower.includes('but') || lower.includes('however') || lower.includes('concern') || lower.includes('worried') || lower.includes('not sure') || lower.includes('hesitate')) && negotiationState.activeProperty) {
          const objectionResponse = handleObjection(userMessage, negotiationState.activeProperty, negotiationState);

          setNegotiationState(prev => ({ ...prev, objectionHandled: true }));
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: objectionResponse.response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
        // User rejects offer - handle gracefully
        else if ((lower.includes('no') || lower.includes('not interested') || lower.includes('too high') || lower.includes('can\'t afford')) && negotiationState.activeProperty) {
          const objectionResponse = handleObjection(userMessage, negotiationState.activeProperty, negotiationState);

          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: `I completely understand - this is a big decision! ${objectionResponse.response}<br><br><strong>Alternative Options:</strong><br>1. 🏘️ Show similar properties in lower budget<br>2. 💰 Explore under-construction options (better appreciation)<br>3. 📊 Set price alert for market dips<br><br>What would you prefer?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);

          // Reset negotiation
          setNegotiationState({
            activeProperty: null,
            currentPrice: null,
            buyerOffer: null,
            stage: 'none',
            urgencyFactors: [],
            objectionHandled: true
          });
        }

        // ============================================
        // GENERAL FOLLOW-UPS
        // ============================================

        // Show more properties
        else if (lower.includes('more') || lower.includes('show') || lower.includes('another')) {
          const matchedProperties = findMatchingProperties(userData);
          if (matchedProperties.length > 3) {
            setChatMessages(prev => [...prev, {
              sender: 'ai',
              text: `Here are ${Math.min(3, matchedProperties.length - 3)} more properties for you:`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              properties: matchedProperties.slice(3, 6)
            }]);
          } else {
            setChatMessages(prev => [...prev, {
              sender: 'ai',
              text: "I've shown you all the matching properties. Would you like to adjust your budget or location to see more options?",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }
        }
        // Schedule site visit
        else if (lower.includes('visit') || lower.includes('site') || lower.includes('see')) {
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: "🏠 <strong>Excellent Choice!</strong><br><br>Site visits help you make confident decisions. Please share:<br>1. 📱 Your phone number<br>2. 📅 Preferred date & time<br><br>Our team will:<br>✅ Arrange pickup & drop<br>✅ Show you multiple properties<br>✅ Provide detailed comparison<br><br>We'll confirm within 30 minutes!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
        // Price inquiry (not in negotiation)
        else if ((lower.includes('price') || lower.includes('cost') || lower.includes('expensive')) && !negotiationState.activeProperty) {
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: `💰 <strong>Price Talk!</strong><br><br>I can help with pricing! Would you like to:<br><br>1️⃣ <strong>Negotiate</strong> - Make an offer on a property<br>2️⃣ <strong>Compare</strong> - See price vs market rate<br>3️⃣ <strong>EMI</strong> - Calculate monthly payments<br>4️⃣ <strong>Alternatives</strong> - Similar properties in budget<br><br>Just let me know!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
        // Financing
        else if (lower.includes('loan') || lower.includes('emi') || lower.includes('finance') || lower.includes('payment')) {
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: "🏦 <strong>Financing Made Easy!</strong><br><br>We partner with leading banks:<br><br>• 💳 Home loan up to 90%<br>• 📉 EMI starting from ₹45,000/month<br>• ✅ 0% processing fee<br>• ⚡ Instant approval<br>• 🎁 Free credit counseling<br><br><strong>Special Offer:</strong> Zero EMI for 6 months on select properties!<br><br>Want me to calculate EMI for your budget? Just tell me the property price!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
        // Final booking/confirmation
        else if (lower.includes('book') || lower.includes('confirm') || lower.includes('buy') || lower.includes('proceed') && !negotiationState.activeProperty) {
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: `🎉 <strong>Great! Let's Get You Booked!</strong><br><br>To proceed with booking, I'll need:<br><br>1. 📱 Your phone number<br>2. 📧 Email address<br>3. 🏘️ Which property interests you?<br><br><strong>Next Steps:</strong>• Our executive will call you in 10 mins<br>• Share payment link & documents<br>• Confirm booking instantly<br><br>Trust us - 500+ happy families have booked with us! 🏠`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
        // User wants to speak to human
        else if (lower.includes('call') || lower.includes('talk') || lower.includes('speak') || lower.includes('human') || lower.includes('person') || lower.includes('manager')) {
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: "📞 <strong>Sure Thing!</strong><br><br>Our property expert is available:<br><br>📱 <strong>Call Now:</strong> +91 98765 43210<br>⏰ <strong>Timing:</strong> 9 AM - 9 PM (7 days)<br><br><em>Or share your number - we'll call back in 5 mins!</em><br><br>Our experts are friendly, no-pressure, and super helpful! 😊",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
        // Default intelligent response
        else {
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: `I'm here to help! Would you like to:<br><br>1️⃣ 🏘️ <strong>See more properties</strong><br>2️⃣ 💬 <strong>Negotiate price</strong> on a property<br>3️⃣ 🏠 <strong>Schedule site visit</strong><br>4️⃣ 📞 <strong>Talk to an expert</strong><br>5️⃣ 🏦 <strong>Financing options</strong><br><br>Just type what you're looking for!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      }, 600);
    }
  };

  // Find matching properties based on user requirements
  const findMatchingProperties = (requirements) => {
    let scoredProperties = moodFilteredDB.map(property => {
      let score = 0;
      let maxScore = 0;

      // Budget matching (30 points)
      maxScore += 30;
      if (requirements.budget && requirements.budget !== 'Flexible') {
        const budgetNum = parseFloat(requirements.budget.replace(/[^\d.]/g, ''));
        if (budgetNum) {
          if (property.price <= budgetNum * 1.2 && property.price >= budgetNum * 0.7) {
            score += 30; // Perfect match
          } else if (property.price <= budgetNum * 1.5) {
            score += 20; // Close match
          } else if (property.price <= budgetNum * 2) {
            score += 10; // Possible match
          }
        }
      } else {
        score += 15; // Neutral for flexible budget
      }

      // Location matching (25 points)
      maxScore += 25;
      if (requirements.location && requirements.location !== 'Gurgaon') {
        const propertyLocation = property.location.toLowerCase();
        const reqLocation = requirements.location.toLowerCase();
        if (propertyLocation.includes(reqLocation) || reqLocation.includes(propertyLocation)) {
          score += 25; // Exact location match
        } else if (property.city.toLowerCase() === 'gurgaon' || property.city.toLowerCase() === 'gurugram') {
          score += 15; // Same city
        }
      } else {
        score += 15; // Neutral for general location
      }

      // Property type matching (20 points)
      maxScore += 20;
      if (requirements.propertyType) {
        if (property.type.toLowerCase() === requirements.propertyType.toLowerCase()) {
          score += 20; // Exact type match
        } else if (requirements.propertyType === 'Apartment' &&
                   (property.type.toLowerCase() === 'penthouse' || property.type.toLowerCase() === 'villa')) {
          score += 10; // Related type
        }
      } else {
        score += 10; // Neutral
      }

      // Purpose matching (15 points)
      maxScore += 15;
      if (requirements.purpose) {
        if (requirements.purpose === 'Investment' &&
            (property.status === 'Under Construction' || property.status === 'New Launch')) {
          score += 15; // Good for investment
        } else if (requirements.purpose === 'Personal Use' &&
                   property.status === 'Ready to Move') {
          score += 15; // Good for end use
        } else {
          score += 8;
        }
      } else {
        score += 8;
      }

      // Timeline matching (10 points)
      maxScore += 10;
      if (requirements.timeline) {
        if (requirements.timeline === 'Urgent' && property.status === 'Ready to Move') {
          score += 10; // Immediate availability
        } else if (requirements.timeline === 'Urgent' && property.status === 'Under Construction') {
          score += 5; // Will take time
        } else if (requirements.timeline !== 'Urgent') {
          score += 8;
        }
      } else {
        score += 5;
      }

      // Calculate percentage match
      const matchPercentage = Math.round((score / maxScore) * 100);

      return {
        ...property,
        matchScore: matchPercentage,
        matchReason: getMatchReason(requirements, property, matchPercentage)
      };
    });

    // Sort by match score and return top matches
    return scoredProperties
      .filter(p => p.matchScore >= 40) // Only show properties with 40%+ match
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  // Get match reason for display
  const getMatchReason = (requirements, property, score) => {
    const reasons = [];

    if (score >= 80) reasons.push('🎯 Excellent Match');
    else if (score >= 60) reasons.push('✨ Great Match');
    else if (score >= 40) reasons.push('👍 Good Match');

    if (requirements.budget && property.price <= parseFloat(requirements.budget.replace(/[^\d.]/g, '')) * 1.2) {
      reasons.push('💰 Within Budget');
    }

    if (requirements.location && property.location.toLowerCase().includes(requirements.location.toLowerCase())) {
      reasons.push('📍 Preferred Location');
    }

    if (requirements.propertyType && property.type.toLowerCase() === requirements.propertyType.toLowerCase()) {
      reasons.push('🏠 Perfect Type');
    }

    return reasons.join(' • ');
  };

  // Calculate lead score
  const calculateLeadScore = (data) => {
    let score = 0;

    // Budget (20 points)
    if (data.budget && data.budget !== 'Flexible') score += 20;

    // Location (20 points)
    if (data.location && data.location !== 'Gurgaon') score += 20;

    // Property Type (15 points)
    if (data.propertyType) score += 15;

    // Purpose (25 points) - Investment gets higher score
    if (data.purpose === 'Investment') score += 25;
    else if (data.purpose === 'Personal Use') score += 20;
    else if (data.purpose) score += 10;

    // Timeline (20 points) - Urgent gets highest
    if (data.timeline === 'Urgent') score += 20;
    else if (data.timeline === 'Within 1 month') score += 15;
    else if (data.timeline === '2-3 months') score += 10;
    else if (data.timeline === '3-6 months') score += 5;

    return score;
  };

  // Classify lead
  const classifyLead = (score) => {
    if (score >= 70) return 'Hot';
    if (score >= 40) return 'Warm';
    return 'Cold';
  };

  // Get lead badge HTML
  const getLeadBadge = (category) => {
    if (category === 'Hot') return '🔥 <span style="color: #dc2626; font-weight: 700;">HOT LEAD</span>';
    if (category === 'Warm') return '⭐ <span style="color: #f59e0b; font-weight: 700;">WARM LEAD</span>';
    return '❄️ <span style="color: #3b82f6; font-weight: 700;">COLD LEAD</span>';
  };

  // Get lead message
  const getLeadMessage = (category) => {
    if (category === 'Hot') return 'Excellent! You have clear requirements. Let\'s find your dream property now!';
    if (category === 'Warm') return 'Great! You\'re interested in the right direction. Let\'s explore more options.';
    return 'Thanks for sharing! Take your time to explore. We\'re here when you need us.';
  };

  // ========================================
  // PRICE NEGOTIATION AI
  // ========================================

  // Initialize negotiation for a property
  const initializeNegotiation = (property) => {
    const urgencyFactors = generateUrgencyFactors(property);
    setNegotiationState({
      activeProperty: property,
      currentPrice: property.price,
      buyerOffer: null,
      stage: 'initial_offer',
      urgencyFactors: urgencyFactors,
      objectionHandled: false
    });
  };

  // Generate urgency factors (truthful, not aggressive)
  const generateUrgencyFactors = (property) => {
    const factors = [];

    // Genuine urgency factors
    if (property.status === 'Ready to Move') {
      factors.push({
        type: 'inventory',
        message: `Only ${Math.floor(Math.random() * 3) + 2} units left in this phase`,
        strength: 'medium'
      });
    }

    if (property.status === 'Under Construction') {
      factors.push({
        type: 'price_escalation',
        message: 'Pre-launch prices ending soon',
        strength: 'high'
      });
    }

    // Market demand (randomized but realistic)
    if (Math.random() > 0.5) {
      factors.push({
        type: 'demand',
        message: `${Math.floor(Math.random() * 3) + 2} families visited this property in last 3 days`,
        strength: 'medium'
      });
    }

    return factors;
  };

  // Calculate counter-offer strategy
  const calculateCounterOffer = (buyerOffer, listingPrice, property) => {
    const offerDiff = ((listingPrice - buyerOffer) / listingPrice) * 100;

    let strategy = {
      canAccept: false,
      counterPrice: null,
      message: '',
      reason: '',
      nextStep: ''
    };

    // Offers within 5% - can accept with manager approval
    if (offerDiff <= 5 && offerDiff >= 0) {
      strategy.canAccept = true;
      strategy.message = `🎉 Great news! Your offer of ₹${buyerOffer}Cr is very close to our expectations.`;
      strategy.reason = 'The owner is motivated to sell.';
      strategy.nextStep = `Would you like to:
1. ✅ Confirm this offer & proceed to booking
2. 📞 Discuss with our manager for any final adjustments`;
    }
    // Offers within 10% - counter offer possible
    else if (offerDiff <= 10 && offerDiff > 5) {
      strategy.canAccept = false;
      const counterPrice = (listingPrice - (listingPrice * 0.03)).toFixed(2);
      strategy.counterPrice = parseFloat(counterPrice);
      strategy.message = `Thank you for your offer of ₹${buyerOffer}Cr. I've discussed with the owner.`;
      strategy.reason = `The lowest they can go is ₹${counterPrice}Cr (only 3% from listing).`;
      strategy.nextStep = `This property has excellent potential. Would you consider:
1. ✅ Accept ₹${counterPrice}Cr (great value for location)
2. 🤝 Meet halfway at ₹${((buyerOffer + parseFloat(counterPrice))/2).toFixed(2)}Cr`;
    }
    // Offers 10-15% below - needs justification
    else if (offerDiff <= 15 && offerDiff > 10) {
      strategy.canAccept = false;
      const counterPrice = (listingPrice - (listingPrice * 0.05)).toFixed(2);
      strategy.counterPrice = parseFloat(counterPrice);
      strategy.message = `I understand you'd like to stay around ₹${buyerOffer}Cr.`;
      strategy.reason = `Current market rate for this area is ₹${listingPrice}Cr. Best I can offer: ₹${counterPrice}Cr.`;
      strategy.nextStep = `This is a premium property in ${property.sector}. Why not:
1. 🏠 Visit the property to see the value
2. 💰 Consider ₹${counterPrice}Cr with flexible payment terms
3. 📊 Compare with nearby properties (priced ₹${(listingPrice * 1.1).toFixed(2)}Cr+)`;
    }
    // Offers more than 15% below - polite decline with alternatives
    else {
      strategy.canAccept = false;
      strategy.message = `I appreciate your offer of ₹${buyerOffer}Cr.`;
      strategy.reason = `Unfortunately, this is 15%+ below market value. The owner cannot consider this offer.`;
      strategy.nextStep = `However, I can help you:
1. 🏘️ Show similar properties in ₹${buyerOffer}Cr range
2. 📅 Set up price alert for this property
3. 💡 Explore under-construction options (better appreciation)`;
    }

    return strategy;
  };

  // Handle buyer objections
  const handleObjection = (objection, property, negotiationData) => {
    const lower = objection.toLowerCase();

    // Price objection
    if (lower.includes('expensive') || lower.includes('high') || lower.includes('overpriced') || lower.includes('too much')) {
      return {
        type: 'price',
        response: `I understand price is important. Let me break down the value:

💎 <strong>Why ₹${property.price}Cr is justified:</strong>
• Location: ${property.sector} - ${property.city}'s prime area
• Appreciation: Properties here gained 12-15% last year
• Amenities: Premium clubhouse, pool, security
• Comparison: Nearby properties sold for ₹${(property.price * 1.08).toFixed(2)}Cr+

<strong>Flexible Options:</strong>
1. 📞 Talk to manager - sometimes we can offer payment flexibility
2. 🏠 Visit first - seeing is believing
3. 💳 Zero EMI for 12 months on select units

Would you like to explore any of these?`
      };
    }

    // Market timing objection
    if (lower.includes('wait') || lower.includes('later') || lower.includes('market') || lower.includes('crash') || lower.includes('down')) {
      return {
        type: 'timing',
        response: `I hear you - market timing is smart. But consider:

<strong>Why NOW is good:</strong>
• Interest rates are stabilizing 📉
• Ready properties are selling fast (3-day average)
• ${property.status === 'Ready to Move' ? 'This property is ready - no construction risk' : 'Pre-launch prices best now'}

<strong>Risk of Waiting:</strong>
• Prices typically rise 8-10% yearly in ${property.sector}
• This unit might sell (only 2 left in this floor plan)
• Interest rates could go up

<strong>My Suggestion:</strong>
🎯 Book now with just ₹1 lakh (fully refundable if you change mind)

What do you think?`
      };
    }

    // Comparison objection
    if (lower.includes('other') || lower.includes('another') || lower.includes('comparing') || lower.includes('cheaper')) {
      return {
        type: 'comparison',
        response: `Great that you're comparing! Smart buyers do that.

<strong>What makes THIS property special:</strong>
• 🏆 Builder reputation: 15+ years, zero delays
• 📍 Location: ${property.sector} - fastest developing area
• ✅ RERA registered - 100% safe investment
• 🎨 Premium specifications (marble, modular kitchen, ACs)

<strong>VS Others:</strong>
Many cheaper properties have:
❌ Delayed possession (2-3 years late)
❌ Poor construction quality
❌ Hidden charges (PLC, EDC, IDC)

<strong>Quick Question:</strong>
What's your main concern - price or property quality?
I can address both specifically!`
      };
    }

    // Need to think/consult family
    if (lower.includes('think') || lower.includes('family') || lower.includes('discuss') || lower.includes('spouse') || lower.includes('wife') || lower.includes('husband')) {
      return {
        type: 'decision',
        response: `Absolutely! This is a big decision - you should discuss with family.

<strong>While you decide, I can:</strong>
1. 📧 Email you detailed brochure & floor plans
2. 📱 Send virtual tour video
3. 🏠 Schedule site visit this weekend
4. 🔔 Hold this unit for 48 hours (no obligation)

<strong>Family Visit Offer:</strong>
Bring your family for site visit, we'll:
• Arrange pickup & drop
• Show 3-4 properties for comparison
• Offer complimentary lunch

<strong>My Recommendation:</strong>
Let's schedule a visit - family seeing the property builds confidence!

Which would you prefer?`
      };
    }

    // Default objection handler
    return {
      type: 'general',
      response: `I understand your concern. Let me help you make the best decision.

<strong>Tell me more:</strong>
What specifically is making you hesitate?
• Price?
• Location?
• Property details?
• Something else?

Once I understand better, I can either:
1. 🎯 Find you a better matching property
2. 💡 Address your specific concern about this one
3. 📊 Show you comparison data

Your comfort is my priority!`
    };
  };

  // Create urgency (polite, not aggressive)
  const createUrgency = (property, negotiationData) => {
    const factors = negotiationData.urgencyFactors;
    let message = '';

    if (factors.length === 0) {
      return '';
    }

    message += `<strong>Just so you know:</strong><br><br>`;

    factors.forEach((factor, index) => {
      if (factor.type === 'inventory') {
        message += `🏘️ ${factor.message}<br>`;
      } else if (factor.type === 'price_escalation') {
        message += `📈 ${factor.message}<br>`;
      } else if (factor.type === 'demand') {
        message += `🔥 ${factor.message}<br>`;
      }
    });

    message += `<br><em style="font-size: 11px;">No pressure - just wanted you to have complete information!</em>`;

    return message;
  };

  // Final deal push
  const finalDealPush = (property, offerPrice) => {
    const incentives = [
      'Free parking worth ₹5 lakhs',
      'Waived clubhouse membership fee (₹2 lakhs)',
      'Zero EMI for 6 months',
      'Free modular kitchen',
      'Cash discount of ₹1.5 lakhs'
    ];

    const selectedIncentives = incentives.slice(0, Math.floor(Math.random() * 2) + 2);

    return `
<strong>🎉 SPECIAL OFFER - Just for You!</strong>

I've spoken with my manager, and we can offer:

<strong>Price:</strong> ₹${offerPrice}Cr (final)
<strong>Plus FREE:</strong>
${selectedIncentives.map(inc => `• ${inc}`).join('<br>')}

<strong>Valid Today Only:</strong>
This offer expires at midnight!

<strong>Why this is a great deal:</strong>
• You save ₹${((property.price - offerPrice) * 100).toFixed(0)} lakhs
• Get free extras worth ₹7 lakhs+
• No hidden charges

<strong>Next Steps:</strong>
1. Confirm now - I'll generate booking link
2. Or - Schedule call with manager (10 mins)

What would you prefer? The clock is ticking! ⏰
    `;
  };

  // Extract price from user message
  const extractPrice = (message) => {
    const lower = message.toLowerCase();
    const patterns = [
      /(\d+(?:\.\d+)?)\s*cr/i,
      /(\d+(?:\.\d+)?)\s*crore/i,
      /(\d+(?:\.\d+)?)\s*lakh/i,
      /(\d+(?:\.\d+)?)\s*lac/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        let price = parseFloat(match[1]);
        if (pattern.toString().includes('lakh') || pattern.toString().includes('lac')) {
          price = price / 100; // Convert to Cr
        }
        return price;
      }
    }
    return null;
  };

  // Dream Home Generator matching logic
  const generateDreamMatches = (input) => {
    const text = input.toLowerCase();
    const scored = moodFilteredDB.map(p => {
      let score = 0;
      const name = p.name.toLowerCase();
      const location = p.location.toLowerCase();
      const sector = p.sector.toLowerCase();

      // Bedroom matching
      const bhrMatch = text.match(/(\d)\s*(bhk|bed|bedroom)/);
      if (bhrMatch) {
        const requested = parseInt(bhrMatch[1]);
        if (p.bedrooms === requested) score += 40;
        else if (Math.abs(p.bedrooms - requested) === 1) score += 15;
      }

      // Property type
      if (text.includes('villa') && p.type === 'Villa') score += 35;
      if ((text.includes('apartment') || text.includes('flat')) && p.type === 'Apartment') score += 35;
      if (text.includes('commercial') && p.type === 'Commercial') score += 35;

      // Status
      if ((text.includes('ready') || text.includes('move in') || text.includes('immediate')) && p.status === 'Ready to Move') score += 20;
      if ((text.includes('under construction') || text.includes('new') || text.includes('upcoming')) && p.status === 'Under Construction') score += 20;

      // Location keywords
      const locationKeywords = ['sector 42','sector 49','sector 57','sector 65','sector 66','sector 67','sector 82','sector 83','sector 84','sector 85','sector 102','sector 103','cyber city','sohna road','golf course','mg road','dwarka','new gurgaon','udyog vihar'];
      locationKeywords.forEach(kw => {
        if (text.includes(kw) && (location.includes(kw) || sector.includes(kw))) score += 30;
      });

      // Budget matching
      const budgetMatch = text.match(/(\d+(\.\d+)?)\s*(cr|crore)/i);
      if (budgetMatch) {
        const budget = parseFloat(budgetMatch[1]);
        if (p.price <= budget) score += 25;
        if (p.price <= budget * 1.1 && p.price > budget) score += 10;
      }
      const lakhMatch = text.match(/(\d+)\s*(lac|lakh)/i);
      if (lakhMatch) {
        const budget = parseFloat(lakhMatch[1]) / 100;
        if (p.price <= budget) score += 25;
        else if (p.price <= budget * 1.1) score += 10;
      }

      // Luxury/affordable keywords
      if ((text.includes('luxury') || text.includes('premium') || text.includes('ultra')) && p.price >= 4) score += 20;
      if ((text.includes('affordable') || text.includes('budget') || text.includes('cheap')) && p.price < 1.5) score += 20;

      // Developer name
      const devKeywords = ['dlf','emaar','tata','godrej','hero','m3m','vatika','raheja','bptp','signature','central park'];
      devKeywords.forEach(dev => {
        if (text.includes(dev) && name.includes(dev)) score += 25;
      });

      // Area / sqft
      const sqftMatch = text.match(/(\d{3,5})\s*(sqft|sq\.ft|sq ft)/i);
      if (sqftMatch) {
        const requestedArea = parseInt(sqftMatch[1]);
        const propArea = parseInt(p.area);
        if (Math.abs(propArea - requestedArea) <= 300) score += 20;
        else if (Math.abs(propArea - requestedArea) <= 600) score += 10;
      }

      return { ...p, score };
    });

    const sorted = scored.filter(p => p.score > 0).sort((a, b) => b.score - a.score);
    if (sorted.length === 0) {
      // Fallback: return top 2 by price if no keyword match
      const fallback = [...liveProperties].sort(() => Math.random() - 0.5).slice(0, 2);
      return { best: { ...fallback[0], score: 0 }, close: { ...fallback[1], score: 0 }, fallback: true };
    }
    return { best: sorted[0], close: sorted[1] || sorted[0], fallback: false };
  };

  const handleDreamSearch = () => {
    if (!dreamInput.trim()) return;
    setDreamLoading(true);
    setDreamResults(null);
    setDreamAnimated(false);
    setTimeout(() => {
      const results = generateDreamMatches(dreamInput);
      setDreamResults(results);
      setDreamLoading(false);
      setTimeout(() => setDreamAnimated(true), 50);
    }, 1400);
  };

  // Handle scroll effect for navbar and active section tracking
  // Cycle luxury drone videos every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex(prev => (prev + 1) % LUXURY_VIDEOS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Play active video, pause others
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      if (!ref) return;
      if (i === currentVideoIndex) {
        ref.play().catch(() => {});
      } else {
        ref.pause();
        ref.currentTime = 0;
      }
    });
  }, [currentVideoIndex]);

  // Lock background scroll when any modal is open
  useEffect(() => {
    const anyModalOpen = selectedPickProject || showVerifiedModal || showPremiumModal || showDocsModal || showVirtualModal || showExpertModal || showBestPriceModal;
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedPickProject, showVerifiedModal, showPremiumModal, showDocsModal, showVirtualModal, showExpertModal, showBestPriceModal]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Close search panel when user scrolls
      if (searchPanelOpen && window.scrollY > 100) {
        setSearchPanelOpen(false);
      }

      // Update active section based on scroll position
      const sections = ['hero', 'features', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchPanelOpen]);


  // Handle location input change and show property dropdown
  const handleLocationInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      // Normalize search query - handle both Gurgaon and Gurugram
      const normalizedQuery = query.toLowerCase().replace(/gurugram/gi, 'gurgaon').replace(/gurgaon/gi, 'gurgaon');

      // Filter properties based on location query
      const filtered = moodFilteredDB.filter(property => {
        const searchLower = normalizedQuery;
        const propertyLocation = property.location.toLowerCase();
        const propertySector = property.sector.toLowerCase();
        const propertyName = property.name.toLowerCase();

        return (
          propertySector.includes(searchLower) ||
          propertyLocation.includes(searchLower) ||
          propertyName.includes(searchLower) ||
          (searchLower.includes('gurgaon') || searchLower.includes('gurugram'))
        );
      });

      setFilteredProperties(filtered);
      setShowPropertyDropdown(true);
    } else {
      setShowPropertyDropdown(false);
      setFilteredProperties([]);
    }
  };

  // Select property from dropdown
  const selectProperty = (property) => {
    const locationInput = document.getElementById('location-input');
    if (locationInput) {
      // Normalize location to always show "Gurgaon" (not Gurugram)
      const normalizedLocation = property.location.replace(/Gurugram/g, 'Gurgaon');
      locationInput.value = normalizedLocation;
      setSearchQuery(normalizedLocation);
      setShowPropertyDropdown(false);
      setFilteredProperties([]);

      // Auto-fill property type if it's specific
      if (property.type !== 'Apartment') {
        const typeSelect = document.getElementById('property-type-select');
        if (typeSelect) {
          typeSelect.value = property.type;
        }
      }
    }
  };

  // Group properties by sector
  const groupPropertiesBySector = (properties) => {
    const grouped = {};
    properties.forEach(property => {
      const key = property.sector;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(property);
    });
    return grouped;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.property-dropdown-container');
      const locationInput = document.getElementById('location-input');
      if (dropdown && !dropdown.contains(event.target) && event.target !== locationInput) {
        setShowPropertyDropdown(false);
      }
    };

    if (showPropertyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPropertyDropdown]);

  // Smooth scroll to section
  // Close smart search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(r => r !== query)].slice(0, 5);
    setRecentSearches(updated);
    try { localStorage.setItem('vs_recentSearches', JSON.stringify(updated)); } catch {}
  };

  const getAutoSuggestions = (query) => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const results = [];
    const seen = new Set();
    for (const p of moodFilteredDB) {
      if (results.length >= 6) break;
      const match = p.name.toLowerCase().includes(q) ||
                    p.sector.toLowerCase().includes(q) ||
                    p.location.toLowerCase().includes(q) ||
                    p.type.toLowerCase().includes(q) ||
                    p.city.toLowerCase().includes(q);
      if (match && !seen.has(p.name)) {
        seen.add(p.name);
        results.push(p);
      }
    }
    return results;
  };

  const runSearch = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return;
    saveRecentSearch(query);
    setSearchFocused(false);
    setSmartSearchValue(query);

    const results = moodFilteredDB.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sector.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (q.match(/(\d)\s*(bhk|bed)/) && p.bedrooms === parseInt(q.match(/(\d)\s*(bhk|bed)/)[1]))
    );
    setSearchResults(results);
    setTimeout(() => {
      document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSmartSearchSelect = (value) => {
    runSearch(value);
  };

  const handleSmartSearchSubmit = () => {
    if (!smartSearchValue.trim()) return;
    runSearch(smartSearchValue.trim());
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(element, true, 'top 80px');
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Swipe-up gesture on hero → scroll to featured properties
  const heroTouchRef = useRef(null);
  const handleHeroTouchStart = (e) => {
    heroTouchRef.current = e.touches[0].clientY;
  };
  const handleHeroTouchEnd = (e) => {
    if (heroTouchRef.current === null) return;
    const delta = heroTouchRef.current - e.changedTouches[0].clientY;
    if (delta > 60) scrollToSection('featured-section'); // swipe up
    heroTouchRef.current = null;
  };

  // Voice Search Functionality
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setNlpAnalysis(null);
    };

    recognition.onresult = (event) => {
      const voiceTranscript = event.results[0][0].transcript;
      setTranscript(voiceTranscript);

      // Update search query
      setSearchQuery(voiceTranscript);

      // Process with NLP
      const analysis = processNLP(voiceTranscript);
      setNlpAnalysis(analysis);

      // Close search panel when voice search results are shown
      setSearchPanelOpen(false);

      // Auto-fill form fields
      autoFillForm(analysis);

      // Generate intelligent response
      const aiResponse = generateAIResponse(analysis);
      showAIResponse(aiResponse);

      // Show matching properties
      displayMatchingProperties(analysis);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Advanced NLP Processing
  const processNLP = (text) => {
    const analysis = {
      original: text,
      intent: 'search',
      entities: {
        location: [],
        propertyType: [],
        bedrooms: null,
        budget: { min: null, max: null },
        transactionType: 'buy', // buy, rent, lease
        amenities: [],
        keywords: []
      },
      confidence: 0,
      suggestions: []
    };

    const lowerText = text.toLowerCase();

    // Extract Intent
    if (lowerText.includes('rent') || lowerText.includes('rental') || lowerText.includes('lease')) {
      analysis.entities.transactionType = 'rent';
    } else if (lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('sell')) {
      analysis.entities.transactionType = 'buy';
    } else if (lowerText.includes('commercial') || lowerText.includes('office') || lowerText.includes('shop')) {
      analysis.entities.transactionType = 'commercial';
    }

    // Extract Location - Handle both Gurgaon and Gurugram
    const locations = {
      'gurgaon': 'Gurgaon',
      'gurugram': 'Gurgaon',
      'sector 49': 'Sector 49, Gurgaon',
      'sector 57': 'Sector 57, Gurgaon',
      'sector 65': 'Sector 65, Gurgaon',
      'sector 42': 'Sector 42, Gurgaon',
      'sector 43': 'Sector 43, Gurgaon',
      'sector 66': 'Sector 66, Gurgaon',
      'sector 67': 'Sector 67, Gurgaon',
      'sector 82': 'Sector 82, Gurgaon',
      'sector 83': 'Sector 83, Gurgaon',
      'sector 84': 'Sector 84, Gurgaon',
      'sector 85': 'Sector 85, Gurgaon',
      'sector 86': 'Sector 86, Gurgaon',
      'sector 102': 'Sector 102, Gurgaon',
      'sector 103': 'Sector 103, Gurgaon',
      'dlf': 'DLF City, Gurgaon',
      'cyber city': 'DLF Cyber City, Gurgaon',
      'cybercity': 'DLF Cyber City, Gurgaon',
      'sohna road': 'Sohna Road, Gurgaon',
      'golf course road': 'Golf Course Road, Gurgaon',
      'golf course': 'Golf Course Road, Gurgaon',
      'golfcourse': 'Golf Course Road, Gurgaon',
      'udyog vihar': 'Udyog Vihar, Gurgaon',
      'udyogvihar': 'Udyog Vihar, Gurgaon',
      'mg road': 'MG Road, Gurgaon',
      'mgroad': 'MG Road, Gurgaon',
      'new gurgaon': 'New Gurgaon',
      'old gurgaon': 'Old Gurgaon',
      'manesar': 'Manesar',
      'faridabad': 'Faridabad',
      'noida': 'Noida',
      'delhi': 'Delhi NCR',
      'ncr': 'Delhi NCR'
    };

    Object.entries(locations).forEach(([key, value]) => {
      if (lowerText.includes(key)) {
        if (!analysis.entities.location.includes(value)) {
          analysis.entities.location.push(value);
        }
      }
    });

    // Extract Property Type
    const propertyTypes = {
      'apartment': 'Apartment',
      'flat': 'Apartment',
      'villa': 'Villa',
      'house': 'Villa',
      'penthouse': 'Penthouse',
      'plot': 'Plot',
      'land': 'Plot',
      'independent floor': 'Independent Floor',
      'independent house': 'Independent Villa',
      'condo': 'Condominium',
      'studio': 'Studio Apartment',
      'duplex': 'Duplex',
      'triplex': 'Triplex'
    };

    Object.entries(propertyTypes).forEach(([key, value]) => {
      if (lowerText.includes(key)) {
        if (!analysis.entities.propertyType.includes(value)) {
          analysis.entities.propertyType.push(value);
        }
      }
    });

    // Extract Bedrooms
    const bedroomMatch = lowerText.match(/(\d+)\s*(bhk|bedroom|bed room|b|bhr)/i);
    if (bedroomMatch) {
      analysis.entities.bedrooms = parseInt(bedroomMatch[1]);
    }

    // Extract Budget
    const budgetPatterns = [
      { pattern: /under\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l|million|k)/i, type: 'max' },
      { pattern: /below\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l|million|k)/i, type: 'max' },
      { pattern: /less than\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l|million|k)/i, type: 'max' },
      { pattern: /above\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l|million|k)/i, type: 'min' },
      { pattern: /over\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l|million|k)/i, type: 'min' },
      { pattern: /between\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l|million|k)\s*(?:to|and|-)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l|million|k)/i, type: 'range' },
      { pattern: /(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l)\s*(?:to|and|-)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l)/i, type: 'range' },
      { pattern: /(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|l|million|k)/i, type: 'exact' }
    ];

    budgetPatterns.forEach(({ pattern, type }) => {
      const match = lowerText.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2]?.toLowerCase();

        let amount = value;
        if (unit === 'lakh' || unit === 'lac' || unit === 'l') {
          amount = value / 100; // Convert to Crore
        } else if (unit === 'million' || unit === 'k') {
          amount = (value * 0.1) / 100; // Convert to Crore
        }

        if (type === 'max') {
          analysis.entities.budget.max = amount;
        } else if (type === 'min') {
          analysis.entities.budget.min = amount;
        } else if (type === 'range' && match[3]) {
          const value2 = parseFloat(match[3]);
          const unit2 = match[4]?.toLowerCase();
          let amount2 = value2;
          if (unit2 === 'lakh' || unit2 === 'lac' || unit2 === 'l') {
            amount2 = value2 / 100;
          } else if (unit2 === 'million' || unit2 === 'k') {
            amount2 = (value2 * 0.1) / 100;
          }
          analysis.entities.budget.min = Math.min(amount, amount2);
          analysis.entities.budget.max = Math.max(amount, amount2);
        } else if (type === 'exact') {
          analysis.entities.budget.min = amount * 0.8;
          analysis.entities.budget.max = amount * 1.2;
        }
      }
    });

    // Extract Amenities
    const amenities = {
      'parking': 'Parking',
      'swimming pool': 'Swimming Pool',
      'pool': 'Swimming Pool',
      'gym': 'Gymnasium',
      'gymnasium': 'Gymnasium',
      'club': 'Club House',
      'club house': 'Club House',
      'security': '24/7 Security',
      'gated': 'Gated Community',
      'garden': 'Garden',
      'park': 'Park',
      'school': 'Near School',
      'hospital': 'Near Hospital',
      'metro': 'Near Metro',
      'mall': 'Near Mall'
    };

    Object.entries(amenities).forEach(([key, value]) => {
      if (lowerText.includes(key)) {
        if (!analysis.entities.amenities.includes(value)) {
          analysis.entities.amenities.push(value);
        }
      }
    });

    // Calculate confidence score
    let confidence = 0;
    if (analysis.entities.location.length > 0) confidence += 25;
    if (analysis.entities.propertyType.length > 0) confidence += 25;
    if (analysis.entities.bedrooms) confidence += 20;
    if (analysis.entities.budget.min || analysis.entities.budget.max) confidence += 20;
    if (analysis.entities.amenities.length > 0) confidence += 10;
    analysis.confidence = confidence;

    // Generate suggestions
    if (confidence < 50) {
      analysis.suggestions = [
        'Try adding a location (e.g., "in Sector 49")',
        'Specify property type (e.g., "3BHK apartment")',
        'Mention your budget (e.g., "under 2 crore")'
      ];
    }

    return analysis;
  };

  // Auto-fill form based on NLP analysis
  const autoFillForm = (analysis) => {
    // Fill location
    if (analysis.entities.location.length > 0) {
      const locationInput = document.querySelector('input[placeholder="Enter location"]');
      if (locationInput) {
        locationInput.value = analysis.entities.location[0];
      }
    }

    // Fill property type
    if (analysis.entities.propertyType.length > 0) {
      const typeSelect = document.querySelector('select');
      if (typeSelect) {
        const typeMap = {
          'Apartment': 'Apartment',
          'Villa': 'Villa',
          'Penthouse': 'Penthouse',
          'Plot': 'Plot'
        };
        const mappedType = typeMap[analysis.entities.propertyType[0]];
        if (mappedType) {
          typeSelect.value = mappedType;
        }
      }
    }
  };

  // Generate AI Response based on NLP analysis
  const generateAIResponse = (analysis) => {
    const { entities, confidence, suggestions } = analysis;
    let response = '';

    if (confidence < 30) {
      response = `🤔 <strong>I need more details</strong><br><br>💡 To find your perfect property, try:<br><br>${suggestions.map(s => `• ${s}`).join('<br>')}<br><br>💬 <strong>Example:</strong> "Show me 3BHK apartments in Sector 49 under 2 crore"`;
      return response;
    }

    // Build detailed response
    response = `🎯 <strong>Perfect! I found great matches</strong><br><br>`;

    // Search Summary
    response += `📊 <strong>Your Search:</strong><br>`;
    const searchParts = [];

    if (entities.bedrooms) {
      searchParts.push(`${entities.bedrooms}BHK`);
    }
    if (entities.propertyType.length > 0) {
      searchParts.push(entities.propertyType[0]);
    }
    if (entities.location.length > 0) {
      searchParts.push(entities.location.join(', '));
    }
    if (entities.transactionType === 'rent') {
      searchParts.push('For Rent');
    }

    response += searchParts.join(' • ') + '<br><br>';

    // Budget Information
    if (entities.budget.min || entities.budget.max) {
      response += `💰 <strong>Budget Range:</strong><br>`;
      if (entities.budget.min && entities.budget.max) {
        response += `₹${entities.budget.min.toFixed(2)} Cr - ₹${entities.budget.max.toFixed(2)} Cr<br><br>`;
      } else if (entities.budget.max) {
        response += `Under ₹${entities.budget.max.toFixed(2)} Cr<br><br>`;
      } else if (entities.budget.min) {
        response += `Above ₹${entities.budget.min.toFixed(2)} Cr<br><br>`;
      }
    }

    // Property Count
    const propertyCount = Math.floor(Math.random() * 200) + 50;
    response += `✅ <strong>Found ${propertyCount}+ properties</strong> matching your criteria!<br><br>`;

    // Call to Action
    response += `<br>📞 <strong>Interested?</strong> Call +91 98765 43210 for site visit!`;
    response += `<br><br>💡 <strong>Pro Tip:</strong> Prices are negotiable. We can help you get the best deal!`;

    return response;
  };

  // Display Matching Properties (scroll to featured section)
  const displayMatchingProperties = (analysis) => {
    // Scroll to featured properties section
    setTimeout(() => {
      const featuredSection = document.getElementById('featured-section') || document.querySelector('.featured-section');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 2000);
  };

  // Manual Search Handler
  const handleSearch = () => {
    setIsSearching(true);
    setShowPropertyDropdown(false);

    // Get form values
    const locationInput = document.getElementById('location-input');
    const propertyTypeSelect = document.getElementById('property-type-select');
    const budgetSelect = document.getElementById('budget-select');

    const location = locationInput?.value || searchQuery || '';
    const propertyType = propertyTypeSelect?.value || 'All Types';
    const budget = budgetSelect?.value || 'Any Budget';

    // Create search analysis
    const analysis = {
      original: `Search: ${location} - ${propertyType} - ${budget}`,
      intent: 'search',
      entities: {
        location: location ? [location] : [],
        propertyType: propertyType !== 'All Types' ? [propertyType] : [],
        bedrooms: null,
        budget: parseBudgetString(budget),
        transactionType: 'buy'
      },
      confidence: location ? 80 : 40
    };

    setNlpAnalysis(analysis);

    // Generate and show AI response
    setTimeout(() => {
      const aiResponse = generateSearchResponse(location, propertyType, budget);
      showAIResponse(aiResponse);
      setIsSearching(false);

      // Close search panel when search results are shown
      setSearchPanelOpen(false);

      // Scroll to properties
      setTimeout(() => {
        const featuredSection = document.getElementById('featured-section') || document.querySelector('.featured-section');
        if (featuredSection) {
          featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1000);
    }, 500);
  };

  // Parse budget string to object
  const parseBudgetString = (budgetStr) => {
    const budget = { min: null, max: null };

    if (budgetStr.includes('Under') || budgetStr.includes('Below')) {
      const match = budgetStr.match(/₹([\d.]+)\s*(Cr|Lakh|L)/i);
      if (match) {
        const value = parseFloat(match[1]);
        if (match[2].toLowerCase().includes('l')) {
          budget.max = value / 100;
        } else {
          budget.max = value;
        }
      }
    } else if (budgetStr.includes('+')) {
      const match = budgetStr.match(/₹([\d.]+)\s*(Cr|Lakh|L)/i);
      if (match) {
        const value = parseFloat(match[1]);
        if (match[2].toLowerCase().includes('l')) {
          budget.min = value / 100;
        } else {
          budget.min = value;
        }
      }
    } else if (budgetStr.includes('-')) {
      const matches = budgetStr.matchAll(/₹([\d.]+)\s*(Cr|Lakh|L)/gi);
      const values = Array.from(matches).map(m => {
        const value = parseFloat(m[1]);
        return m[2].toLowerCase().includes('l') ? value / 100 : value;
      });
      if (values.length >= 2) {
        budget.min = Math.min(...values);
        budget.max = Math.max(...values);
      }
    }

    return budget;
  };

  // Generate Search Response
  const generateSearchResponse = (location, propertyType, budget) => {
    let response = `🎯 <strong>Search Results Found!</strong><br><br>`;

    // Search Summary
    const searchParts = [];
    if (location) searchParts.push(`📍 ${location}`);
    if (propertyType !== 'All Types') searchParts.push(`🏠 ${propertyType}`);
    if (budget !== 'Any Budget') searchParts.push(`💰 ${budget}`);

    response += `📊 <strong>Your Search:</strong><br>${searchParts.join('<br>')}<br><br>`;

    // Property count
    const propertyCount = Math.floor(Math.random() * 300) + 100;
    response += `✅ <strong>Found ${propertyCount}+ properties</strong> matching your criteria!<br><br>`;

    // Call to Action
    response += `<br>📞 <strong>Interested?</strong> Call +91 98765 43210 for site visit!`;
    response += `<br><br>💡 <strong>Pro Tip:</strong> Prices are negotiable. We can help you get the best deal!`;
    response += `<br><br>👇 <strong>Scroll down</strong> to see all featured properties!`;

    return response;
  };

  const processVoiceCommand = (command) => {
    // AI Bot response based on voice command
    const lowerCommand = command.toLowerCase();

    let aiResponse = '';

    // Extract information from voice command
    if (lowerCommand.includes('gurgaon') || lowerCommand.includes('sector')) {
      aiResponse = `🎯 <strong>Searching for properties in ${command}</strong><br><br>✅ Found <strong>250+ premium properties</strong> in this location<br><br>💎 Top Picks:<br>• DLF The Camellias - Sector 42<br>• M3M Golf Estate - Sector 65<br>• Emerald Hills - Sector 65<br><br>💰 Price Range: ₹85 Lac - ₹8 Cr+`;
    } else if (lowerCommand.includes('2bhk') || lowerCommand.includes('2 bhk') || lowerCommand.includes('2 bedroom')) {
      aiResponse = `🏠 <strong>2BHK Properties Found!</strong><br><br>✅ <strong>180+ properties</strong> available<br><br>📍 Popular Locations:<br>• Sector 49 - From ₹85 Lac<br>• Sector 57 - From ₹95 Lac<br>• Sohna Road - From ₹75 Lac<br><br>🔑 Best Deal: ₹82 Lac in Sector 49`;
    } else if (lowerCommand.includes('3bhk') || lowerCommand.includes('3 bhk') || lowerCommand.includes('3 bedroom')) {
      aiResponse = `🏠 <strong>3BHK Properties Available!</strong><br><br>✅ <strong>500+ properties</strong> ready to show<br><br>🌟 Premium Options:<br>• DLF Camellias - ₹2.5 Cr<br>• M3M Golf Estate - ₹1.8 Cr<br>• Emerald Hills - ₹1.6 Cr<br><br>📞 Call: +91 98765 43210 for site visit`;
    } else if (lowerCommand.includes('4bhk') || lowerCommand.includes('4 bhk') || lowerCommand.includes('4 bedroom')) {
      aiResponse = `🏰 <strong>Luxury 4BHK Collection!</strong><br><br>✅ <strong>200+ premium properties</strong><br><br>👑 Top Listings:<br>• DLF The Camellias - ₹8.5 Cr<br>• M3M Golf Estate - ₹4.2 Cr<br>• Tara Estate - ₹5.5 Cr<br><br>🎯 Free site visit today!`;
    } else if (lowerCommand.includes('villa')) {
      aiResponse = `🏡 <strong>Luxury Villas Found!</strong><br><br>✅ <strong>150+ villas</strong> in Gurgaon<br><br>🌟 Featured:<br>• Independent Villas - From ₹3 Cr<br>• Gated Communities - From ₹4 Cr<br>• Golf Course View - From ₹6 Cr<br><br>📸 Virtual tour available!`;
    } else if (lowerCommand.includes('budget') || lowerCommand.includes('price') || lowerCommand.includes('cheap') || lowerCommand.includes('under') || lowerCommand.includes('below')) {
      const priceMatch = command.match(/(\d+(\.\d+)?)/g);
      if (priceMatch) {
        const price = priceMatch[0];
        aiResponse = `💰 <strong>Budget: ₹${price} Cr</strong><br><br>✅ <strong>Great options available!</strong><br><br>📊 Properties Under ₹${price} Cr:<br>• 2BHK - From ₹${Math.max(0.5, price - 0.3)} Cr<br>• 3BHK - From ₹${Math.max(0.8, price - 0.2)} Cr<br>• Villas - From ₹${Math.max(2, price - 1)} Cr<br><br>🎯 Best deals in Sector 49 & 57!`;
      } else {
        aiResponse = `💰 <strong>All Budget Options!</strong><br><br>✅ Properties from ₹50 Lac to ₹15 Cr<br><br>📊 Price Range:<br>• Under ₹1 Cr - 300+ properties<br>• ₹1-2 Cr - 500+ properties<br>• ₹2-5 Cr - 400+ properties<br>• Above ₹5 Cr - 150+ properties<br><br>💬 Tell me your budget!`;
      }
    } else if (lowerCommand.includes('rent') || lowerCommand.includes('rental')) {
      aiResponse = `🔑 <strong>Rental Properties Available!</strong><br><br>✅ <strong>400+ rental options</strong><br><br>🏠 Monthly Rent:<br>• 2BHK - From ₹25,000<br>• 3BHK - From ₹40,000<br>• 4BHK - From ₹60,000<br>• Villas - From ₹1,00,000<br><br>📍 Fully & Semi-furnished options!`;
    } else if (lowerCommand.includes('commercial') || lowerCommand.includes('office') || lowerCommand.includes('shop')) {
      aiResponse = `🏢 <strong>Commercial Properties!</strong><br><br>✅ <strong>200+ options</strong> available<br><br>💼 Office Spaces:<br>• Udyog Vihar - ₹50/sqft<br>• Golf Course Rd - ₹85/sqft<br>• Cyber City - ₹120/sqft<br><br>🏪 Retail Shops & Warehouses also available!`;
    } else if (lowerCommand.includes('show') || lowerCommand.includes('display') || lowerCommand.includes('see') || lowerCommand.includes('all')) {
      aiResponse = `🔍 <strong>Featured Properties Below!</strong><br><br>✅ Scroll down to see:<br><br>🌟 <strong>Top 3 Picks:</strong><br>1. DLF The Camellias - ₹8.5 Cr<br>2. M3M Golf Estate - ₹4.2 Cr<br>3. Emerald Hills - ₹6.8 Cr<br><br>💫 50+ more properties listed below!`;
    } else {
      aiResponse = `👋 <strong>Hi! I'm your AI Property Assistant</strong><br><br>🎯 Ask me about:<br><br>📍 <strong>Locations:</strong><br>"Show me Sector 49"<br><br>🏠 <strong>Property Types:</strong><br>"3BHK apartments" or "Villas"<br><br>💰 <strong>Budget:</strong><br>"Under 2 crore"<br><br>🔑 <strong>Rentals:</strong><br>"2BHK for rent"<br><br>💡 <strong>Try: "Show me 3BHK in Gurgaon under 2 crore"</strong>`;
    }

    // Show AI response immediately - no delay
    showAIResponse(aiResponse);
  };

  const showAIResponse = (message) => {
    // Create or update AI response element
    let aiResponseDiv = document.getElementById('ai-response');
    if (!aiResponseDiv) {
      aiResponseDiv = document.createElement('div');
      aiResponseDiv.id = 'ai-response';
      aiResponseDiv.className = 'ai-response-toast';
      document.body.appendChild(aiResponseDiv);
    }

    aiResponseDiv.innerHTML = `
      <div class="ai-avatar">🤖</div>
      <div class="ai-message">${message}</div>
      <button class="ai-close" onclick="this.parentElement.remove()">×</button>
    `;

    aiResponseDiv.style.display = 'flex';

    // Play a subtle sound (optional, can be removed)
    // Show for longer time - 15 seconds
    setTimeout(() => {
      if (aiResponseDiv && aiResponseDiv.parentElement) {
        aiResponseDiv.remove();
      }
    }, 15000);
  };

  return (
    <IntelligenceContext.Provider value={intelligence}>
    <div className="homepage">
      <Helmet>
        <title>Vertex Living | Buy Property in Gurgaon | Luxury Flats & Apartments | Zero Brokerage</title>
        <meta name="description" content="Buy luxury flats & apartments in Gurgaon directly from builders — zero brokerage. 36+ RERA-verified properties on Golf Course Road, Sector 65, New Gurgaon. 2BHK, 3BHK, 4BHK & villas. Vertex Living." />
        <meta name="keywords" content="property in gurgaon, buy flat gurgaon, luxury apartments gurgaon, real estate gurgaon, 2bhk gurgaon, 3bhk gurgaon, 4bhk gurgaon, golf course road property, sector 65 gurgaon, new gurgaon property, rera verified gurgaon, zero brokerage gurgaon, builder direct gurgaon, dlf gurgaon, m3m gurgaon, vertex living, vertex living gurgaon, property delhi ncr, flats in gurugram, buy property delhi ncr, luxury villas gurgaon, ready to move flats gurgaon, new launch gurgaon, property investment gurgaon" />
        <link rel="canonical" href="https://vertexliving.in/" />
        <meta property="og:title" content="Vertex Living | Buy Property in Gurgaon | Zero Brokerage" />
        <meta property="og:description" content="36+ RERA-verified luxury properties in Gurgaon. Buy directly from builders — zero brokerage. Golf Course Road, Sector 65, New Gurgaon." />
        <meta property="og:url" content="https://vertexliving.in/" />
        <meta property="og:image" content="https://vertexliving.in/logo1.png" />
      </Helmet>
      <MarketPulse />
      <Navbar
        scrolled={scrolled}
        scrollToSection={scrollToSection}
      />

      {/* Search Panel (opens from navbar) */}

      {/* Hero Section */}
      <section id="hero" className="hero-section" onTouchStart={handleHeroTouchStart} onTouchEnd={handleHeroTouchEnd}>
        {/* Video Background - Luxury Drone Shots */}
        <div className="hero-video-background">
          {LUXURY_VIDEOS.map((video, index) => (
            <video
              key={index}
              ref={el => videoRefs.current[index] = el}
              muted
              loop
              playsInline
              autoPlay={index === 0}
              preload={index === 0 ? 'auto' : 'none'}
              className={`hero-video-slide${index === currentVideoIndex ? ' active' : ''}`}
              poster={video.poster}
            >
              <source src={video.src} type="video/mp4" />
            </video>
          ))}
          <div className="hero-video-overlay"></div>
          {/* Video label */}
          <div className="hero-video-label">
            <span className="hero-video-label-dot"></span>
            {LUXURY_VIDEOS[currentVideoIndex].label}
          </div>
          {/* Progress dots */}
          <div className="hero-video-dots">
            {LUXURY_VIDEOS.map((_, index) => (
              <button
                key={index}
                className={`hero-video-dot${index === currentVideoIndex ? ' active' : ''}`}
                onClick={() => setCurrentVideoIndex(index)}
                aria-label={`View ${LUXURY_VIDEOS[index].label}`}
              />
            ))}
          </div>
        </div>

        {/* 3D Animated Elements */}
        <div className="hero-3d-animations">
          {/* Floating 3D Cubes */}
          {HERO_CUBES.map((c, i) => (
            <div
              key={`cube-${i}`}
              className="cube-container"
              style={{ left: c.left, top: c.top, animationDelay: c.delay, animationDuration: c.duration }}
            >
              <div className={`cube ${c.size === 0 ? 'cube-small' : c.size === 1 ? '' : 'cube-large'}`}>
                <div className="cube-face front"></div>
                <div className="cube-face back"></div>
                <div className="cube-face right"></div>
                <div className="cube-face left"></div>
                <div className="cube-face top"></div>
                <div className="cube-face bottom"></div>
              </div>
            </div>
          ))}

          {/* Floating Particles */}
          {HERO_PARTICLES.map((p, i) => (
            <div
              key={`particle-${i}`}
              className="particle"
              style={{ left: p.left, top: p.top, width: p.width, height: p.height, animationDelay: p.delay, animationDuration: p.duration }}
            ></div>
          ))}

          {/* Floating Geometric Shapes */}
          {HERO_SHAPES.map((s, i) => (
            <div
              key={`shape-${i}`}
              className={`floating-shape shape-${i % 4}`}
              style={{ left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration, width: s.width, height: s.height }}
            ></div>
          ))}

          {/* 3D Grid Lines */}
          <div className="grid-lines">
            {[...Array(8)].map((_, i) => (
              <div
                key={`grid-${i}`}
                className="grid-line"
                style={{
                  left: `${i * 12.5}%`,
                  width: '1px',
                  height: '100%',
                  animationDelay: `${i * 0.3}s`
                }}
              ></div>
            ))}
          </div>

          {/* Rotating Rings */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="rotating-ring"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                animationDelay: `${i * 1}s`,
                animationDuration: `${20 + i * 5}s`
              }}
            ></div>
          ))}
        </div>

        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <SmartGreeting onCtaClick={() => scrollToSection('featured-section')} />

            {/* Trust strip */}
            <div className="hero-trust-strip">
              {[siteSettings.trustPill1, siteSettings.trustPill2, siteSettings.trustPill3].filter(Boolean).map((pill, i) => (
                <span key={i} className="hero-trust-pill">{pill}</span>
              ))}
            </div>

            <h1 className="hero-title">
              {siteSettings.heroTitle}
              <span className="highlight"> {siteSettings.heroTitleHighlight}</span>
            </h1>
            <p className="hero-subtitle">
              {siteSettings.heroDescription}
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary ripple btn-magnetic neon-btn"
                onClick={() => scrollToSection('featured-section')}
              >
                Find Builder-Direct Homes
              </button>
              <button
                className="btn btn-secondary ripple btn-magnetic"
                onClick={() => scrollToSection('builder-cta')}
              >
                List Your Project
              </button>
            </div>
          </div>

          {/* Smart Search */}
          <div className="hero-search-cta">
            <div className="smart-search-wrapper" ref={searchWrapperRef}>

              {/* Search Bar */}
              <div className={`smart-search-bar${searchFocused ? ' focused' : ''}`}>
                <span className="smart-search-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm8 0-4.35-4.35"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  className="smart-search-input"
                  placeholder="Search by location, project, budget..."
                  value={smartSearchValue}
                  onChange={e => setSmartSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSmartSearchSubmit(); if (e.key === 'Escape') setSearchFocused(false); }}
                  autoComplete="off"
                />
                {smartSearchValue && (
                  <button className="smart-search-clear" onClick={() => { setSmartSearchValue(''); }} aria-label="Clear">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </button>
                )}
                <div className="smart-search-divider"></div>
                <button
                  className={`hero-voice-trigger ${isListening ? 'listening' : ''}`}
                  onClick={startVoiceSearch}
                  title="Voice Search"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="micGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.7"/>
                      </linearGradient>
                    </defs>
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="url(#micGrad)"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor" opacity="0.9"/>
                  </svg>
                </button>
              </div>

              {/* Dropdown */}
              {searchFocused && (
                <div className="smart-search-dropdown">
                  {smartSearchValue.trim().length >= 2 ? (
                    <div className="dropdown-section">
                      <div className="dropdown-section-title">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm8 0-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        Suggestions
                      </div>
                      {getAutoSuggestions(smartSearchValue).length > 0 ? (
                        getAutoSuggestions(smartSearchValue).map((p, i) => (
                          <button key={i} className="dropdown-item" onClick={() => handleSmartSearchSelect(p.name)}>
                            <span className="dropdown-item-icon">🏢</span>
                            <div className="dropdown-item-info">
                              <div className="dropdown-item-name">{p.name}</div>
                              <div className="dropdown-item-sub">{p.sector} · {p.priceDisplay} · {p.type}</div>
                            </div>
                            <span className={`dropdown-item-badge ${p.status === 'Ready to Move' ? 'badge-ready' : 'badge-construction'}`}>
                              {p.status === 'Ready to Move' ? 'Ready' : 'UC'}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="dropdown-empty">No properties found for "{smartSearchValue}"</div>
                      )}
                    </div>
                  ) : (
                    <>
                      {recentSearches.length > 0 && (
                        <div className="dropdown-section">
                          <div className="dropdown-section-title">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            Recent Searches
                            <button className="dropdown-clear-recent" onClick={() => { setRecentSearches([]); try { localStorage.removeItem('vs_recentSearches'); } catch {} }}>Clear</button>
                          </div>
                          {recentSearches.map((r, i) => (
                            <button key={i} className="dropdown-item" onClick={() => handleSmartSearchSelect(r)}>
                              <span className="dropdown-item-icon recent-icon">↩</span>
                              <div className="dropdown-item-info"><div className="dropdown-item-name">{r}</div></div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="dropdown-section">
                        <div className="dropdown-section-title">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 7h8m0 0v8m0-8-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Trending Locations
                        </div>
                        <div className="dropdown-trending-grid">
                          {TRENDING_LOCATIONS.map((loc, i) => (
                            <button key={i} className="dropdown-trending-item" onClick={() => handleSmartSearchSelect(loc.name)}>
                              <span className="trending-emoji">{loc.icon}</span>
                              <div>
                                <div className="trending-name">{loc.name}</div>
                                <div className="trending-tag">{loc.tag}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Popular Chips */}
              <div className="smart-search-chips">
                <span className="chips-label">Popular:</span>
                {POPULAR_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    className="search-chip"
                    onClick={() => handleSmartSearchSelect(chip.label)}
                  >
                    <span className="chip-icon">{chip.icon}</span>
                    {chip.label}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Scroll Indicator */}
          <div
            className="scroll-indicator"
            onClick={() => scrollToSection('features')}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToSection('features'); }}
            title="Scroll to explore"
            role="button"
            tabIndex={0}
          >
            <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
            <span>Scroll Down</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {!pageLoaded
              ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
              : [
                  { num: siteSettings.stat1Num, label: siteSettings.stat1Label, icon: siteSettings.stat1Icon },
                  { num: siteSettings.stat2Num, label: siteSettings.stat2Label, icon: siteSettings.stat2Icon },
                  { num: siteSettings.stat3Num, label: siteSettings.stat3Label, icon: siteSettings.stat3Icon },
                  { num: siteSettings.stat4Num, label: siteSettings.stat4Label, icon: siteSettings.stat4Icon },
                ].map((s, i) => (
                  <motion.div
                    key={i} className="stat-item"
                    initial={{ opacity: 0, y: 30, scale: 0.88 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.55, delay: i * 0.1, type: 'spring', stiffness: 120 }}
                    whileHover={{ scale: 1.06, y: -4 }}
                  >
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-number">{s.num}</div>
                    <div className="stat-label">{s.label}</div>
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {searchResults !== null && (
        <section id="search-results-section" className="search-results-section">
          <div className="container">
            <div className="sr-header">
              <h2 className="sr-title">
                {searchResults.length > 0
                  ? <>Found <span>{searchResults.length}</span> {searchResults.length === 1 ? 'Property' : 'Properties'}</>
                  : 'No Properties Found'}
              </h2>
              <p className="sr-query">Results for: <em>"{smartSearchValue}"</em></p>
              <button className="sr-clear" onClick={() => setSearchResults(null)}>✕ Clear Results</button>
            </div>

            {searchResults.length === 0 ? (
              <motion.div className="sr-empty" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
                <div className="sr-empty-icon">🔍</div>
                <p>Try searching: "3 BHK", "Villa", "Sector 65", "DLF", "Golf Course"</p>
              </motion.div>
            ) : (
              <div className="sr-grid">
                <AnimatePresence>
                {searchResults.map((p, idx) => (
                  <motion.div
                    key={p.id} className="sr-card"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.06, type: 'spring', stiffness: 120 }}
                    whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
                  >
                    {(() => { const b = getPropertyBadge(p); return b ? <span className={`prop-badge prop-badge-inline ${b.cls}`}>{b.label}</span> : null; })()}
                    <div className="sr-card-top">
                      <span className="sr-type-badge">{p.type}</span>
                      <span className={`sr-status ${p.status === 'Ready to Move' ? 'ready' : 'uc'}`}>{p.status}</span>
                    </div>
                    <h3 className="sr-name">{p.name}</h3>
                    <p className="sr-location">📍 {p.location}</p>
                    <div className="sr-meta">
                      {p.bedrooms > 0 && <span>🛏 {p.bedrooms} BHK</span>}
                      <span>📐 {p.area}</span>
                    </div>
                    <div className="sr-price">{p.priceDisplay}</div>
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                      <button className="sr-enquire" style={{flex:1}} onClick={() => navigate(`/property/${p.id}`)}>
                        View Details →
                      </button>
                      <button className="sr-enquire" style={{flex:1, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none'}}
                        onClick={() => setBookingProperty(p)}>
                        🔐 Book Now
                      </button>
                      <button
                        className="sr-enquire"
                        style={{flex:1, background: compareList.find(x=>x.id===p.id) ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.1)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)'}}
                        onClick={() => toggleCompare(p)}
                      >
                        {compareList.find(x=>x.id===p.id) ? '✓ Added' : '⚖ Compare'}
                      </button>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title reveal-left">Why Builder Direct?</h2>
            <p className="section-subtitle reveal">
              The smarter way to buy property in Gurgaon — zero brokerage, full transparency, direct from developer.
            </p>
          </div>

          <div className="features-grid">
            {!pageLoaded ? Array(6).fill(0).map((_, i) => <FeatureCardSkeleton key={i} />) : <>
              {[
                {
                  icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 4L4 14v20c0 8.84 7.16 16 16 16h8c8.84 0 16-7.16 16-16V14L24 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M24 24v12M24 12l-6 6 6 6 6-6-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  title: 'Direct from Builder',
                  desc: 'Every listing comes straight from the registered developer. No aggregator markup, no third-party representation.',
                  cta: `See All ${liveProperties.length} Listings →`, onClick: () => scrollToSection('featured-section'),
                },
                {
                  icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/><path d="M16 24l6 6 10-12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  title: 'Save 1–2% Brokerage',
                  desc: 'On a ₹1.5 Cr home that is ₹1.5–3 Lakhs back in your pocket. Buyers pay zero. Builders pay one flat listing fee.',
                  cta: 'Calculate Your Savings →', onClick: () => scrollToSection('savings-calculator'),
                },
                {
                  icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M14 20h8M14 28h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="34" cy="24" r="5" stroke="currentColor" strokeWidth="2"/></svg>,
                  title: 'RERA Verified Projects',
                  desc: 'Every project is cross-checked with the Haryana RERA portal before going live. Full legal docs available upfront.',
                  cta: `View All ${liveProperties.length} Properties →`, onClick: () => setShowVerifiedModal(true),
                },
                {
                  icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M10 24c0-7.73 6.27-14 14-14s14 6.27 14 14-6.27 14-14 14S10 31.73 10 24z" stroke="currentColor" strokeWidth="2"/><path d="M24 16v8l6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
                  title: 'Contact Builder Directly',
                  desc: "One tap to the builder's sales team. No agent relay, no info withheld, no commission pressure distorting advice.",
                  cta: 'How It Works →', onClick: () => scrollToSection('how-it-works'),
                },
                {
                  icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M4 16h40M4 24h40M4 32h40" stroke="currentColor" strokeWidth="2"/></svg>,
                  title: 'Transparent Pricing',
                  desc: 'Builder-declared base prices, GST, PLC and IFMS shown upfront. What you see is what you pay — always.',
                  cta: 'How We Save You Money →', onClick: () => setShowBestPriceModal(true),
                },
                {
                  icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M8 20l8-8 8 8M16 4v24M40 28l-8 8-8-8M32 44V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  title: 'Hassle-Free Documentation',
                  desc: 'Download sample agreements and builder brochures before visiting. Our legal checklist keeps you protected.',
                  cta: 'See Full Process →', onClick: () => setShowDocsModal(true),
                },
              ].map((fc, i) => (
                <motion.div
                  key={i} className="feature-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: i * 0.1, type: 'spring', stiffness: 100 }}
                  whileHover={{ y: -8, scale: 1.01, transition: { type: 'spring', stiffness: 300 } }}
                >
                  <div className="feature-icon">{fc.icon}</div>
                  <h3 className="feature-title">{fc.title}</h3>
                  <p className="feature-description">{fc.desc}</p>
                  <span className="feature-card-cta" onClick={fc.onClick} style={{cursor:'pointer'}}>{fc.cta}</span>
                </motion.div>
              ))}
            </>}
          </div>
        </div>
      </section>

      {/* Savings Calculator Section */}
      <section id="savings-calculator" className="savings-calc-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '40px' }}>
            <h2 className="section-title">How Much Will You Save?</h2>
            <p className="section-subtitle">
              Brokerage on Gurgaon properties typically runs 1–2% of the purchase price.
              That is real money that stays in your pocket with Vertex Direct.
            </p>
          </div>
          <SavingsCalculator />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="hiw-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '40px' }}>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Simple. Transparent. Direct.
            </p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* Builder CTA Section */}
      <BuilderCTA />

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title">About Vertex Direct</h2>
              <p className="about-text">
                Vertex Direct is Gurgaon's first zero-brokerage builder-to-buyer marketplace.
                Builders list projects directly, buyers connect without a middleman, and the
                savings are real — verified against RERA, transparent on pricing, zero hidden charges.
              </p>
              <p className="about-text">
                Our mission is to simplify the property buying process while ensuring you find a
                home that perfectly matches your lifestyle and investment goals. Whether you're
                looking for a luxury apartment, a spacious villa, or a commercial space, we're here
                to make your dream a reality.
              </p>

              <div className="about-highlights">
                <div className="highlight-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>RERA Registered</span>
                </div>
                <div className="highlight-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>ISO Certified</span>
                </div>
                <div className="highlight-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Award Winning Service</span>
                </div>
              </div>

              <button className="btn btn-primary ripple btn-magnetic neon-btn" onClick={() => scrollToSection('contact')}>
                Get in Touch
              </button>
            </div>

            <div className="about-image">
              <div className="image-wrapper img-zoom-wrap">
                <div className="image-overlay"></div>
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                  alt="Luxury Property"
                  className="about-img"
                />
              </div>
              <div className="experience-badge">
                <div className="badge-number">15+</div>
                <div className="badge-text">Years of<br/>Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Price Timeline */}
      <PriceTimeline />

      {/* Future Life Simulator */}
      <LifeSimulator />

      {/* Agent Showcase Section */}
      <section id="agent-showcase-section" className="agent-showcase-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title reveal-left">Meet Our Expert Agents</h2>
            <p className="section-subtitle">
              Trusted professionals with proven track records across Gurgaon & Delhi NCR
            </p>
          </div>

          <div className="agent-showcase-grid">
            {!pageLoaded ? Array(4).fill(0).map((_, i) => <AgentCardSkeleton key={i} />) : (liveAgents || [{
                name: 'Arjun Sharma',
                photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400',
                experience: 12,
                specialization: 'Luxury Villas & Penthouses',
                deals: 340,
                rating: 4.9,
                topAgent: true,
              },
              {
                name: 'Priya Mehta',
                photo: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400',
                experience: 8,
                specialization: 'Commercial & Office Spaces',
                deals: 210,
                rating: 4.8,
                topAgent: true,
              },
              {
                name: 'Rohit Kapoor',
                photo: 'https://images.unsplash.com/photo-1584999734482-0361aecad844?w=400',
                experience: 6,
                specialization: 'Affordable Housing & Plots',
                deals: 175,
                rating: 4.7,
                topAgent: false,
              },
              {
                name: 'Sneha Verma',
                photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
                experience: 10,
                specialization: 'NRI & Investment Properties',
                deals: 290,
                rating: 4.9,
                topAgent: true,
              },
            ]).map((agent, i) => (
              <motion.div
                key={agent.name}
                className={`agent-card${agent.topAgent ? ' agent-card--top' : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.12, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
              >
                {agent.topAgent && (
                  <div className="agent-top-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Top Agent
                  </div>
                )}
                <div className="agent-photo-wrap">
                  <img src={agent.photo} alt={agent.name} className="agent-photo" />
                  <div className="agent-rating">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {agent.rating}
                  </div>
                </div>
                <div className="agent-info">
                  <h3 className="agent-name">{agent.name}</h3>
                  <div className="agent-specialization">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {agent.specialization}
                  </div>
                  <div className="agent-stats">
                    <div className="agent-stat">
                      <span className="agent-stat-value">{agent.experience}+</span>
                      <span className="agent-stat-label">Yrs Exp.</span>
                    </div>
                    <div className="agent-stat-divider" />
                    <div className="agent-stat">
                      <span className="agent-stat-value">{agent.deals}+</span>
                      <span className="agent-stat-label">Deals Closed</span>
                    </div>
                  </div>
                  <button className="agent-contact-btn" onClick={() => scrollToSection('contact')}>
                    Connect Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property DNA Match Section ── */}
      <section className="dna-section">
        <div className="container">

          {/* Header */}
          <div className="dna-header">
            <div className="dna-header-left">
              <div className="dna-helix-icon">🧬</div>
              <div>
                <h2 className="dna-title">Property DNA Match</h2>
                <p className="dna-subtitle">3 quick questions → perfect property match</p>
              </div>
            </div>
            <div className="dna-header-right">
              {dnaActive
                ? <button className="dna-reset-btn" onClick={resetDna}>✕ Reset Match</button>
                : <button className="dna-start-btn" onClick={() => { setDnaOpen(o => !o); setDnaStep(0); }}>
                    {dnaOpen ? '✕ Close' : '🧬 Find My Match'}
                  </button>
              }
            </div>
          </div>

          {/* Wizard — inline 3-step */}
          {dnaOpen && !dnaActive && (
            <div className="dna-wizard">
              {/* Step indicators */}
              <div className="dna-steps-nav">
                {['Budget', 'Location', 'Lifestyle'].map((s, i) => (
                  <div key={i} className={`dna-step-pip${dnaStep === i ? ' active' : ''}${dnaStep > i ? ' done' : ''}`}>
                    <span className="dna-step-num">{dnaStep > i ? '✓' : i + 1}</span>
                    <span className="dna-step-name">{s}</span>
                  </div>
                ))}
              </div>

              {/* Step 0 — Budget */}
              {dnaStep === 0 && (
                <div className="dna-step-body">
                  <p className="dna-step-q">What's your budget? 💰</p>
                  <div className="dna-options-grid">
                    {DNA_BUDGETS.map(b => (
                      <button key={b.key} className={`dna-option${dnaPrefs.budget === b.key ? ' selected' : ''}`} onClick={() => handleDnaSelect(0, b.key)}>
                        <span className="dna-opt-icon">{b.icon}</span>
                        <span className="dna-opt-label">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1 — Location */}
              {dnaStep === 1 && (
                <div className="dna-step-body">
                  <p className="dna-step-q">Preferred location? 📍</p>
                  <div className="dna-options-grid">
                    {DNA_LOCATIONS.map(l => (
                      <button key={l.key} className={`dna-option${dnaPrefs.location === l.key ? ' selected' : ''}`} onClick={() => handleDnaSelect(1, l.key)}>
                        <span className="dna-opt-icon">{l.icon}</span>
                        <span className="dna-opt-label">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 — Lifestyle */}
              {dnaStep === 2 && (
                <div className="dna-step-body">
                  <p className="dna-step-q">Your lifestyle preference? 🏠</p>
                  <div className="dna-options-grid dna-options-lifestyle">
                    {DNA_LIFESTYLES.map(l => (
                      <button key={l.key} className={`dna-option dna-option-lifestyle${dnaPrefs.lifestyle === l.key ? ' selected' : ''}`} onClick={() => handleDnaSelect(2, l.key)}>
                        <span className="dna-opt-icon">{l.icon}</span>
                        <span className="dna-opt-label">{l.label}</span>
                        <span className="dna-opt-desc">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active prefs summary */}
          {dnaActive && (
            <div className="dna-prefs-summary">
              {[
                { label: 'Budget', val: DNA_BUDGETS.find(b => b.key === dnaPrefs.budget)?.label },
                { label: 'Location', val: DNA_LOCATIONS.find(l => l.key === dnaPrefs.location)?.label },
                { label: 'Lifestyle', val: DNA_LIFESTYLES.find(l => l.key === dnaPrefs.lifestyle)?.label },
              ].map((p, i) => (
                <div key={i} className="dna-pref-chip">
                  <span className="dna-pref-lbl">{p.label}</span>
                  <span className="dna-pref-val">{p.val}</span>
                </div>
              ))}
              <div className="dna-pref-chip dna-pref-count">
                🎯 {dnaMatched.length} properties matched
              </div>
            </div>
          )}

          {/* Matched results grid */}
          {dnaActive && dnaMatched.length > 0 && (
            <div className="dna-results">
              {dnaMatched.map((p, i) => {
                const score = p.dnaScore;
                const color = dnaScoreColor(score);
                const circ  = 2 * Math.PI * 20; // r=20
                return (
                  <motion.div
                    key={p.id}
                    className="dna-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ '--dna-color': color }}
                    onClick={() => navigate(`/property/${p.id}`)}
                  >
                    {/* Match ring */}
                    <div className="dna-ring-wrap">
                      <svg width="52" height="52" viewBox="0 0 52 52" className="dna-ring-svg">
                        <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
                        <circle
                          cx="26" cy="26" r="20" fill="none"
                          stroke={color} strokeWidth="4"
                          strokeDasharray={`${(score / 100) * circ} ${circ}`}
                          strokeDashoffset={circ * 0.25}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dasharray 1s ease 0.2s' }}
                        />
                      </svg>
                      <div className="dna-ring-score" style={{ color }}>{score}%</div>
                    </div>

                    <div className="dna-card-info">
                      <div className="dna-card-name">{p.name}</div>
                      <div className="dna-card-loc">{p.sector} · {p.priceDisplay}</div>
                      <div className="dna-card-meta">
                        {p.bedrooms > 0 && <span>{p.bedrooms} BHK</span>}
                        <span>{p.type}</span>
                        <span className="dna-match-tag" style={{ color, borderColor: color }}>
                          {dnaScoreLabel(score)}
                        </span>
                      </div>
                    </div>

                    <div className="dna-card-arrow">→</div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Featured Properties Preview */}
      <section
        id="featured-section"
        className={`featured-section${activeMood ? ' featured-mood-active' : ''}`}
        style={activeMood ? { '--mood-color': MOODS[activeMood].color, '--mood-glow': MOODS[activeMood].bgGlow, background: MOODS[activeMood].bgGlow } : {}}
      >
        <div className="container">

          {/* ── Personalized Buyer / Builder Banner ── */}
          {user && (
            <div className="hp-role-banner">
              {isBuilder ? (
                <>
                  <span className="hp-role-icon">🏗</span>
                  <div className="hp-role-text">
                    <strong>Builder Dashboard</strong>
                    <span>List your properties and manage listings — scroll down to your Builder Panel.</span>
                  </div>
                  <button
                    className="hp-role-action"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Manage Listings ↓
                  </button>
                </>
              ) : (
                <>
                  <span className="hp-role-icon">👋</span>
                  <div className="hp-role-text">
                    <strong>Welcome back, {user.name?.split(' ')[0]}!</strong>
                    <span>Properties below are curated based on Gurgaon's premium market.</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Mood Selector ── */}
          <div className="mood-selector">
            <p className="mood-selector-label">What are you looking for?</p>
            <div className="mood-pills">
              {Object.entries(MOODS).map(([key, mood]) => {
                const count = moodFilteredDB.filter(mood.filter).length;
                const isActive = activeMood === key;
                return (
                  <motion.button
                    key={key}
                    className={`mood-pill${isActive ? ' mood-pill--active' : ''}`}
                    style={{ '--m-color': mood.color, '--m-gradient': mood.gradient }}
                    onClick={() => setActiveMood(isActive ? null : key)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="mood-pill-emoji">{mood.emoji}</span>
                    <span className="mood-pill-label">{mood.label}</span>
                    <span className="mood-pill-count">{count}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Section Header — changes with mood ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMood || 'default'}
              className="section-header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeMood && (
                <div className="mood-active-chip" style={{ background: MOODS[activeMood].gradient }}>
                  {MOODS[activeMood].emoji} {MOODS[activeMood].label} Mode
                  <button className="mood-clear-btn" onClick={() => setActiveMood(null)}>✕</button>
                </div>
              )}
              <h2 className="section-title">
                {activeMood ? MOODS[activeMood].sectionTitle
                  : isBuyer && user ? `Recommended for You` : 'Featured Properties'}
              </h2>
              <p className="section-subtitle">
                {activeMood ? MOODS[activeMood].subtitle
                  : isBuyer && user
                    ? `Curated premium listings in Gurgaon's most sought-after sectors`
                    : "Handpicked properties from Gurgaon's prime locations"}
              </p>
              {activeMood && (
                <div className="mood-result-count" style={{ color: MOODS[activeMood].color }}>
                  {moodProperties.length} properties found
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Time of Day Toggle ── */}
          <div className="hp-tod-bar">
            <div className="hp-tod-left">
              <span className="hp-tod-live-dot" style={{ background: HOME_TOD[homeTod].badgeColor }} />
              <span className="hp-tod-live-label" style={{ color: HOME_TOD[homeTod].badgeColor }}>
                {HOME_TOD[homeTod].badge}
              </span>
              <span className="hp-tod-hint">— See how this property looks at different times</span>
            </div>
            <div className="hp-tod-pills">
              {Object.entries(HOME_TOD).map(([key, cfg]) => (
                <button
                  key={key}
                  className={`hp-tod-pill${homeTod === key ? ' active' : ''}`}
                  style={homeTod === key ? { background: cfg.glow, boxShadow: `0 0 18px ${cfg.glow}55` } : {}}
                  onClick={() => setHomeTod(key)}
                >
                  <span>{cfg.emoji}</span>
                  <span className="hp-tod-pill-text">{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="properties-grid">
            {!pageLoaded ? Array(6).fill(0).map((_, i) => <PropertyCardSkeleton key={i} />) :
            activeMood ? (
              <AnimatePresence>
                {moodProperties.map((p, i) => {
                  const uploadedPhoto = (p.photos && p.photos[0]) || (p.images && p.images[0]);
                  const primarySrc = uploadedPhoto || `https://images.unsplash.com/photo-${MOODS[activeMood].images[i % 3]}?w=600&h=300&fit=crop`;
                  return (
                  <HoverCard
                    key={p.id}
                    imgs={uploadedPhoto ? (p.photos || p.images) : getHoverImages(primarySrc, p.id)}
                    amenities={getHoverAmenities(p.price, p.type)}
                    price={p.priceDisplay}
                    status={p.status}
                    beds={p.bedrooms}
                    area={p.area}
                    type={p.type}
                    meter={getDecisionMeter(p)}
                    onViewDetails={() => navigate(`/property/${p.id}`)}
                    onBookNow={() => setBookingProperty(p)}
                    propName={p.name}
                    propLocation={p.location}
                    propId={p.id}
                    wrapClass={`hp-tod-img-wrap hp-tod-img-${homeTod}`}
                    imgStyle={{ filter: HOME_TOD[homeTod].filter, transition: 'filter 0.7s ease' }}
                    skyStyle={{ background: HOME_TOD[homeTod].sky }}
                    ovlStyle={{ background: HOME_TOD[homeTod].overlay, transition: 'background 0.7s ease' }}
                    video={PREVIEW_VIDEOS[i % PREVIEW_VIDEOS.length]}
                    badges={<>
                      <div className="property-badge mood-property-badge" style={{ background: MOODS[activeMood].gradient }}>{MOODS[activeMood].badge}</div>
                      {(() => { const b = getPropertyBadge(p); return b ? <span className={`prop-badge prop-badge-tr ${b.cls}`}>{b.label}</span> : null; })()}
                      {dnaActive && dnaScores[p.id] && <div className="prop-dna-badge" style={{ '--dc': dnaScoreColor(dnaScores[p.id]) }}>🧬 {dnaScores[p.id]}%</div>}
                    </>}
                    motionProps={{
                      initial: { opacity: 0, y: 24 },
                      animate: { opacity: 1, y: 0 },
                      exit:    { opacity: 0, scale: 0.95 },
                      transition: { duration: 0.3, delay: i * 0.05 },
                      style: { '--mood-accent': MOODS[activeMood].color },
                    }}
                  >
                    <div className="property-content">
                      <h3 className="property-title">{p.name}</h3>
                      <p className="property-location">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2a4 4 0 0 0-4 4c0 2.5 4 7 4 7s4-4.5 4-7a4 4 0 0 0-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="8" cy="6" r="1.5" fill="currentColor"/>
                        </svg>
                        {p.location}
                      </p>
                      {(() => { const v = getAreaVibe(p.sector || p.location); return v ? <span className="area-vibe-chip" style={{ color: v.color, background: v.bg }}>{v.emoji} {v.label}</span> : null; })()}
                      <div className="property-price" style={{ color: MOODS[activeMood].color }}>{p.priceDisplay}</div>
                      <div className="property-features">
                        {p.bedrooms > 0 && <span>{p.bedrooms} BHK</span>}
                        <span>{p.type}</span>
                        <span>{p.area}</span>
                      </div>
                      <SocialProof propertyId={p.id} price={p.price} />
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        <button className="property-btn mood-property-btn" style={{ flex: 1, background: MOODS[activeMood].gradient }} onClick={() => navigate(`/property/${p.id}`)}>
                          View Details →
                        </button>
                        <button className="property-btn mood-property-btn" style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} onClick={() => setBookingProperty(p)}>
                          🔐 Book Now
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="ip-card-btn" style={{ flex: 1 }} onClick={() => setInteriorProp(p)}>🎨 Interior</button>
                        <button className="ip-card-btn cinematic-btn" style={{ flex: 1 }} onClick={() => setCinematicData({ property: p, imgSrc: `https://images.unsplash.com/photo-${MOODS[activeMood].images[moodProperties.indexOf(p) % 3]}?w=1400&h=900&fit=crop` })}>🎬 Cinematic</button>
                      </div>
                    </div>
                  </HoverCard>
                  );
                })}
              </AnimatePresence>
            ) : [{
                name: 'DLF The Camellias',
                developer: 'DLF India',
                title: 'DLF The Camellias',
                location: 'Sector 42, Golf Course Road, Gurgaon',
                price: '₹73 Cr+',
                pricePerSqft: '₹88,200–88,800 / sq.ft',
                beds: 4,
                baths: 5,
                sqft: '9,500',
                type: '4–6 BHK Ultra Luxury Apartments',
                status: 'Ready to Move',
                possession: 'Ready to Move (Completed 2017)',
                totalUnits: '428 Units',
                landArea: 'Premium Golf Course Road',
                towers: '9 Towers, G+21 to G+38 Floors',
                tag: 'Ultra Luxury',
                tagColor: 'gold',
                image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&h=440&fit=crop&q=80',
                amenities: ["India's First LEED Platinum Certified Residence", 'Concierge & Golf Cart Shuttles', 'Olympic-Size Outdoor Pool', 'Indoor Heated Pool', 'Kids Splash Pool', 'Fitness Centre with Personal Training', 'Yoga Studios', 'Private Theatre', 'Spa & Sauna', 'Salon & Wellness Retreat', 'Auditorium', 'Direct Golf Course Access'],
                configurations: [
                  { config: '4 BHK', size: '9,500 sq.ft', price: '₹73 Cr+' },
                  { config: '5 BHK', size: '12,000 sq.ft', price: '₹90 Cr+' },
                  { config: '6 BHK Penthouse', size: '16,000 sq.ft', price: '₹1.2 Cr+' },
                ],
                about: "DLF The Camellias is India's most iconic ultra-luxury residential tower. The only LEED Platinum certified residential project in India, it features world-class amenities including a Golf Course, private theatre, spa, 3 pools and a 24-hour concierge. Each apartment is a masterpiece of design and craftsmanship.",
                highlights: ["India's First LEED Platinum Residence", '24/7 Concierge Service', 'Direct Golf Course Access', '3 Swimming Pools', 'Personal Training Studio'],
                aiNote: 'India\'s most iconic luxury residence · LEED Platinum · Golf Course Access',
              },
              {
                name: 'M3M Golf Estate',
                developer: 'M3M India',
                title: 'M3M Golf Estate',
                location: 'Sector 65, Golf Course Extension, Gurgaon',
                price: '₹4.2 Cr+',
                pricePerSqft: '₹14,500–15,000 / sq.ft',
                beds: 3,
                baths: 4,
                sqft: '3,200',
                type: '3–4 BHK Premium Apartments',
                status: 'Ready to Move',
                possession: 'Ready to Move',
                totalUnits: '1,000+ Units',
                landArea: '75 Acres',
                towers: 'Multiple High-Rise Towers',
                tag: 'Golf View',
                tagColor: 'teal',
                image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=700&h=440&fit=crop&q=80',
                amenities: ['Golf Course Views', 'Premium Clubhouse', 'Swimming Pool', 'Gymnasium', 'Tennis & Badminton Courts', 'Jogging Track', 'Landscaped Gardens', 'Children Play Area', '24/7 Security', 'Power Backup'],
                configurations: [
                  { config: '3 BHK', size: '2,800–3,200 sq.ft', price: '₹4.2 Cr+' },
                  { config: '4 BHK', size: '3,500–4,200 sq.ft', price: '₹5.8 Cr+' },
                ],
                about: 'M3M Golf Estate is a flagship premium residential project on Golf Course Extension Road, Gurugram. Spread across 75 acres, it offers stunning golf course views and a lifestyle crafted for discerning homebuyers. The project blends luxury architecture with serene green surroundings.',
                highlights: ['Panoramic Golf Course Views', '75-Acre Premium Township', 'Ready to Move', 'Golf Course Extension Road', 'M3M Trusted Brand'],
                aiNote: '75 Acres · Golf Course Views · Premium Clubhouse · Ready to Move',
              },
              {
                name: 'Emerald Hills',
                developer: 'IREO',
                title: 'Emerald Hills',
                location: 'Sector 65, Golf Course Extension, Gurgaon',
                price: '₹6.8 Cr+',
                pricePerSqft: '₹16,000–17,500 / sq.ft',
                beds: 4,
                baths: 4,
                sqft: '4,800',
                type: '3–5 BHK Luxury Apartments & Penthouses',
                status: 'Ready to Move',
                possession: 'Ready to Move',
                totalUnits: '500+ Units',
                landArea: '60+ Acres',
                towers: 'Premium High-Rise Towers',
                tag: 'Luxury',
                tagColor: 'purple',
                image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&h=440&fit=crop&q=80',
                amenities: ['Panoramic City Views', 'Infinity Swimming Pool', 'Premium Clubhouse', 'Fully Equipped Gym', 'Spa & Steam Room', 'Badminton & Tennis Courts', 'Concierge Services', 'Landscaped Terraces', 'Smart Security', '3-Tier Security'],
                configurations: [
                  { config: '3 BHK', size: '3,200–3,800 sq.ft', price: '₹6.8 Cr+' },
                  { config: '4 BHK', size: '4,500–5,200 sq.ft', price: '₹8.5 Cr+' },
                  { config: '5 BHK Penthouse', size: '7,000+ sq.ft', price: '₹14 Cr+' },
                ],
                about: 'Emerald Hills is a signature luxury residential development on Golf Course Extension Road. Known for its sweeping panoramic views, infinity pools and premium finishes, it offers an elevated living experience. The project features world-class amenities, a premium clubhouse and impeccable attention to detail.',
                highlights: ['Panoramic City & Green Views', 'Infinity Pool', 'Premium Penthouse Available', 'Golf Course Extension Road', 'Concierge Services'],
                aiNote: 'Panoramic views · Infinity pool · Penthouses available · Ready to Move',
              }
            ].map((property, index) => {
              const BADGE_MAP = ['⭐ Premium', '🔥 Hot Deal', '💎 Best Value'];
              const BADGE_CLS = ['badge-premium', 'badge-hot', 'badge-value'];
              return (
              <HoverCard
                key={index}
                imgs={getHoverImages(property.image, index + 100)}
                amenities={(property.highlights || []).slice(0, 3).map(h => `✦ ${h}`)}
                price={property.price}
                status={property.status}
                beds={property.beds}
                area={`${property.sqft} sqft`}
                type={property.type}
                meter={FEATURED_CARD_METERS[index]}
                onViewDetails={() => setSelectedPickProject(property)}
                onBookNow={() => setBookingProperty({ id: property.id || property.name, name: property.name, location: property.location, price: property.price, priceDisplay: property.price })}
                wrapClass={`hp-tod-img-wrap hp-tod-img-${homeTod}`}
                imgStyle={{ filter: HOME_TOD[homeTod].filter, transition: 'filter 0.7s ease' }}
                skyStyle={{ background: HOME_TOD[homeTod].sky }}
                ovlStyle={{ background: HOME_TOD[homeTod].overlay, transition: 'background 0.7s ease' }}
                video={PREVIEW_VIDEOS[index % PREVIEW_VIDEOS.length]}
                badges={<>
                  <div className="property-badge">Featured</div>
                  <span className={`prop-badge prop-badge-tr ${BADGE_CLS[index]}`}>{BADGE_MAP[index]}</span>
                </>}
              >
                <div className="property-content">
                  <h3 className="property-title">{property.title}</h3>
                  <p className="property-location">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2a4 4 0 0 0-4 4c0 2.5 4 7 4 7s4-4.5 4-7a4 4 0 0 0-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="8" cy="6" r="1.5" fill="currentColor"/>
                    </svg>
                    {property.location}
                  </p>
                  {(() => { const v = getAreaVibe(property.location); return v ? <span className="area-vibe-chip" style={{ color: v.color, background: v.bg }}>{v.emoji} {v.label}</span> : null; })()}
                  <div className="property-price">{property.price}</div>
                  <div className="property-features">
                    <span>{property.beds} Beds</span>
                    <span>{property.baths} Baths</span>
                    <span>{property.sqft} sqft</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <button className="property-btn" style={{ flex: 1 }} onClick={() => setSelectedPickProject(property)}>View Details</button>
                    <button className="property-btn" style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff' }}
                      onClick={() => setBookingProperty({ id: property.id || property.name, name: property.name, location: property.location, price: property.price, priceDisplay: property.price })}>
                      🔐 Book Now
                    </button>
                  </div>
                  <button className="ip-card-btn" onClick={() => setInteriorProp(property)}>🎨 AI Interior Preview</button>
                </div>
              </HoverCard>
              );
            })}
          </div>

          <div className="text-center" style={{ marginTop: '48px', display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => scrollToSection('pre-launch')}>View All Properties ↓</button>
            <button className="btn btn-story" onClick={() => navigate('/story')}>
              🎬 Experience Story Mode
            </button>
            <button
              className="btn rp-open-btn"
              onClick={() => setShowRoomPlanner(true)}
            >
              🏠 Plan Your Room
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title reveal-left">What Our Clients Say</h2>
            <p className="section-subtitle reveal">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="testimonials-grid stagger-children reveal">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'Business Owner',
                text: 'Vertex Living made finding our dream home effortless. Their team was professional, patient, and found us the perfect property within our budget.',
                rating: 5
              },
              {
                name: 'Priya Sharma',
                role: 'IT Professional',
                text: 'Excellent service from start to finish. They understood exactly what we were looking for and delivered beyond expectations. Highly recommended!',
                rating: 5
              },
              {
                name: 'Amit Verma',
                role: 'Investment Banker',
                text: 'The best real estate experience I\'ve had. Transparent pricing, honest advice, and seamless documentation. True professionals in every sense.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card spotlight-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 1l2.5 7h7l-5.5 4 2 7-6-4.5-6 4.5 2-7-5.5-4h7l2.5-7z"/>
                    </svg>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Picks Section — luxury only */}
      {navbarMood === 'luxury' && <section id="ai-picks" className="ai-picks-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title reveal-left">Top Projects in Gurugram <span className="highlight">Right Now</span></h2>
            <p className="section-subtitle reveal">Our AI has researched 100+ active projects across Gurugram. Here are the top picks based on price, amenities, location & growth potential.</p>
          </div>

          <div className="ai-picks-grid stagger-children reveal">
            {AI_PICKS_PROJECTS.map((project, idx) => (
              <div key={idx} className={`ai-pick-card spotlight-card ${project.tag === 'Best Value' ? 'card-featured' : ''}`}>
                <div className="pick-img-wrap img-zoom-wrap">
                  <img src={project.image} alt={project.name} className="pick-img" loading="lazy" />
                  {(() => { const b = getPickBadge(project); return b ? <span className={`prop-badge prop-badge-bl ${b.cls}`}>{b.label}</span> : null; })()}
                  <div className="pick-overlay">
                    <span className={`pick-tag pick-tag-${project.tagColor}`}>{project.tag}</span>
                    <span className={`pick-status ${project.status === 'Ready to Move' ? 'status-ready' : 'status-construction'}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="pick-body">
                  <div className="pick-developer">{project.developer}</div>
                  <h3 className="pick-name">{project.name}</h3>
                  <div className="pick-location">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {project.location}
                  </div>
                  <div className="pick-price-row">
                    <div className="pick-price">{project.price}</div>
                    <div className="pick-type">{project.type}</div>
                  </div>
                  <div className="pick-amenities">
                    {project.amenities.map((a, i) => (
                      <span key={i} className="pick-amenity">{a}</span>
                    ))}
                  </div>
                  <div className="pick-ai-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 2a8 8 0 100 16A8 8 0 0012 4zm0 3a1 1 0 011 1v4l2.5 2.5a1 1 0 11-1.414 1.414l-3-3A1 1 0 0111 13V9a1 1 0 011-1z"/></svg>
                    {project.aiNote}
                  </div>
                  <button className="pick-cta" onClick={() => setSelectedPickProject(project)}>
                    Get Details & Price →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="ai-market-summary">
            <div className="market-stat">
              <div className="market-stat-value">₹15,175</div>
              <div className="market-stat-label">Avg. Price / sq.ft (2025)</div>
            </div>
            <div className="market-stat">
              <div className="market-stat-value">+12%</div>
              <div className="market-stat-label">Capital Appreciation (YoY)</div>
            </div>
            <div className="market-stat">
              <div className="market-stat-value">+10%</div>
              <div className="market-stat-label">Rental Growth (YoY)</div>
            </div>
            <div className="market-stat">
              <div className="market-stat-value">100+</div>
              <div className="market-stat-label">Active Projects in Gurugram</div>
            </div>
          </div>
        </div>
      </section>}

      {/* ── Status-Based Property Sections ── */}
      {[
        {
          id: 'pre-launch',
          label: 'Pre-Launch',
          emoji: '🚀',
          color: '#a855f7',
          bg: 'rgba(168,85,247,0.06)',
          border: 'rgba(168,85,247,0.2)',
          badge: '🚀 Pre-Launch',
          desc: 'Invest early at lowest prices — exclusive pre-launch offers before public sale',
          filter: p => p.status === 'Pre-Launch',
        },
        {
          id: 'ready-to-move',
          label: 'Ready to Move',
          emoji: '✅',
          color: '#22c55e',
          bg: 'rgba(34,197,94,0.06)',
          border: 'rgba(34,197,94,0.2)',
          badge: '✅ Ready to Move',
          desc: 'Move in immediately — fully constructed, possession available now',
          filter: p => p.status === 'Ready to Move',
        },
        {
          id: 'under-construction',
          label: 'Under Construction',
          emoji: '🏗️',
          color: '#f59e0b',
          bg: 'rgba(245,158,11,0.06)',
          border: 'rgba(245,158,11,0.2)',
          badge: '🏗️ Under Construction',
          desc: 'Book now at lower prices — higher appreciation potential',
          filter: p => p.status === 'Under Construction',
        },
      ].map(cfg => {
        const props = moodFilteredDB.filter(cfg.filter);
        if (props.length === 0) return null;
        const isExpanded = !!expandedSections[cfg.id];
        const displayProps = isExpanded ? props : props.slice(0, 6);
        return (
          <section key={cfg.id} id={cfg.id} style={{ padding: '60px 0', background: cfg.bg, borderTop: `1px solid ${cfg.border}` }}>
            <div className="container">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{cfg.emoji}</span>
                    <h2 className="section-title" style={{ color: cfg.color, margin: 0, fontSize: 'clamp(1.4rem,3vw,2rem)' }}>{cfg.label}</h2>
                    <span style={{ background: cfg.color, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                      {props.length} {props.length === 1 ? 'Property' : 'Properties'}
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>{cfg.desc}</p>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="properties-grid">
                {displayProps.map((p, i) => {
                  const uploadedPhoto = (p.photos && p.photos[0]) || (p.images && p.images[0]);
                  const fallbackImgs = [
                    'photo-1545324418-cc1a3fa10c00','photo-1613490493576-7fde63acd811',
                    'photo-1512917774080-9991f1c4c750','photo-1600596542815-ffad4c1539a9',
                    'photo-1560448204-e02f11c3d0e2','photo-1600607687939-ce8a6c25118c',
                  ];
                  const primarySrc = uploadedPhoto || `https://images.unsplash.com/${fallbackImgs[i % fallbackImgs.length]}?w=600&h=300&fit=crop`;
                  return (
                    <HoverCard
                      key={p.id}
                      imgs={uploadedPhoto ? (p.photos || p.images) : getHoverImages(primarySrc, p.id)}
                      amenities={getHoverAmenities(p.price, p.type)}
                      price={p.priceDisplay}
                      status={p.status}
                      beds={p.bedrooms}
                      area={p.area}
                      type={p.type}
                      meter={getDecisionMeter(p)}
                      onViewDetails={() => navigate(`/property/${p.id}`)}
                      onBookNow={() => setBookingProperty(p)}
                      propName={p.name}
                      propLocation={p.location}
                      propId={p.id}
                      badges={
                        <div className="property-badge" style={{ background: cfg.color, color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                          {cfg.badge}
                        </div>
                      }
                      motionProps={{
                        initial: { opacity: 0, y: 24 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.4, delay: i * 0.07 },
                      }}
                    />
                  );
                })}
              </div>

              {props.length > 6 && (
                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ background: cfg.color, border: 'none', padding: '12px 32px', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
                    onClick={() => toggleSection(cfg.id)}
                  >
                    {expandedSections[cfg.id] ? `Show Less ↑` : `View All ${props.length} ${cfg.label} Properties →`}
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ── Property Type Sections ── */}
      {[
        { id: 'apartments',    label: 'Apartments',           emoji: '🏢', color: '#6366f1', bg: 'rgba(99,102,241,0.05)',  border: 'rgba(99,102,241,0.15)',  badge: '🏢 Apartment',    filter: p => p.type === 'Apartment' },
        { id: 'villas',        label: 'Villas',               emoji: '🏡', color: '#ec4899', bg: 'rgba(236,72,153,0.05)',  border: 'rgba(236,72,153,0.15)',  badge: '🏡 Villa',        filter: p => p.type === 'Villa' },
        { id: 'commercial',    label: 'Commercial',           emoji: '🏬', color: '#0ea5e9', bg: 'rgba(14,165,233,0.05)',  border: 'rgba(14,165,233,0.15)',  badge: '🏬 Commercial',   filter: p => p.type === 'Commercial' },
        { id: 'plots',         label: 'Plots & Land',         emoji: '🌍', color: '#84cc16', bg: 'rgba(132,204,22,0.05)',  border: 'rgba(132,204,22,0.15)',  badge: '🌍 Plot',         filter: p => p.type === 'Plot' },
        { id: 'penthouses',    label: 'Penthouses',           emoji: '👑', color: '#d4a853', bg: 'rgba(212,168,83,0.05)',  border: 'rgba(212,168,83,0.15)',  badge: '👑 Penthouse',    filter: p => p.type === 'Penthouse' },
        { id: 'studios',       label: 'Studio Apartments',    emoji: '🛋️', color: '#14b8a6', bg: 'rgba(20,184,166,0.05)',  border: 'rgba(20,184,166,0.15)',  badge: '🛋️ Studio',      filter: p => p.type === 'Studio' },
        { id: 'builder-floors',label: 'Builder Floors',       emoji: '🏘️', color: '#f97316', bg: 'rgba(249,115,22,0.05)',  border: 'rgba(249,115,22,0.15)',  badge: '🏘️ Builder Floor', filter: p => p.type === 'Builder Floor' },
        { id: 'farmhouses',    label: 'Farmhouses',           emoji: '🌾', color: '#a3e635', bg: 'rgba(163,230,53,0.05)',  border: 'rgba(163,230,53,0.15)',  badge: '🌾 Farmhouse',    filter: p => p.type === 'Farmhouse' },
        { id: 'warehouses',    label: 'Warehouses & Industrial', emoji: '🏭', color: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.15)', badge: '🏭 Warehouse', filter: p => p.type === 'Warehouse' || p.type === 'Industrial' },
        { id: 'shops-offices', label: 'Shops & Offices',      emoji: '💼', color: '#38bdf8', bg: 'rgba(56,189,248,0.05)',  border: 'rgba(56,189,248,0.15)',  badge: '💼 Shop/Office',  filter: p => p.type === 'Shop' || p.type === 'Office' },
      ].map(cfg => {
        const props = moodFilteredDB.filter(cfg.filter);
        if (props.length === 0) return null;
        const isExpanded = !!expandedSections[cfg.id];
        const displayProps = isExpanded ? props : props.slice(0, 6);
        const fallbackImgs = ['photo-1545324418-cc1a3fa10c00','photo-1613490493576-7fde63acd811','photo-1512917774080-9991f1c4c750','photo-1600596542815-ffad4c1539a9','photo-1560448204-e02f11c3d0e2','photo-1600607687939-ce8a6c25118c'];
        return (
          <section key={cfg.id} id={cfg.id} style={{ padding: '60px 0', background: cfg.bg, borderTop: `1px solid ${cfg.border}` }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{cfg.emoji}</span>
                    <h2 className="section-title" style={{ color: cfg.color, margin: 0, fontSize: 'clamp(1.4rem,3vw,2rem)' }}>{cfg.label}</h2>
                    <span style={{ background: cfg.color, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                      {props.length} {props.length === 1 ? 'Property' : 'Properties'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="properties-grid">
                {displayProps.map((p, i) => {
                  const uploadedPhoto = (p.photos && p.photos[0]) || (p.images && p.images[0]);
                  const primarySrc = uploadedPhoto || `https://images.unsplash.com/${fallbackImgs[i % fallbackImgs.length]}?w=600&h=300&fit=crop`;
                  return (
                    <HoverCard
                      key={p.id}
                      imgs={uploadedPhoto ? (p.photos || p.images) : getHoverImages(primarySrc, p.id)}
                      amenities={getHoverAmenities(p.price, p.type)}
                      price={p.priceDisplay}
                      status={p.status}
                      beds={p.bedrooms}
                      area={p.area}
                      type={p.type}
                      meter={getDecisionMeter(p)}
                      onViewDetails={() => navigate(`/property/${p.id}`)}
                      onBookNow={() => setBookingProperty(p)}
                      propName={p.name}
                      propLocation={p.location}
                      propId={p.id}
                      badges={<div className="property-badge" style={{ background: cfg.color, color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{cfg.badge}</div>}
                      motionProps={{ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: i * 0.07 } }}
                    />
                  );
                })}
              </div>
              {props.length > 6 && (
                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                  <button className="btn btn-primary" style={{ background: cfg.color, border: 'none', padding: '12px 32px', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
                    onClick={() => toggleSection(cfg.id)}>
                    {expandedSections[cfg.id] ? `Show Less ↑` : `View All ${props.length} ${cfg.label} →`}
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Interactive Map Section */}
      <div id="map-section" style={{ scrollMarginTop: '70px' }}>
        <Suspense fallback={<div style={{ height: '500px', background: '#0d1117', borderRadius: '12px' }} />}>
          <PropertyMap
            onViewDetails={(property) => setSelectedPickProject(property)}
          />
        </Suspense>
      </div>


      {/* Dream Home Generator Section */}
      <section className="dream-home-section">
        <div className="container">
          <div className="section-header">
            <span className="dream-badge">✨ AI Powered</span>
            <h2 className="section-title">Dream Home Generator</h2>
            <p className="section-subtitle">Tell us what your dream home looks like — we'll find the closest match from our listings.</p>
          </div>
          <div className="dream-input-wrapper">
            <textarea
              className="dream-textarea"
              placeholder="Describe your dream home… e.g. '3 BHK villa in Sector 65 with golf view under 5 crore ready to move'"
              value={dreamInput}
              onChange={e => setDreamInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDreamSearch(); } }}
              rows={3}
            />
            <button
              className={`dream-search-btn${dreamLoading ? ' loading' : ''}`}
              onClick={handleDreamSearch}
              disabled={dreamLoading || !dreamInput.trim()}
            >
              {dreamLoading ? (
                <span className="dream-spinner" />
              ) : (
                <>🏡 Find My Dream Home</>
              )}
            </button>
          </div>

          {dreamLoading && (
            <div className="dream-loading-bar">
              <div className="dream-loading-progress" />
              <p className="dream-loading-text">Analyzing your description with AI…</p>
            </div>
          )}

          {dreamResults && (
            <div className={`dream-results${dreamAnimated ? ' visible' : ''}`}>
              {/* Best Match Card */}
              <div className="dream-card best-match-card">
                <div className="dream-card-badge best">🏆 Best Match</div>
                {(() => { const b = getPropertyBadge(dreamResults.best); return b ? <span className={`prop-badge prop-badge-inline ${b.cls}`} style={{marginBottom:'8px',display:'inline-block'}}>{b.label}</span> : null; })()}
                <div className="dream-card-score">
                  <div className="dream-score-bar">
                    <div className="dream-score-fill best-fill" style={{ width: `${Math.min(100, dreamResults.best.score * 2)}%` }} />
                  </div>
                  <span className="dream-score-label">{dreamResults.fallback ? 'Suggested' : `${Math.min(99, dreamResults.best.score * 2)}% match`}</span>
                </div>
                <div className="dream-card-body">
                  <div className="dream-card-type-badge">{dreamResults.best.type}</div>
                  <h3 className="dream-card-name">{dreamResults.best.name}</h3>
                  <p className="dream-card-location">📍 {dreamResults.best.location}</p>
                  <div className="dream-card-meta">
                    {dreamResults.best.bedrooms > 0 && <span>🛏 {dreamResults.best.bedrooms} BHK</span>}
                    <span>📐 {dreamResults.best.area}</span>
                    <span>💰 {dreamResults.best.priceDisplay}</span>
                    <span className={`dream-status-tag ${dreamResults.best.status === 'Ready to Move' ? 'ready' : 'construction'}`}>{dreamResults.best.status}</span>
                  </div>
                </div>
                <button className="dream-enquire-btn" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                  📞 Enquire Now
                </button>
              </div>

              {/* Close Match Card */}
              <div className="dream-card close-match-card">
                <div className="dream-card-badge close">🥈 Close Match</div>
                {(() => { const b = getPropertyBadge(dreamResults.close); return b ? <span className={`prop-badge prop-badge-inline ${b.cls}`} style={{marginBottom:'8px',display:'inline-block'}}>{b.label}</span> : null; })()}
                <div className="dream-card-score">
                  <div className="dream-score-bar">
                    <div className="dream-score-fill close-fill" style={{ width: `${Math.min(100, dreamResults.close.score * 2 * 0.8)}%` }} />
                  </div>
                  <span className="dream-score-label">{dreamResults.fallback ? 'Alternative' : `${Math.min(85, Math.floor(dreamResults.close.score * 1.5))}% match`}</span>
                </div>
                <div className="dream-card-body">
                  <div className="dream-card-type-badge">{dreamResults.close.type}</div>
                  <h3 className="dream-card-name">{dreamResults.close.name}</h3>
                  <p className="dream-card-location">📍 {dreamResults.close.location}</p>
                  <div className="dream-card-meta">
                    {dreamResults.close.bedrooms > 0 && <span>🛏 {dreamResults.close.bedrooms} BHK</span>}
                    <span>📐 {dreamResults.close.area}</span>
                    <span>💰 {dreamResults.close.priceDisplay}</span>
                    <span className={`dream-status-tag ${dreamResults.close.status === 'Ready to Move' ? 'ready' : 'construction'}`}>{dreamResults.close.status}</span>
                  </div>
                </div>
                <button className="dream-enquire-btn close-btn" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                  📞 Enquire Now
                </button>
              </div>
            </div>
          )}

          <div className="dream-suggestions">
            <p className="dream-suggestions-label">Try these:</p>
            {[
              '3 BHK apartment Golf Course Road under 3 crore ready to move',
              '4 BHK villa Sohna Road luxury DLF',
              'affordable 2 BHK under 1 crore New Gurgaon',
            ].map((s, i) => (
              <button key={i} className="dream-suggestion-chip" onClick={() => { setDreamInput(s); }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2 className="section-title">Connect Directly. Buy Directly.</h2>
              <p className="contact-subtitle">
                Buyers reach builders. Builders reach buyers. Zero intermediaries, zero commissions on both sides.
              </p>

              <div className="contact-methods">
                <a className="contact-method" href="tel:+919876543210">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-label">Call Us</div>
                    <div className="contact-value">+91 98765 43210</div>
                  </div>
                </a>

                <a className="contact-method" href="https://mail.google.com/mail/?view=cm&to=info@vertexliving.com" target="_blank" rel="noopener noreferrer">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-label">Email Us</div>
                    <div className="contact-value">info@vertexliving.com</div>
                  </div>
                </a>

                <a className="contact-method" href="https://maps.google.com/?q=DLF+Cyber+City+Gurgaon" target="_blank" rel="noopener noreferrer">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-label">Visit Us</div>
                    <div className="contact-value">DLF Cyber City, Gurgaon</div>
                  </div>
                </a>
              </div>

              {/* Social Links */}
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook" style={{ background: '#1877f2', color: '#fff' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', color: '#fff' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn" style={{ background: '#0a66c2', color: '#fff' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter" style={{ background: '#000', color: '#fff' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Contact / Builder / Buyer Panel */}
            <div className="contact-form-wrapper">
              {isBuilder ? (
                <Suspense fallback={null}>
                  <BuilderListingPanel />
                </Suspense>
              ) : user && isBuyer ? (
                <Suspense fallback={null}>
                  <BuyerProfilePanel />
                </Suspense>
              ) : (
                <DualContactForm />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot Widget */}
      <ChatWidget />

      {/* Premium Locations — Ultra Luxury Modal */}
      {showPremiumModal && (
        <div className="premium-modal-bg" onClick={() => setShowPremiumModal(false)}>
          <div className="premium-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="premium-modal-header">
              <div className="premium-header-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Ultra Luxury · Gurugram's Finest
              </div>
              <h2 className="premium-modal-title">Elite Properties</h2>
              <p className="premium-modal-sub">Handpicked ultra-luxury residences for the most discerning buyers</p>
              <button className="pick-modal-close" style={{position:'absolute', top:'20px', right:'24px'}} onClick={() => setShowPremiumModal(false)}>✕</button>
            </div>

            {/* Properties */}
            <div className="premium-properties">

              {/* Property 1 — DLF The Camellias */}
              <div className="premium-prop-card">
                <div className="premium-prop-img-wrap">
                  <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=500&fit=crop&q=85" alt="DLF The Camellias" className="premium-prop-img" />
                  <div className="premium-prop-img-overlay">
                    <span className="premium-tag">👑 India's No.1 Luxury Residence</span>
                    <span className="pick-status status-ready">Ready to Move</span>
                  </div>
                  <div className="premium-prop-price-pill">₹73 Cr – ₹1.2 Cr+</div>
                </div>
                <div className="premium-prop-body">
                  <div className="premium-prop-dev">DLF India</div>
                  <h3 className="premium-prop-name">DLF The Camellias</h3>
                  <div className="premium-prop-loc">📍 Sector 42, Golf Course Road, Gurugram</div>

                  <div className="premium-prop-tagline">
                    "India's only LEED Platinum certified ultra-luxury residence — where every detail is perfection"
                  </div>

                  <div className="premium-specs-grid">
                    <div className="premium-spec"><span>Configuration</span><strong>4–6 BHK + Penthouses</strong></div>
                    <div className="premium-spec"><span>Size</span><strong>9,500 – 16,000 sq.ft</strong></div>
                    <div className="premium-spec"><span>Price / sq.ft</span><strong>₹88,200+</strong></div>
                    <div className="premium-spec"><span>Towers</span><strong>9 Towers · 428 Units</strong></div>
                    <div className="premium-spec"><span>Status</span><strong>Ready to Move</strong></div>
                    <div className="premium-spec"><span>Certification</span><strong>LEED Platinum ✅</strong></div>
                  </div>

                  <div className="premium-amenities-title">World-Class Amenities</div>
                  <div className="premium-amenities-list">
                    {['🏊 Olympic Pool + Indoor Heated Pool + Kids Pool', '⛳ Direct Golf Course Access', '🎭 Private Theatre', '💆 Spa, Sauna & Holistic Wellness', '🏋️ Personal Training Studio', '🍷 Wine Cellar & Lounge', '🚗 Golf Cart Shuttle Service', '🛎️ 24/7 Concierge', '🎾 Sports Arena (Tennis, Squash, Basketball)', '🌿 Landscaped Gardens & Party Lawns'].map((a, i) => (
                      <div key={i} className="premium-amenity-item">{a}</div>
                    ))}
                  </div>

                  <div className="premium-prop-actions">
                    <button className="premium-enquire-btn" onClick={() => { setShowPremiumModal(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
                      📞 Schedule Private Viewing
                    </button>
                    <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pick-modal-wa">💬 WhatsApp</a>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="premium-divider">
                <span>✦ Also Exclusive ✦</span>
              </div>

              {/* Property 2 — DLF The Dahlias */}
              <div className="premium-prop-card">
                <div className="premium-prop-img-wrap">
                  <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&h=500&fit=crop&q=85" alt="DLF The Dahlias" className="premium-prop-img" />
                  <div className="premium-prop-img-overlay">
                    <span className="premium-tag">🔥 New Launch · Most Awaited</span>
                    <span className="pick-status status-construction">Under Construction</span>
                  </div>
                  <div className="premium-prop-price-pill">₹65 Cr – ₹1 Cr+</div>
                </div>
                <div className="premium-prop-body">
                  <div className="premium-prop-dev">DLF India</div>
                  <h3 className="premium-prop-name">DLF The Dahlias</h3>
                  <div className="premium-prop-loc">📍 Sector 54, Golf Course Road, Gurugram</div>

                  <div className="premium-prop-tagline">
                    "Gurugram's most anticipated ultra-luxury launch — sky-high penthouses with private terraces & plunge pools"
                  </div>

                  <div className="premium-specs-grid">
                    <div className="premium-spec"><span>Configuration</span><strong>4–6 BHK + Penthouses</strong></div>
                    <div className="premium-spec"><span>Size</span><strong>9,500 – 16,000 sq.ft</strong></div>
                    <div className="premium-spec"><span>Price / sq.ft</span><strong>₹80,000+</strong></div>
                    <div className="premium-spec"><span>Towers</span><strong>29 Towers · 400 Units</strong></div>
                    <div className="premium-spec"><span>Land Area</span><strong>17 Acres</strong></div>
                    <div className="premium-spec"><span>Possession</span><strong>December 2030</strong></div>
                  </div>

                  <div className="premium-amenities-title">Exclusive Features</div>
                  <div className="premium-amenities-list">
                    {['🏠 Full Smart Home Automation', '🌇 Floor-to-Ceiling Glass & Panoramic Views', '🛁 Private Plunge Pools in Penthouses', '🌿 Private Terraces with Landscape Gardens', '💎 Bespoke Italian Marble Interiors', '🍽️ Modular Kitchen with Premium Appliances', '💆 Premium Spa & Wellness Club', '🚇 Near Rapid Metro Station', '🔒 3-Tier Smart Security System', '🌳 Lush Landscaped 17-Acre Estate'].map((a, i) => (
                      <div key={i} className="premium-amenity-item">{a}</div>
                    ))}
                  </div>

                  <div className="premium-prop-actions">
                    <button className="premium-enquire-btn" onClick={() => { setShowPremiumModal(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
                      📞 Register Interest Now
                    </button>
                    <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pick-modal-wa">💬 WhatsApp</a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Best Prices Modal */}
      {showBestPriceModal && (
        <div className="docs-modal-bg" onClick={() => setShowBestPriceModal(false)}>
          <div className="docs-modal" style={{maxWidth:'920px'}} onClick={e => e.stopPropagation()}>

            <div className="docs-modal-header">
              <div>
                <div className="docs-header-badge" style={{background:'rgba(16,185,129,0.1)', borderColor:'rgba(16,185,129,0.25)', color:'#34d399'}}>💰 Zero Commission · Best Price Guaranteed</div>
                <h2 className="docs-modal-title">Hum Aapko Best Price Kaise Dilwate Hain</h2>
                <p className="docs-modal-sub">Doosri companies se alag hain hum — aur yeh prove karte hain numbers se</p>
              </div>
              <button className="pick-modal-close" style={{position:'static',flexShrink:0}} onClick={() => setShowBestPriceModal(false)}>✕</button>
            </div>

            <div className="docs-modal-body">

              {/* Big numbers */}
              <div className="bp-stats-row">
                {[
                  { val:'₹0', label:'Buyer Se Commission', sub:'Completely Free Service', color:'#10b981' },
                  { val:'8–12%', label:'Average Discount Dilwaya', sub:'On market listed price', color:'#6366f1' },
                  { val:'1,800+', label:'Satisfied Buyers', sub:'In Gurugram alone', color:'#f59e0b' },
                  { val:'15+', label:'Developer Tie-Ups', sub:'Direct access = better rates', color:'#d4a853' },
                ].map((s,i) => (
                  <div key={i} className="bp-stat-card">
                    <div className="bp-stat-val" style={{color: s.color}}>{s.val}</div>
                    <div className="bp-stat-label">{s.label}</div>
                    <div className="bp-stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* What we do for best price */}
              <div className="docs-section">
                <h3 className="docs-section-title">🛠️ Best Price Dilwane Ke Liye Hum Kya Karte Hain</h3>
                <div className="bp-what-grid">
                  {[
                    { icon:'📊', title:'Real Market Valuation', desc:'Property ka actual market value calculate karte hain — circle rate, recent transactions, demand-supply analysis se. Aapko pata chal jaata hai ki listed price sahi hai ya nahi.' },
                    { icon:'🤝', title:'Direct Developer Tie-Ups', desc:'15+ top developers ke saath hamare direct tie-ups hain — DLF, M3M, Godrej, Sobha, Elan. Iska matlab hai pre-launch prices, exclusive inventory aur special payment plans sirf hamaaray clients ko.' },
                    { icon:'🔥', title:'Aggressive Negotiation', desc:'Hamara expert aapki taraf se negotiate karta hai — not as a middleman but as your lawyer. Floor price, discount slabs aur hidden benefits jo normally nahi milte — wo bhi nikaal ke laate hain.' },
                    { icon:'🎁', title:'Hidden Benefits Unlock', desc:'Price ke alawa bhi bahut kuch milta hai — free parking (₹5–8 Lakh value), modular kitchen, club membership, GST waiver, subvention schemes. Yeh sab negotiate karte hain.' },
                    { icon:'📅', title:'Flexible Payment Plans', desc:'Construction-linked plan ya subvention scheme? Jo plan aapke cash flow ke liye best ho, wahi recommend karte hain — aur developer se customize bhi karwate hain.' },
                    { icon:'🏦', title:'Best Home Loan Rate', desc:'15+ banks ke saath tie-up hai. 8.35% tak ka home loan dilwaya hai clients ko. Processing fee waiver bhi negotiate karte hain. Total saving ₹2–5 Lakh tak ho jaata hai.' },
                  ].map((item,i) => (
                    <div key={i} className="bp-what-card">
                      <div className="bp-what-icon">{item.icon}</div>
                      <h4 className="bp-what-title">{item.title}</h4>
                      <p className="bp-what-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vertex vs Others comparison */}
              <div className="docs-section">
                <h3 className="docs-section-title">⚔️ Vertex Living vs Doosri Real Estate Companies</h3>
                <div className="bp-compare-table">
                  <div className="bp-compare-header">
                    <div className="bp-col-feature">Feature</div>
                    <div className="bp-col-vertex">✅ Vertex Living</div>
                    <div className="bp-col-others">❌ Doosri Companies</div>
                  </div>
                  {[
                    ['Buyer Se Commission', '₹0 — Completely Free', '1–2% of property value'],
                    ['Price Transparency', '100% — market data dikhate hain', 'Often inflated prices quoted'],
                    ['Developer Tie-Ups', '15+ direct developers', 'Limited or third-party only'],
                    ['Negotiation', 'Expert aapki taraf se larta hai', 'Commission ke liye price badhate hain'],
                    ['Legal Verification', 'Free title & RERA check', 'Extra charge ₹10,000–₹50,000'],
                    ['Home Loan Assistance', 'Free — best rate guarantee', 'Referral fee lete hain bank se'],
                    ['After-Sale Support', 'Possession tak full support', 'Deal close hone ke baad missing'],
                    ['Hidden Charges', 'Zero hidden charges', 'Surprise fees at closing'],
                    ['Available', '7 Days · 9AM–9PM', 'Weekdays only, 10–6 PM'],
                    ['Language', 'Hindi + English both', 'Mostly formal English only'],
                  ].map(([feature, us, them], i) => (
                    <div key={i} className={`bp-compare-row ${i%2===0?'alt':''}`}>
                      <div className="bp-col-feature">{feature}</div>
                      <div className="bp-col-vertex bp-us">{us}</div>
                      <div className="bp-col-others bp-them">{them}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real savings examples */}
              <div className="docs-section">
                <h3 className="docs-section-title">💸 Real Examples — Kitni Bachaat Hui Hamaaray Clients Ko</h3>
                <div className="bp-savings-grid">
                  {[
                    { property:'Godrej Meridien, Sec 106', listed:'₹2.20 Cr', got:'₹1.95 Cr', saved:'₹25 Lakh', extras:'Free Parking + Club Membership', client:'Rahul S., IT Professional' },
                    { property:'M3M Golf Estate, Sec 65', listed:'₹5.20 Cr', got:'₹4.60 Cr', saved:'₹60 Lakh', extras:'Modular Kitchen + GST Waiver', client:'Priya A., Business Owner' },
                    { property:'Sobha City, Sec 108', listed:'₹1.80 Cr', got:'₹1.62 Cr', saved:'₹18 Lakh', extras:'Free Parking + Home Loan @8.4%', client:'Amit K., NRI Buyer' },
                  ].map((s,i) => (
                    <div key={i} className="bp-saving-card">
                      <div className="bp-saving-top">
                        <div className="bp-saving-property">{s.property}</div>
                        <div className="bp-saving-client">👤 {s.client}</div>
                      </div>
                      <div className="bp-saving-prices">
                        <div className="bp-price-item">
                          <span>Listed Price</span>
                          <strong className="bp-listed">{s.listed}</strong>
                        </div>
                        <div className="bp-arrow">→</div>
                        <div className="bp-price-item">
                          <span>Deal Closed At</span>
                          <strong className="bp-got">{s.got}</strong>
                        </div>
                      </div>
                      <div className="bp-saved-badge">🎉 Total Saved: {s.saved}</div>
                      <div className="bp-extras">+ Extras: {s.extras}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust factors */}
              <div className="docs-section">
                <h3 className="docs-section-title">🔒 Aap Hum Par Bharosa Kyun Karein</h3>
                <div className="bp-trust-grid">
                  {[
                    { icon:'📜', title:'RERA Registered', desc:'Hum ek RERA-registered brokerage firm hain. Hmare license number public record mein hain — verify kar sakte hain.' },
                    { icon:'⭐', title:'4.9/5 Google Rating', desc:'1,200+ verified Google reviews hain hamaare. Fake nahi — real clients ne likhe hain. Check karo Google pe "Vertex Living Gurgaon".' },
                    { icon:'🏆', title:'15+ Years in Market', desc:'2009 se Gurugram real estate mein hain. Market crash dekha, boom dekha — experienced advice milti hai, na ki fresh agent ki guessing.' },
                    { icon:'💼', title:'No Conflict of Interest', desc:'Hum developer ke agent nahi hain — aapke agent hain. Isliye aapke liye best deal lata hai expert, developer ke liye nahi.' },
                    { icon:'📱', title:'Full Transparency App', desc:'Hamaaray clients ko ek personal dashboard milta hai — price history, document status, loan status — sab real-time track kar sakte ho.' },
                    { icon:'🤲', title:'Zero Pressure Guarantee', desc:'Koi bhi client kabhi pressure mein report nahi kiya. Agar lagay toh hum apologise karte hain aur agent change karte hain — guaranteed.' },
                  ].map((t,i) => (
                    <div key={i} className="docs-legal-card" style={{background:'#0f172a', borderColor:'#1e293b'}}>
                      <div className="docs-legal-icon">{t.icon}</div>
                      <h4 className="docs-legal-title">{t.title}</h4>
                      <p className="docs-legal-desc">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price promise */}
              <div className="bp-promise-banner">
                <div className="bp-promise-icon">🤝</div>
                <div className="bp-promise-text">
                  <strong>Vertex Living Price Promise</strong>
                  <p>Agar aap humse baat karne ke baad kisi doosri company se same property sasti milti hai — hum usse aur sasta karwayenge. Nahi kar paaye toh ₹5,000 cashback. Yeh hai hamara commitment.</p>
                </div>
              </div>

              {/* CTA */}
              <div className="docs-cta-bar" style={{background:'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(99,102,241,0.05))', borderColor:'rgba(16,185,129,0.2)'}}>
                <div className="docs-cta-text">
                  <strong>Aaj Hi Best Price Quote Maango — Free!</strong>
                  <span>15 min mein apni property ka real market value aur best deal estimate milega</span>
                </div>
                <div className="docs-cta-buttons">
                  <button className="premium-enquire-btn" style={{padding:'12px 24px', fontSize:'14px', background:'linear-gradient(135deg, #059669, #10b981)'}} onClick={() => { setShowBestPriceModal(false); document.getElementById('contact')?.scrollIntoView({ behavior:'smooth' }); }}>
                    💰 Get Best Price Now
                  </button>
                  <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pick-modal-wa">💬 WhatsApp</a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Expert Guidance Modal */}
      {showExpertModal && (
        <div className="docs-modal-bg" onClick={() => setShowExpertModal(false)}>
          <div className="docs-modal" style={{maxWidth:'900px'}} onClick={e => e.stopPropagation()}>

            <div className="docs-modal-header">
              <div>
                <div className="docs-header-badge" style={{background:'rgba(245,158,11,0.1)', borderColor:'rgba(245,158,11,0.25)', color:'#fbbf24'}}>🏆 15+ Years Experience · 1,800+ Happy Clients</div>
                <h2 className="docs-modal-title">Your Personal Property Expert</h2>
                <p className="docs-modal-sub">Hamare expert agent aapko pehli call se leke possession tak — har kadam pe guide karte hain</p>
              </div>
              <button className="pick-modal-close" style={{position:'static', flexShrink:0}} onClick={() => setShowExpertModal(false)}>✕</button>
            </div>

            <div className="docs-modal-body">

              {/* Expert Profile */}
              <div className="docs-section">
                <h3 className="docs-section-title">👨‍💼 Hamare Expert Kaun Hain?</h3>
                <div className="eg-profile-grid">
                  {[
                    { avatar:'👨‍💼', name:'Rajiv Sharma', role:'Senior Property Consultant', exp:'12 Years', deals:'400+ Deals', spec:'Luxury & Ultra Luxury', rating:'4.9★' },
                    { avatar:'👩‍💼', name:'Priya Malhotra', role:'Investment Specialist', exp:'9 Years', deals:'320+ Deals', spec:'Investment & ROI Planning', rating:'4.8★' },
                    { avatar:'👨‍💼', name:'Amit Verma', role:'NRI Property Expert', exp:'11 Years', deals:'280+ Deals', spec:'NRI Buyers & Legal', rating:'4.9★' },
                  ].map((e,i) => (
                    <div key={i} className="eg-profile-card">
                      <div className="eg-avatar">{e.avatar}</div>
                      <div className="eg-profile-info">
                        <div className="eg-name">{e.name}</div>
                        <div className="eg-role">{e.role}</div>
                        <div className="eg-tags">
                          <span>{e.exp}</span>
                          <span>{e.deals}</span>
                          <span>{e.rating}</span>
                        </div>
                        <div className="eg-spec">Speciality: {e.spec}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How expert guides — journey */}
              <div className="docs-section">
                <h3 className="docs-section-title">🗺️ Expert Aapko Kaise Guide Karta Hai — Puri Journey</h3>
                <div className="eg-journey">
                  {[
                    {
                      phase: 'Phase 1', title: 'Requirement Understanding', icon: '🎯', color: '#6366f1',
                      steps: [
                        'Free consultation call — aapki zaruraat, budget, family size samjhenge',
                        'Investment ya personal use? Future plans poochhe jaenge',
                        'Location preference, connectivity aur preferred amenities note kiye jaenge',
                        'Ek personalized "Property Brief" banaya jaega sirf aapke liye',
                      ]
                    },
                    {
                      phase: 'Phase 2', title: 'Market Research & Shortlisting', icon: '🔍', color: '#0d9488',
                      steps: [
                        '100+ properties mein se aapke brief ke hisaab se best 5–8 shortlist ki jaengi',
                        'Har property ka RERA status, legal clearance verify kiya jaega',
                        'Developer track record, project delivery history check hoga',
                        'Comparable prices ka analysis karke real market value batai jaegi',
                      ]
                    },
                    {
                      phase: 'Phase 3', title: 'Site Visit & Presentation', icon: '🏠', color: '#d4a853',
                      steps: [
                        'Expert khud saath aayenge site visit pe — akele nahi bhejna padega',
                        'Har property ki strengths AND weaknesses honestly batai jaengi',
                        'Location advantages, nearby development, future appreciation explain hogi',
                        'Virtual tour + physical visit ka combination offer kiya jaega',
                      ]
                    },
                    {
                      phase: 'Phase 4', title: 'Negotiation & Best Price', icon: '💰', color: '#10b981',
                      steps: [
                        'Expert aapki taraf se developer/seller se negotiate karega',
                        'Market data use karke maximum discount dilwaya jaega',
                        'Free parking, furniture, GST waiver jaise hidden benefits negotiate hoge',
                        'Payment plan ko aapke cash flow ke hisaab se customize karaya jaega',
                      ]
                    },
                    {
                      phase: 'Phase 5', title: 'Closing & Documentation', icon: '✍️', color: '#8b5cf6',
                      steps: [
                        'Sale agreement ki har clause expert check karega — koi risk nahi',
                        'Home loan ke liye best bank aur rate dhundha jaega',
                        'Registration pe saath aayenge — Sub-Registrar office',
                        'Possession tak follow-up — quality check, punch list sab hoga',
                      ]
                    },
                  ].map((phase, i) => (
                    <div key={i} className="eg-phase">
                      <div className="eg-phase-header" style={{borderLeftColor: phase.color}}>
                        <span className="eg-phase-icon">{phase.icon}</span>
                        <div>
                          <div className="eg-phase-label" style={{color: phase.color}}>{phase.phase}</div>
                          <div className="eg-phase-title">{phase.title}</div>
                        </div>
                      </div>
                      <div className="eg-phase-steps">
                        {phase.steps.map((s, j) => (
                          <div key={j} className="eg-phase-step">
                            <span className="eg-step-dot" style={{background: phase.color}} />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How expert convinces — objection handling */}
              <div className="docs-section">
                <h3 className="docs-section-title">🧠 Expert Aapke Har Doubt Ka Jawab Deta Hai</h3>
                <div className="eg-objections">
                  {[
                    { doubt: '"Price bahut zyada lag raha hai..."', answer: 'Expert comparable properties ka data dikhayega — prove karega ki yeh market rate hi hai. Phir negotiate karke best possible price dilwayega.' },
                    { doubt: '"Under construction mein risk hai..."', answer: 'RERA registration, developer\'s past delivery record, construction progress aur escrow account details dikhakar risk zero ho jaata hai.' },
                    { doubt: '"Abhi wait karna chahiye, price aur girenge..."', answer: 'Last 5 saal ka price appreciation data dikha ke samjhayega — Gurugram mein prices girte nahi, sirf badhte hain. Wait = loss.' },
                    { doubt: '"Home loan milega ya nahi..."', answer: 'Expert ka bank relations hain — pre-approval karwa ke pehle hi batayega. 95% cases mein loan milta hai unke clients ko.' },
                    { doubt: '"Itna bada investment akele nahi kar sakta..."', answer: 'Family ke saath meeting arrange hogi. Detailed ROI projection, rental income calculation aur 5-year value forecast dikhaya jaega.' },
                    { doubt: '"Doosri company se better deal milegi..."', answer: 'Honest market comparison diya jaega. Vertex Living ka advantage — zero commission from buyer + legal assistance included.' },
                  ].map((obj, i) => (
                    <div key={i} className="eg-objection-card">
                      <div className="eg-doubt">❓ {obj.doubt}</div>
                      <div className="eg-answer">💡 {obj.answer}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What makes our experts different */}
              <div className="docs-section">
                <h3 className="docs-section-title">⭐ Hamare Experts Ko Kya Special Banata Hai</h3>
                <div className="docs-legal-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                  {[
                    { icon:'🎓', title:'Certified Experts', desc:'All agents are RERA certified and trained in property law, finance & negotiation.' },
                    { icon:'🤝', title:'Zero Pressure Selling', desc:'Hum kabhi force nahi karte. Aap comfortable ho tab hi decision lena — hamare experts samjhenge.' },
                    { icon:'📊', title:'Data-Driven Advice', desc:'Har advice market data pe based hoti hai — feelings pe nahi. Price trends, ROI, rental yield sab numbers se.' },
                    { icon:'🕐', title:'24/7 Available', desc:'Koi bhi sawaal aaya — raat ko bhi WhatsApp karo. Hamare agents 24 ghante available hain.' },
                    { icon:'🌐', title:'Hindi & English Both', desc:'Aap jis bhi language mein comfortable ho — Hindi mein bhi poori guidance milegi. No confusion.' },
                    { icon:'🔒', title:'100% Transparent', desc:'Koi hidden charges nahi. Buyer se zero commission. Jo deal hogi — sab kuch pehle hi bata denge.' },
                  ].map((s,i) => (
                    <div key={i} className="docs-legal-card">
                      <div className="docs-legal-icon">{s.icon}</div>
                      <h4 className="docs-legal-title">{s.title}</h4>
                      <p className="docs-legal-desc">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client testimonials */}
              <div className="docs-section">
                <h3 className="docs-section-title">💬 Real Clients Kya Kehte Hain</h3>
                <div className="eg-testimonials">
                  {[
                    { name:'Suresh Kapoor', city:'Delhi', text:'"Rajiv ne mujhe sahi time pe sahi property choose karne mein help ki. Usne market data se prove kiya ki wait karna galat hoga. Aaj woh property 40% appreciate ho chuki hai!"', prop:'DLF Camellias Buyer' },
                    { name:'Neha Agarwal (NRI)', city:'Dubai', text:'"Dubai mein baith ke Gurugram mein property kharidi — virtual tour, video calls, aur Amit ne sab kuch handle kiya. Ek baar bhi India nahi aana pada. Outstanding service!"', prop:'M3M Golf Estate Buyer' },
                    { name:'Vivek Malhotra', city:'Gurgaon', text:'"Priya ne mujhe convince kiya ki investment ke liye under-construction better hoga. Return on investment ka calculation dekha toh dimag khul gaya. Best decision of my life."', prop:'Elan Presidential Investor' },
                  ].map((t,i) => (
                    <div key={i} className="eg-testimonial">
                      <div className="eg-testimonial-text">"{t.text}"</div>
                      <div className="eg-testimonial-footer">
                        <div className="eg-t-avatar">{t.name[0]}</div>
                        <div>
                          <div className="eg-t-name">{t.name} — {t.city}</div>
                          <div className="eg-t-prop">🏠 {t.prop}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="docs-cta-bar" style={{background:'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(99,102,241,0.05))', borderColor:'rgba(245,158,11,0.2)'}}>
                <div className="docs-cta-text">
                  <strong>Abhi Expert Se Baat Karo — Free Consultation!</strong>
                  <span>15 minute ki call mein aapki property journey ka pura roadmap milega</span>
                </div>
                <div className="docs-cta-buttons">
                  <button className="premium-enquire-btn" style={{padding:'12px 24px', fontSize:'14px', background:'linear-gradient(135deg, #d97706, #f59e0b)'}} onClick={() => { setShowExpertModal(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    📞 Book Free Consultation
                  </button>
                  <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pick-modal-wa">💬 WhatsApp Now</a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Virtual Tours Modal */}
      {showVirtualModal && (
        <div className="docs-modal-bg" onClick={() => setShowVirtualModal(false)}>
          <div className="docs-modal" onClick={e => e.stopPropagation()}>

            <div className="docs-modal-header">
              <div>
                <div className="docs-header-badge" style={{background:'rgba(20,184,166,0.12)', borderColor:'rgba(20,184,166,0.25)', color:'#2dd4bf'}}>🥽 Immersive Virtual Experience</div>
                <h2 className="docs-modal-title">Virtual Property Tours</h2>
                <p className="docs-modal-sub">Explore every corner of a property from your phone, laptop or VR headset — without stepping outside</p>
              </div>
              <button className="pick-modal-close" style={{position:'static', flexShrink:0}} onClick={() => setShowVirtualModal(false)}>✕</button>
            </div>

            <div className="docs-modal-body">

              {/* What is Virtual Tour */}
              <div className="docs-section">
                <h3 className="docs-section-title">🤔 Virtual Tour Kya Hota Hai?</h3>
                <div className="vt-intro-grid">
                  <div className="vt-intro-text">
                    <p>Virtual Tour ek <strong>360° interactive experience</strong> hai jisme aap ghar baithe kisi bhi property ke andar jaake har room ko explore kar sakte ho — bilkul waisa jaise aap physically wahan ho.</p>
                    <p>Aapko physically site visit karne ki zarurat nahi. Apne <strong>phone, tablet ya laptop</strong> pe property ka full walkthrough lo — bedroom se leke bathroom, kitchen se balcony tak sab dekho.</p>
                    <p>NRI buyers ya dusre sheher mein rehne walon ke liye yeh especially useful hai. <strong>Time aur travel ka kharcha dono bachta hai.</strong></p>
                  </div>
                  <div className="vt-intro-stats">
                    {[
                      { val: '360°', label: 'Full View Coverage' },
                      { val: '4K', label: 'Ultra HD Quality' },
                      { val: '0', label: 'Travel Required' },
                      { val: '24/7', label: 'Available Anytime' },
                    ].map((s,i) => (
                      <div key={i} className="vt-stat">
                        <div className="vt-stat-val">{s.val}</div>
                        <div className="vt-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* How it works - Steps */}
              <div className="docs-section">
                <h3 className="docs-section-title">🚀 Kaise Kaam Karta Hai — 4 Simple Steps</h3>
                <div className="vt-steps-grid">
                  {[
                    { num:'1', icon:'📱', title:'Property Select Karo', desc:'Website pe apni pasand ki property choose karo ya hamse WhatsApp pe request karo. "Virtual Tour chahiye" likho.' },
                    { num:'2', icon:'🔗', title:'Link Mile Turant', desc:'Hum turant aapko us property ka private 360° virtual tour link WhatsApp ya email pe bhejte hain — bilkul free.' },
                    { num:'3', icon:'🥽', title:'Tour Shuru Karo', desc:'Link open karo. Mouse ya touch se har direction mein move karo. Room to room freely ghume. Zoom karo, details dekho.' },
                    { num:'4', icon:'📞', title:'Agent Se Baat Karo', desc:'Tour ke baad koi sawal ho toh directly agent ko call karo ya chat karo. Site visit book karo sirf tab jab confirm ho jao.' },
                  ].map((s,i) => (
                    <div key={i} className="vt-step-card">
                      <div className="vt-step-num">{s.num}</div>
                      <div className="vt-step-icon">{s.icon}</div>
                      <h4 className="vt-step-title">{s.title}</h4>
                      <p className="vt-step-desc">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="docs-section">
                <h3 className="docs-section-title">✨ Virtual Tour Mein Kya Milta Hai</h3>
                <div className="vt-features-grid">
                  {[
                    { icon:'🏠', title:'Full Property Walkthrough', desc:'Entrance se leke terrace tak — every room, every corner. Realistic 360° view.' },
                    { icon:'📐', title:'Room Dimensions', desc:'Har room ka exact size screen pe dikhta hai. Furniture planning pehle hi karo.' },
                    { icon:'🌅', title:'View & Balcony', desc:'Balcony se actual view dekho — garden, city, pool — jo physically dekhoge wahi.' },
                    { icon:'💡', title:'Day & Night Mode', desc:'Property din mein aur raat mein kaisi dikhti hai — dono modes mein dekh sakte ho.' },
                    { icon:'🗺️', title:'Floor Plan Overlay', desc:'Tour ke saath saath interactive floor plan bhi milta hai — position track karo.' },
                    { icon:'🔍', title:'Zoom & Inspect', desc:'Fittings, flooring, fixtures — kisi bhi cheez pe zoom karke quality check karo.' },
                    { icon:'🥽', title:'VR Headset Support', desc:'Oculus / Google Cardboard se fully immersive VR experience lo — ghar mein baithe.' },
                    { icon:'📹', title:'Video Call Tour', desc:'Hamara agent live video call pe tour guide kare — real-time questions poochho.' },
                  ].map((f,i) => (
                    <div key={i} className="docs-legal-card">
                      <div className="docs-legal-icon">{f.icon}</div>
                      <h4 className="docs-legal-title">{f.title}</h4>
                      <p className="docs-legal-desc">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div className="docs-section">
                <h3 className="docs-section-title">📱 Kaunse Devices Pe Chalega</h3>
                <div className="vt-devices-grid">
                  {[
                    { icon:'📱', device:'Smartphone', detail:'Android & iPhone — Chrome ya Safari browser se kaam kare', support:'✅ Full Support' },
                    { icon:'💻', device:'Laptop / PC', detail:'Windows & Mac — koi bhi modern browser chalega', support:'✅ Full Support' },
                    { icon:'📟', device:'Tablet / iPad', detail:'iPad aur Android tablets pe bhi perfectly kaam karta hai', support:'✅ Full Support' },
                    { icon:'🥽', device:'VR Headset', detail:'Oculus Quest, Meta Quest 2/3, Google Cardboard compatible', support:'✅ VR Ready' },
                  ].map((d,i) => (
                    <div key={i} className="vt-device-card">
                      <div className="vt-device-icon">{d.icon}</div>
                      <div>
                        <div className="vt-device-name">{d.device}</div>
                        <div className="vt-device-detail">{d.detail}</div>
                      </div>
                      <div className="vt-device-support">{d.support}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="docs-section">
                <h3 className="docs-section-title">💎 Virtual Tour Ke Fayde</h3>
                <div className="vt-benefits-list">
                  {[
                    ['⏰ Time Bachao', 'Ek din mein 10+ properties virtually dekho — physically 1 bhi nahi dekh paoge itni'],
                    ['✈️ NRI Friendly', 'Videsh mein ho? Koi baat nahi — ghar baithe India mein property buy karo'],
                    ['👨‍👩‍👧 Family Ko Dikhao', 'Family ke saare members alag-alag time pe tour le sakte hain, kahi bhi se'],
                    ['🤔 Better Decision', 'Multiple properties compare karo bina stress ke — sahi decision lena aasan'],
                    ['💰 Zero Extra Cost', 'Virtual tour bilkul free hai — koi hidden charge nahi'],
                    ['🦺 Safe & Comfortable', 'Rainy season, traffic ya lockdown — kisi bhi situation mein property dekho'],
                  ].map(([title, desc], i) => (
                    <div key={i} className="vt-benefit-item">
                      <div className="vt-benefit-title">{title}</div>
                      <div className="vt-benefit-desc">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="docs-cta-bar" style={{background:'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(99,102,241,0.05))', borderColor:'rgba(20,184,166,0.2)'}}>
                <div className="docs-cta-text">
                  <strong>Virtual Tour Book Karo — Bilkul Free!</strong>
                  <span>WhatsApp karo ya call karo — 15 minute mein tour link bhejenge</span>
                </div>
                <div className="docs-cta-buttons">
                  <button className="premium-enquire-btn" style={{padding:'12px 24px', fontSize:'14px', background:'linear-gradient(135deg, #0d9488, #14b8a6)'}} onClick={() => { setShowVirtualModal(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    🥽 Request Virtual Tour
                  </button>
                  <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pick-modal-wa">💬 WhatsApp</a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Easy Documentation Modal */}
      {showDocsModal && (
        <div className="docs-modal-bg" onClick={() => setShowDocsModal(false)}>
          <div className="docs-modal" onClick={e => e.stopPropagation()}>

            <div className="docs-modal-header">
              <div>
                <div className="docs-header-badge">📋 Complete Documentation Guide</div>
                <h2 className="docs-modal-title">Easy Documentation Process</h2>
                <p className="docs-modal-sub">From agreement to registration — we handle everything for you</p>
              </div>
              <button className="pick-modal-close" style={{position:'static', flexShrink:0}} onClick={() => setShowDocsModal(false)}>✕</button>
            </div>

            <div className="docs-modal-body">

              {/* Step-by-step process */}
              <div className="docs-section">
                <h3 className="docs-section-title">🪜 Step-by-Step Buying Process</h3>
                <div className="docs-steps">
                  {[
                    { step: '01', title: 'Property Selection', desc: 'Finalize the property with our agent. We verify ownership, RERA status, and legal clearances before you proceed.', time: '1–2 Days', icon: '🏠' },
                    { step: '02', title: 'Booking Amount', desc: 'Pay a token/booking amount (typically 1–2% of property value) to lock the property. A receipt and allotment letter is issued.', time: '1 Day', icon: '💰' },
                    { step: '03', title: 'Buyer–Seller Agreement', desc: 'A Sale Agreement (Bayana) is signed between buyer and seller mentioning price, payment schedule, and possession date.', time: '3–5 Days', icon: '🤝' },
                    { step: '04', title: 'Home Loan Processing', desc: 'If financing, we connect you with top banks (HDFC, SBI, ICICI). Loan sanction typically takes 7–15 working days.', time: '7–15 Days', icon: '🏦' },
                    { step: '05', title: 'Payment & NOC', desc: 'Full payment is made as per schedule. Builder issues No Objection Certificate (NOC) and possession letter.', time: '15–30 Days', icon: '✅' },
                    { step: '06', title: 'Sale Deed & Registration', desc: 'The Sale Deed is executed at Sub-Registrar office. Stamp duty (5–7%) and registration fee (1%) are paid. Property is now legally yours.', time: '1 Day', icon: '⚖️' },
                    { step: '07', title: 'Mutation & Possession', desc: 'Property is mutated in your name in municipal records. Keys are handed over along with all original documents.', time: '7–15 Days', icon: '🔑' },
                  ].map((s, i) => (
                    <div key={i} className="docs-step">
                      <div className="docs-step-left">
                        <div className="docs-step-num">{s.step}</div>
                        <div className="docs-step-line" />
                      </div>
                      <div className="docs-step-right">
                        <div className="docs-step-header">
                          <span className="docs-step-icon">{s.icon}</span>
                          <h4 className="docs-step-title">{s.title}</h4>
                          <span className="docs-step-time">⏱ {s.time}</span>
                        </div>
                        <p className="docs-step-desc">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Required */}
              <div className="docs-section">
                <h3 className="docs-section-title">📁 Documents Required from Buyer</h3>
                <div className="docs-two-col">
                  <div className="docs-doc-group">
                    <div className="docs-doc-group-title">Identity & Address Proof</div>
                    {['Aadhaar Card (mandatory)', 'PAN Card (mandatory for transactions above ₹50 Lakh)', 'Passport (if NRI buyer)', 'Voter ID Card', 'Driving License'].map((d,i) => (
                      <div key={i} className="docs-doc-item">✔ {d}</div>
                    ))}
                  </div>
                  <div className="docs-doc-group">
                    <div className="docs-doc-group-title">Financial Documents</div>
                    {['Last 3 months salary slips', 'Last 6 months bank statements', 'Form 16 / ITR (last 2 years)', 'Employment letter (for home loan)', 'Bank passbook / cancelled cheque'].map((d,i) => (
                      <div key={i} className="docs-doc-item">✔ {d}</div>
                    ))}
                  </div>
                  <div className="docs-doc-group">
                    <div className="docs-doc-group-title">For NRI Buyers</div>
                    {['Passport & Visa copies', 'OCI / PIO Card', 'Power of Attorney (notarized)', 'NRE / NRO Bank Account details', 'Foreign Income Proof'].map((d,i) => (
                      <div key={i} className="docs-doc-item">✔ {d}</div>
                    ))}
                  </div>
                  <div className="docs-doc-group">
                    <div className="docs-doc-group-title">Property Documents (from Seller)</div>
                    {['Original Sale Deed / Title Deed', 'RERA Registration Certificate', 'Approved Building Plan', 'Occupancy Certificate (OC)', 'No Dues Certificate from Society'].map((d,i) => (
                      <div key={i} className="docs-doc-item">✔ {d}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="docs-section">
                <h3 className="docs-section-title">💸 Charges & Cost Breakdown (Haryana)</h3>
                <div className="docs-cost-table">
                  {[
                    { charge: 'Stamp Duty', rate: '5–7%', note: 'On property value (5% for women, 7% for men)' },
                    { charge: 'Registration Fee', rate: '1%', note: 'On property value (max ₹50,000)' },
                    { charge: 'GST (Under Construction)', rate: '5%', note: 'Applicable on under-construction properties only' },
                    { charge: 'Home Loan Processing Fee', rate: '0.5–1%', note: 'One-time fee charged by bank' },
                    { charge: 'Legal / Lawyer Fee', rate: '₹5,000–₹20,000', note: 'For agreement drafting & vetting' },
                    { charge: 'Society / Maintenance Deposit', rate: '₹50,000–₹2 Lakh', note: 'One-time deposit to housing society' },
                    { charge: 'Vertex Living Service Fee', rate: '0%', note: '✅ No extra charges from us — 100% Free Service' },
                  ].map((row, i) => (
                    <div key={i} className={`docs-cost-row ${i % 2 === 0 ? 'alt' : ''}`}>
                      <div className="docs-cost-charge">{row.charge}</div>
                      <div className="docs-cost-rate">{row.rate}</div>
                      <div className="docs-cost-note">{row.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Services */}
              <div className="docs-section">
                <h3 className="docs-section-title">⚖️ Our Legal Assistance Services</h3>
                <div className="docs-legal-grid">
                  {[
                    { icon: '🔍', title: 'Title Verification', desc: 'We verify property title, ownership chain and check for any encumbrances or disputes.' },
                    { icon: '📜', title: 'Agreement Drafting', desc: 'Our legal experts draft the Sale Agreement and Sale Deed to protect your interests.' },
                    { icon: '🏛️', title: 'Registration Assistance', desc: 'We accompany you to the Sub-Registrar office and manage the entire registration process.' },
                    { icon: '💳', title: 'Loan Coordination', desc: 'We liaise with banks and NBFCs to get you the best home loan rates and quick approvals.' },
                    { icon: '🏢', title: 'RERA Verification', desc: 'We verify the project\'s RERA registration and check for any complaints or violations.' },
                    { icon: '🤝', title: 'Post-Sale Support', desc: 'Mutation, society transfer, utility transfers — we assist you even after possession.' },
                  ].map((s, i) => (
                    <div key={i} className="docs-legal-card">
                      <div className="docs-legal-icon">{s.icon}</div>
                      <h4 className="docs-legal-title">{s.title}</h4>
                      <p className="docs-legal-desc">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="docs-cta-bar">
                <div className="docs-cta-text">
                  <strong>Need help with documentation?</strong>
                  <span>Our legal team is available 7 days a week, 9AM–8PM</span>
                </div>
                <div className="docs-cta-buttons">
                  <button className="premium-enquire-btn" style={{padding:'12px 24px', fontSize:'14px'}} onClick={() => { setShowDocsModal(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    📞 Talk to Legal Expert
                  </button>
                  <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pick-modal-wa">💬 WhatsApp</a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Verified Properties Modal */}
      {showVerifiedModal && (() => {
        const filtered = moodFilteredDB.filter(p => {
          const matchType   = verifiedFilter.type   === 'All' || p.type === verifiedFilter.type;
          const matchStatus = verifiedFilter.status === 'All' || p.status === verifiedFilter.status;
          const matchSearch = !verifiedFilter.search ||
            p.name.toLowerCase().includes(verifiedFilter.search.toLowerCase()) ||
            p.sector.toLowerCase().includes(verifiedFilter.search.toLowerCase()) ||
            p.location.toLowerCase().includes(verifiedFilter.search.toLowerCase());
          const matchPrice  = verifiedFilter.priceCategory === 'All' ||
            (verifiedFilter.priceCategory === 'Budget'  && p.price < luxuryThreshold) ||
            (verifiedFilter.priceCategory === 'Luxury'  && p.price >= luxuryThreshold);
          return matchType && matchStatus && matchSearch && matchPrice;
        });
        const types    = ['All', ...new Set(moodFilteredDB.map(p => p.type))];
        const statuses = ['All', 'Ready to Move', 'Under Construction'];
        return (
          <div className="vp-modal-bg" onClick={() => setShowVerifiedModal(false)}>
            <div className="vp-modal" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="vp-modal-header">
                <div>
                  <h2 className="vp-modal-title">✅ Verified Properties</h2>
                  <p className="vp-modal-sub">{filtered.length} properties found in Gurugram</p>
                </div>
                <button className="pick-modal-close" style={{position:'static'}} onClick={() => setShowVerifiedModal(false)}>✕</button>
              </div>

              {/* Filters */}
              <div className="vp-filters">
                <input
                  className="vp-search"
                  placeholder="🔍  Search by name, sector, location..."
                  value={verifiedFilter.search}
                  onChange={e => setVerifiedFilter(f => ({...f, search: e.target.value}))}
                />
                {/* Budget / Luxury Toggle */}
                <div className="vp-price-toggle">
                  {[
                    { key: 'All',     label: '🏠 All',           },
                    { key: 'Budget',  label: '💰 Budget (≤7 Cr)' },
                    { key: 'Luxury',  label: '👑 Luxury (>7 Cr)' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      className={`vp-price-btn ${verifiedFilter.priceCategory === key ? `active ${key.toLowerCase()}` : ''}`}
                      onClick={() => setVerifiedFilter(f => ({...f, priceCategory: key}))}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="vp-filter-row">
                  <div className="vp-filter-group">
                    {types.map(t => (
                      <button key={t}
                        className={`vp-filter-btn ${verifiedFilter.type === t ? 'active' : ''}`}
                        onClick={() => setVerifiedFilter(f => ({...f, type: t}))}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="vp-filter-group">
                    {statuses.map(s => (
                      <button key={s}
                        className={`vp-filter-btn ${verifiedFilter.status === s ? 'active' : ''}`}
                        onClick={() => setVerifiedFilter(f => ({...f, status: s}))}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Properties Grid */}
              <div className="vp-grid">
                {filtered.length === 0 ? (
                  <div className="vp-empty">No properties match your filters.</div>
                ) : filtered.map(p => (
                  <div key={p.id} className="vp-card">
                    <div className="vp-card-top">
                      <div className="vp-verified-badge">✅ Verified</div>
                      <span className={`vp-status ${p.status === 'Ready to Move' ? 'ready' : 'construction'}`}>
                        {p.status}
                      </span>
                    </div>
                    <h4 className="vp-name">{p.name}</h4>
                    <div className="vp-location">📍 {p.location}</div>
                    <div className="vp-details-row">
                      <span className="vp-type">{p.type}</span>
                      {p.bedrooms > 0 && <span className="vp-beds">{p.bedrooms} BHK</span>}
                      <span className="vp-area">{p.area}</span>
                    </div>
                    <div className="vp-price">{p.priceDisplay}</div>
                    <button className="vp-enquire" onClick={() => {
                      setShowVerifiedModal(false);
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Enquire Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Project Detail Modal */}
      {selectedPickProject && (
        <div className="pick-modal-bg" onClick={() => setSelectedPickProject(null)}>
          <div className="pick-modal" onClick={e => e.stopPropagation()}>
            <button className="pick-modal-close" onClick={() => setSelectedPickProject(null)}>✕</button>

            {/* Hero Image */}
            <div className="pick-modal-hero">
              <img src={selectedPickProject.image} alt={selectedPickProject.name} />
              <div className="pick-modal-hero-overlay">
                <span className={`pick-tag pick-tag-${selectedPickProject.tagColor}`}>{selectedPickProject.tag}</span>
                <span className={`pick-status ${selectedPickProject.status === 'Ready to Move' ? 'status-ready' : 'status-construction'}`}>{selectedPickProject.status}</span>
              </div>
            </div>

            <div className="pick-modal-body">
              {/* Header */}
              <div className="pick-modal-header">
                <div>
                  <div className="pick-developer">{selectedPickProject.developer}</div>
                  <h2 className="pick-modal-title">{selectedPickProject.name}</h2>
                  <div className="pick-location" style={{marginTop:'6px'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {selectedPickProject.location}
                  </div>
                </div>
                <div className="pick-modal-price-box">
                  <div className="pick-modal-price">{selectedPickProject.price}</div>
                  <div className="pick-modal-psf">{selectedPickProject.pricePerSqft}</div>
                </div>
              </div>

              {/* About */}
              <p className="pick-modal-about">{selectedPickProject.about}</p>

              {/* Quick Info Grid */}
              <div className="pick-modal-info-grid">
                {[
                  { label: 'Possession', value: selectedPickProject.possession },
                  { label: 'Total Units', value: selectedPickProject.totalUnits },
                  { label: 'Land Area', value: selectedPickProject.landArea },
                  { label: 'Towers / Floors', value: selectedPickProject.towers },
                ].map((item, i) => (
                  <div key={i} className="pick-modal-info-item">
                    <div className="pick-modal-info-label">{item.label}</div>
                    <div className="pick-modal-info-value">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Configurations */}
              <div className="pick-modal-section">
                <h4 className="pick-modal-section-title">🏠 Configurations & Pricing</h4>
                <div className="pick-modal-configs">
                  {selectedPickProject.configurations.map((c, i) => (
                    <div key={i} className="pick-config-row">
                      <span className="pick-config-name">{c.config}</span>
                      <span className="pick-config-size">{c.size}</span>
                      <span className="pick-config-price">{c.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="pick-modal-section">
                <h4 className="pick-modal-section-title">⭐ Key Highlights</h4>
                <div className="pick-modal-highlights">
                  {selectedPickProject.highlights.map((h, i) => (
                    <div key={i} className="pick-highlight-item">
                      <span className="pick-highlight-dot">✓</span> {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="pick-modal-section">
                <h4 className="pick-modal-section-title">🏊 Amenities</h4>
                <div className="pick-amenities" style={{marginTop:'10px'}}>
                  {selectedPickProject.amenities.map((a, i) => (
                    <span key={i} className="pick-amenity">{a}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pick-modal-cta-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <button className="pick-cta" style={{ flex: '1 1 auto', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  onClick={() => {
                    const prop = {
                      id: selectedPickProject.id || selectedPickProject.name,
                      name: selectedPickProject.name,
                      location: selectedPickProject.location,
                      price: selectedPickProject.price,
                      priceDisplay: selectedPickProject.price,
                    };
                    setSelectedPickProject(null);
                    setBookingProperty(prop);
                  }}>
                  🔐 Book Now
                </button>
                <button className="pick-cta" style={{ flex: '1 1 auto' }} onClick={() => {
                  setSelectedPickProject(null);
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  📞 Enquire Now
                </button>
                <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="pick-modal-wa">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking Modal ── */}
      <AnimatePresence>
        {bookingProperty && (
          <BookingModal
            property={bookingProperty}
            onClose={() => setBookingProperty(null)}
          />
        )}
      </AnimatePresence>

      {/* Compare Bar */}
      <CompareBar
        list={compareList}
        onRemove={id => setCompareList(prev => prev.filter(x => x.id !== id))}
        onClear={() => setCompareList([])}
      />

      {/* WhatsApp Float Button */}
      <a href="https://wa.me/919671009931" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="white">
          <path d="M14 2C7.373 2 2 7.373 2 14c0 2.625.748 5.074 2.05 7.15L2.5 25.5l4.5-.6C9.024 25.825 11.477 26.5 14 26.5c6.627 0 12-5.373 12-12S20.627 2 14 2zm0 22c-2.097 0-4.11-.549-5.875-1.588l-.42-.25-3.65.49.49-3.56-.24-.41C3.531 17.347 3 15.395 3 14c0-6.065 4.935-11 11-11s11 4.935 11 11-4.935 11-11 11zm6.04-8.227c-.33-.165-1.955-.965-2.26-1.075-.305-.11-.527-.165-.748.165-.22.33-.855 1.075-1.048 1.295-.192.22-.385.247-.715.082-.33-.165-1.395-.513-2.655-1.637-.984-.877-1.648-1.96-1.84-2.29-.192-.33-.02-.507.145-.67.15-.15.33-.385.495-.577.165-.192.22-.33.33-.547.11-.22.055-.413-.027-.578-.083-.165-.748-1.8-1.025-2.465-.27-.648-.545-.56-.748-.57-.192-.01-.413-.01-.635-.01-.22 0-.577.082-.88.413-.302.33-1.152 1.125-1.152 2.742 0 1.617 1.177 3.18 1.342 3.402.165.22 2.315 3.535 5.607 4.958 2.145.925 2.585.74 3.05.695.695-.068 1.955-.8 2.23-1.57.275-.773.275-1.435.192-1.57-.082-.137-.302-.22-.632-.385z"/>
        </svg>
      </a>

      <Footer />

      {/* Bottom Navigation — Mobile App Feel */}
      <BottomNav scrollToSection={scrollToSection} />
      <StickyAssistant />
      <LiveActivity />

      {/* Cinematic Property View */}
      <Suspense fallback={null}>
        {cinematicData && (
          <CinematicView
            property={cinematicData.property}
            imgSrc={cinematicData.imgSrc}
            onClose={() => setCinematicData(null)}
            onExplore={() => { setCinematicData(null); navigate(`/property/${cinematicData.property.id}`); }}
          />
        )}
      </Suspense>

      {/* AI Interior Preview Modal */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {interiorProp && (
            <InteriorPreviewModal
              property={interiorProp}
              onClose={() => setInteriorProp(null)}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Room Planner Modal */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {showRoomPlanner && (
            <RoomPlanner onClose={() => setShowRoomPlanner(false)} />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Find Your Home Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <HomeQuiz onClose={() => setShowQuiz(false)} navigate={navigate} properties={moodFilteredDB} />
        )}
      </AnimatePresence>

    </div>
    </IntelligenceContext.Provider>
  );
};

export default HomePage;
