import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './components/Logo';
import { 
  Home, 
  Search, 
  Calendar, 
  BookOpen, 
  User, 
  Plus, 
  MapPin, 
  Star, 
  CheckCircle2, 
  MessageCircle,
  Award, 
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Filter,
  Languages,
  ArrowRight,
  Clock,
  Euro,
  Share2,
  Heart,
  Bell,
  Lock,
  CreditCard,
  Gift,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ShoppingBag,
  Tag,
  Camera,
  Loader2,
  X,
  Mail,
  Phone,
  Rocket,
  FileText,
  Users,
  HeartPulse,
  Briefcase,
  Lightbulb,
  Sparkles,
  Trophy,
  Palmtree,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Send,
  Car,
  Smartphone,
  Shirt,
  Gamepad,
  Coffee,
  Building2,
  Fuel,
  Umbrella,
  Monitor,
  Armchair,
  Bike
} from 'lucide-react';
import { storageService } from './lib/storage';
import { marketplaceService, Ad } from './services/marketplaceService';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatRelativeTime(dateString: string | undefined) {
  if (!dateString) return '';
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) return 'just now';
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  } catch (e) {
    return '';
  }
}

// --- Types ---

type View = 'home' | 'explore' | 'events' | 'guides' | 'profile' | 'community' | 'marketplace' | 'community-thread' | 'messages';

interface Professional {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  languages: string[];
  image: string;
  verified: boolean;
  services: { name: string; price: number; description: string }[];
  bio: string;
  testimonials: { author: string; avatar: string; text: string; rating: number; date: string }[];
  phone?: string;
  email?: string;
  experience?: string;
  location?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  attendees: number;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  pros: string[]; // Professional IDs
}

interface Classified {
  id: string;
  title: string;
  price: string;
  category: string;
  image: string;
  condition?: string;
  location?: string;
}

// --- Mock Data ---

const MOCK_PROS: Professional[] = [
  {
    id: '1',
    name: 'Carlos Rodriguez',
    category: 'Plumber',
    rating: 4.9,
    reviews: 124,
    languages: ['Spanish', 'English'],
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
    verified: true,
    bio: 'Certified plumber with 15 years of experience in both residential and industrial installations. Specialized in modern water systems and emergency leak control. Known for punctuality and clean work.',
    phone: '+34 612 345 678',
    email: 'carlos.plumbing@example.com',
    experience: '15 years',
    location: 'Ruzafa, Valencia',
    services: [
      { name: 'Emergency Leak Repair', price: 60, description: 'Fast response for urgent leaks.' },
      { name: 'Installation', price: 120, description: 'New faucet or toilet installation.' }
    ],
    testimonials: [
      { author: 'Thomas', avatar: 'https://i.pravatar.cc/150?u=thomas', text: 'Carlos saved my kitchen! Very professional and explained everything clearly.', rating: 5, date: '2 weeks ago' },
      { author: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah', text: 'Fast and clean work. Best plumber I found in Valencia so far.', rating: 4, date: '1 month ago' }
    ]
  },
  {
    id: '2',
    name: 'Elena Martinez',
    category: 'Lawyer',
    rating: 5.0,
    reviews: 89,
    languages: ['Spanish', 'English', 'French'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    verified: true,
    bio: 'Specializing in immigration law and relocation services. I have helped over 500 expats obtain their NIE and TIE. My goal is to make your transition to Spain as smooth as possible through clear legal guidance.',
    phone: '+34 698 765 432',
    email: 'elena.law@example.com',
    experience: '8 years',
    location: 'Ciutat Vella, Valencia',
    services: [
      { name: 'NIE Application', price: 150, description: 'Full assistance with NIE paperwork.' },
      { name: 'Rental Contract Review', price: 80, description: 'Legal review of your lease.' }
    ],
    testimonials: [
      { author: 'Marie', avatar: 'https://i.pravatar.cc/150?u=marie', text: 'Elena made my residency process stress-free. Highly recommended for any expat!', rating: 5, date: '3 days ago' }
    ]
  },
  {
    id: '3',
    name: 'David Wilson',
    category: 'Translator',
    rating: 4.8,
    reviews: 56,
    languages: ['English', 'Spanish', 'German'],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
    verified: true,
    bio: 'Professional sworn translator for English and German. Fast turnaround for official documents, business proposals, and website localization. Member of the Valencia Translators Association.',
    phone: '+34 654 321 098',
    email: 'david.trans@example.com',
    experience: '10 years',
    location: 'Benimaclet, Valencia',
    services: [
      { name: 'Official Translation', price: 40, description: 'Per page official document translation.' }
    ],
    testimonials: [
      { author: 'Lukas', avatar: 'https://i.pravatar.cc/150?u=lukas', text: 'Perfect translations, accepted by all official offices without issue.', rating: 5, date: '2 months ago' }
    ]
  },
  {
    id: '4',
    name: 'Sophie Dubois',
    category: 'Real Estate',
    rating: 4.7,
    reviews: 42,
    languages: ['French', 'English', 'Spanish'],
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
    verified: true,
    bio: 'Dedicated real estate agent focusing on the expat market. I find the best apartments before they even hit the main websites. I also provide full relocation support including school hunting for families.',
    phone: '+34 677 888 999',
    email: 'sophie.realty@example.com',
    experience: '6 years',
    location: 'El Carmen, Valencia',
    services: [
      { name: 'Apartment Hunting', price: 200, description: 'Personalized search for your next home.' },
      { name: 'Relocation Package', price: 500, description: 'Full support for moving to Valencia.' }
    ],
    testimonials: [
      { author: 'Julie', avatar: 'https://i.pravatar.cc/150?u=julie', text: 'Sophie found us the perfect flat in El Carmen in less than a week!', rating: 5, date: '1 week ago' }
    ]
  },
  {
    id: '5',
    name: 'Marco Rossi',
    category: 'Handyman',
    rating: 4.9,
    reviews: 78,
    languages: ['Italian', 'Spanish', 'English'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    verified: true,
    bio: 'Professional handyman with a passion for fixing things. I can help with anything from furniture assembly to general home maintenance. Reliable, efficient, and always with a smile.',
    services: [
      { name: 'Furniture Assembly', price: 50, description: 'Quick assembly of IKEA or other furniture.' },
      { name: 'General Maintenance', price: 40, description: 'Fixing small things around the house.' }
    ],
    testimonials: [
      { author: 'Luca', avatar: 'https://i.pravatar.cc/150?u=luca', text: 'Marco is a wizard! Fixed my door and my sink in no time.', rating: 5, date: '4 days ago' }
    ]
  },
  {
    id: '6',
    name: 'Anna Schmidt',
    category: 'Lawyer',
    rating: 4.9,
    reviews: 34,
    languages: ['German', 'English', 'Spanish'],
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0ad2f01?auto=format&fit=crop&q=80&w=200&h=200',
    verified: true,
    bio: 'Tax consultant with extensive knowledge of the Spanish legal system. I specialize in helping digital nomads and expats optimize their taxes and set up their businesses in Valencia.',
    services: [
      { name: 'Tax Advice', price: 120, description: 'Expert advice for expats and digital nomads.' },
      { name: 'Business Setup', price: 300, description: 'Help with starting your company in Spain.' }
    ],
    testimonials: [
      { author: 'Emma', avatar: 'https://i.pravatar.cc/150?u=emma', text: 'Anna explained the Spanish tax system so clearly. A life-saver!', rating: 5, date: '1 week ago' }
    ]
  }
];

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'International Networking Valencia',
    date: 'Mar 15',
    time: '19:00',
    location: 'Ruzafa Hub',
    category: 'Networking',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400&h=200',
    attendees: 45
  },
  {
    id: '2',
    title: 'Paella Cooking Class',
    date: 'Mar 18',
    time: '11:00',
    location: 'Central Market',
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1534080564607-317f53f89998?auto=format&fit=crop&q=80&w=400&h=200',
    attendees: 12
  }
];

interface GuideArticle {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  tag?: string;
}

interface GuideCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  articles: GuideArticle[];
}

// --- Custom Multi-color Icons for Guides ---

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#EF4444" stroke="#EF4444" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#FBBF24" stroke="#F59E0B" />
    <circle cx="15" cy="9" r="1" fill="white" />
  </svg>
);

const PaperworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M4 4h16v16H4z" fill="#3B82F6" stroke="#2563EB" />
    <path d="M8 8h8" stroke="white" />
    <path d="M8 12h8" stroke="white" />
    <path d="M8 16h5" stroke="white" />
    <path d="M18 4v4h-4" fill="#60A5FA" stroke="#2563EB" />
  </svg>
);

const FamilyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <circle cx="9" cy="7" r="4" fill="#EC4899" stroke="#DB2777" />
    <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" fill="#EC4899" stroke="#DB2777" />
    <circle cx="17" cy="8" r="3" fill="#8B5CF6" stroke="#7C3AED" />
    <path d="M13 21v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" fill="#8B5CF6" stroke="#7C3AED" />
  </svg>
);

const HealthIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#F472B6" stroke="#E11D48" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" stroke="#E11D48" strokeWidth="1.5" />
  </svg>
);

const WorkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" fill="#6366F1" stroke="#4F46E5" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="#F59E0B" />
    <path d="M2 12h20" stroke="#4F46E5" />
    <circle cx="12" cy="14" r="1" fill="#FBBF24" />
  </svg>
);

const TipsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M9 18h6" stroke="#F59E0B" />
    <path d="M10 22h4" stroke="#F59E0B" />
    <path d="M15.09 14c.18-.98.37-1.74.37-2.5a3.5 3.5 0 0 0-7 0c0 .76.19 1.52.37 2.5H15.09Z" fill="#FDE047" stroke="#F59E0B" />
    <path d="M12 2v1" stroke="#F59E0B" />
    <path d="M5 5l1 1" stroke="#F59E0B" />
    <path d="M2 12h1" stroke="#F59E0B" />
    <path d="M19 5l-1 1" stroke="#F59E0B" />
    <path d="M22 12h-1" stroke="#F59E0B" />
  </svg>
);

const CityFunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M6 3h12l-6 9Z" fill="#F97316" stroke="#EA580C" />
    <path d="M12 12v8" stroke="#94A3B8" />
    <path d="M9 21h6" stroke="#94A3B8" />
    <circle cx="18" cy="5" r="3" fill="#FBBF24" stroke="#F59E0B" />
    <path d="M18 13v6" stroke="#EC4899" />
    <circle cx="16" cy="19" r="2" fill="#EC4899" stroke="#DB2777" />
    <path d="M18 13l3-1" stroke="#EC4899" />
  </svg>
);

const MOCK_GUIDE_CATEGORIES: GuideCategory[] = [
  { 
    id: 'getting-started', 
    title: 'Getting Started', 
    description: 'First steps for your arrival in Valencia.', 
    icon: RocketIcon,
    color: 'bg-orange-500',
    articles: [
      { id: 'gs-1', title: 'Top 10 Neighborhoods for Expats', excerpt: 'From the trendy Ruzafa to the family-friendly El Carmen.', readTime: '5 min', tag: 'Housing' },
      { id: 'gs-2', title: 'Arrival Checklist: First 48 Hours', excerpt: 'SIM cards, transport cards, and essential apps.', readTime: '3 min', tag: 'Essentials' },
      { id: 'gs-3', title: 'How to use the Metro & Valenbisi', excerpt: 'Navigating the city like a local.', readTime: '4 min', tag: 'Transport' }
    ]
  },
  { 
    id: 'paperwork', 
    title: 'Paperwork Survival', 
    description: 'NIE, Empadronamiento, and legal essentials.', 
    icon: PaperworkIcon,
    color: 'bg-blue-500',
    articles: [
      { id: 'pw-1', title: 'The Ultimate NIE Guide 2024', excerpt: 'How to get your appointment without losing your mind.', readTime: '8 min', tag: 'Legal' },
      { id: 'pw-2', title: 'Empadronamiento Explained', excerpt: 'Why you need it and how to register at the Ayuntamiento.', readTime: '4 min', tag: 'Legal' },
      { id: 'pw-3', title: 'Digital Certificate: Your Best Friend', excerpt: 'How to do all your paperwork online from home.', readTime: '6 min', tag: 'Tech' }
    ]
  },
  { 
    id: 'family', 
    title: 'Family Life', 
    description: 'Schools, activities, and family services.', 
    icon: FamilyIcon,
    color: 'bg-pink-500',
    articles: [
      { id: 'fm-1', title: 'Public vs. Concertado vs. Private Schools', excerpt: 'Understanding the Spanish education system.', readTime: '10 min', tag: 'Education' },
      { id: 'fm-2', title: 'Best Parks & Playgrounds in Valencia', excerpt: 'Where to take the kids on a sunny afternoon.', readTime: '5 min', tag: 'Leisure' },
      { id: 'fm-3', title: 'Finding a Reliable Nanny or Babysitter', excerpt: 'Trusted services and community recommendations.', readTime: '4 min', tag: 'Services' }
    ]
  },
  { 
    id: 'health', 
    title: 'Stay Healthy', 
    description: 'Doctors, hospitals, and wellness tips.', 
    icon: HealthIcon,
    color: 'bg-emerald-500',
    articles: [
      { id: 'hl-1', title: 'How to Register for Public Healthcare', excerpt: 'Getting your SIP card as an expat.', readTime: '5 min', tag: 'Health' },
      { id: 'hl-2', title: 'Best English-Speaking Doctors', excerpt: 'A curated list of trusted medical professionals.', readTime: '3 min', tag: 'Directory' },
      { id: 'hl-3', title: 'Pharmacies in Valencia: What to Know', excerpt: 'Opening hours, prescriptions, and over-the-counter meds.', readTime: '3 min', tag: 'Essentials' }
    ]
  },
  { 
    id: 'work', 
    title: 'Work Stuff', 
    description: 'Job search, co-working, and business.', 
    icon: WorkIcon,
    color: 'bg-indigo-500',
    articles: [
      { id: 'wk-1', title: 'Becoming Autonomo in Spain', excerpt: 'A step-by-step guide for freelancers.', readTime: '12 min', tag: 'Business' },
      { id: 'wk-2', title: 'Top Co-working Spaces in Valencia', excerpt: 'Where to find the best community and coffee.', readTime: '5 min', tag: 'Remote Work' },
      { id: 'wk-3', title: 'The Digital Nomad Visa Guide', excerpt: 'Requirements and application process.', readTime: '9 min', tag: 'Legal' }
    ]
  },
  { 
    id: 'daily-tips', 
    title: 'Daily Life Tips', 
    description: 'Transport, shopping, and local habits.', 
    icon: TipsIcon,
    color: 'bg-amber-500',
    articles: [
      { id: 'dt-1', title: 'Supermarket Comparison', excerpt: 'Mercadona vs. Consum vs. Lidl: Where to shop.', readTime: '6 min', tag: 'Shopping' },
      { id: 'dt-2', title: 'Understanding the Siesta Culture', excerpt: 'When things open, close, and when to eat.', readTime: '4 min', tag: 'Habits' },
      { id: 'dt-3', title: 'Learning Spanish in Valencia', excerpt: 'Best schools and language exchange meetups.', readTime: '5 min', tag: 'Language' }
    ]
  },
  { 
    id: 'city-fun', 
    title: 'City Fun', 
    description: 'Best spots, events, and leisure.', 
    icon: CityFunIcon,
    color: 'bg-cyan-500',
    articles: [
      { id: 'cf-1', title: 'The Ultimate Fallas Guide', excerpt: 'How to survive and enjoy the biggest festival.', readTime: '7 min', tag: 'Events' },
      { id: 'cf-2', title: 'Hidden Gems: Secret Spots in the Turia', excerpt: 'Escape the crowds in the city\'s green lung.', readTime: '5 min', tag: 'Nature' },
      { id: 'cf-3', title: 'Best Tapas Bars in the Old Town', excerpt: 'Authentic flavors away from the tourist traps.', readTime: '6 min', tag: 'Food' }
    ]
  }
];

const MOCK_GUIDE: GuideStep[] = [
  { id: '1', title: 'Get your NIE', description: 'The essential ID number for living in Spain.', pros: ['2'] },
  { id: '2', title: 'Open a Bank Account', description: 'Necessary for utilities and rent.', pros: ['2'] },
  { id: '3', title: 'Empadronamiento', description: 'Registering at the town hall.', pros: [] },
  { id: '4', title: 'Health Insurance', description: 'Private or public health coverage.', pros: ['2'] }
];

const MOCK_FEED = [
  {
    id: '1',
    user: 'Sarah J.',
    content: 'Just used Elena Martinez for my NIE. She was amazing! Highly recommend if you are struggling with the appointments.',
    proId: '2',
    likes: 12,
    comments: 3,
    time: '2h ago'
  },
  {
    id: '2',
    user: 'Marc L.',
    content: 'Does anyone know a good gym in Ruzafa that is international friendly?',
    likes: 5,
    comments: 8,
    time: '5h ago'
  },
  {
    id: '3',
    user: 'Julian R.',
    content: 'The new bakery on Calle de la Paz is incredible. Best croissants in Valencia!',
    likes: 24,
    comments: 5,
    time: '1h ago'
  },
  {
    id: '4',
    user: 'Emma W.',
    content: 'Looking for a Spanish tutor for intensive classes. Any recommendations?',
    likes: 8,
    comments: 12,
    time: '3h ago'
  },
  {
    id: '5',
    user: 'Thomas B.',
    content: 'Valencia is so beautiful in the spring. Love the Turia park right now!',
    likes: 45,
    comments: 2,
    time: '30m ago'
  }
];

const MOCK_CLASSIFIEDS: Classified[] = [
  { 
    id: '1', 
    title: 'Vintage Bicycle', 
    price: '€80', 
    category: 'For Sale', 
    condition: 'Good',
    location: 'Ruzafa',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=200&h=200' 
  },
  { 
    id: '2', 
    title: 'Room in Ruzafa', 
    price: '€450/mo', 
    category: 'Housing', 
    condition: 'N/A',
    location: 'Ruzafa',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200&h=200' 
  },
  { 
    id: '3', 
    title: 'Office Chair', 
    price: '€15', 
    category: 'For Sale', 
    condition: 'Like New',
    location: 'El Carmen',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=200&h=200' 
  },
  { 
    id: '4', 
    title: 'Yoga Classes', 
    price: '€10/h', 
    category: 'Services', 
    condition: 'N/A',
    location: 'Turia Park',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200&h=200' 
  },
];

// --- Components ---

export default function App() {
  const [isStarting, setIsStarting] = useState(true);
  const [activeView, setActiveView] = useState<View>('home');
  const [searchParams, setSearchParams] = useState<{ query: string; location: string; category: string; filters?: any }>({ query: '', location: '', category: 'All' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStarting(false);
    }, 8500);
    return () => clearTimeout(timer);
  }, []);

  const [showAddPro, setShowAddPro] = useState(false);
  const [showAddAd, setShowAddAd] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | any>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [city, setCity] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const getNearestMajorCity = async (city: string, region: string, country: string) => {
    try {
      if (!city) return 'Valencia';
      
      const cacheKey = `city_norm_${city}_${region}_${country}`.toLowerCase().replace(/\s+/g, '_');
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const locationContext = `${city}, ${region}, ${country}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Target: Identify the nearest major metropolitan city for "${locationContext}". 
        Rules: 
        1. Return ONLY the name of the major city.
        2. No punctuation, no sentences.
        3. If the location is already a major city, return its name.
        4. Example: "La Eliana, Valencian Community, Spain" -> "Valencia".`,
      });
      
      const result = response.text?.trim();
      if (result) {
        localStorage.setItem(cacheKey, result);
        return result;
      }
      return city;
    } catch (error) {
      console.error('Error normalizing city:', error);
      return city || 'Valencia';
    }
  };

  const refreshLocation = () => {
    if (!("geolocation" in navigator)) {
      setCity('Valencia');
      return;
    }

    setIsLocating(true);
    const geoOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          
          const rawCity = data.city || data.locality || '';
          const region = data.principalSubdivision || '';
          const country = data.countryName || '';
          
          const majorCity = await getNearestMajorCity(rawCity, region, country);
          setCity(majorCity);
        } catch (error) {
          console.error('Error fetching city:', error);
          setCity('Valencia');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setCity('Valencia');
        setIsLocating(false);
      },
      geoOptions
    );
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  // Form states for Pro
  const [proName, setProName] = useState('');
  const [proCategory, setProCategory] = useState('');
  const [proEmail, setProEmail] = useState('');
  const [proPhone, setProPhone] = useState('');
  const [proRecommendation, setProRecommendation] = useState('');

  // Form states for Ad
  const [adTitle, setAdTitle] = useState('');
  const [adPrice, setAdPrice] = useState('');
  const [adCategory, setAdCategory] = useState('Vehicles');
  const [adCondition, setAdCondition] = useState('Good');
  const [adLocation, setAdLocation] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adHousingType, setAdHousingType] = useState<'Rent' | 'Sale'>('Rent');
  const [adFuelType, setAdFuelType] = useState('Petrol');
  const [adPropertyType, setAdPropertyType] = useState('Apartment');
  const [adContractType, setAdContractType] = useState('Full-time');
  const [adSize, setAdSize] = useState('M');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const data = await marketplaceService.getAds();
      setAds(data);
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const handlePostPro = () => {
    if (!proName || !proCategory) return;
    
    // In a real app, we would send this to a service
    console.log('Posting pro:', { proName, proCategory, proEmail, proPhone, proRecommendation });
    
    // Reset form
    setProName('');
    setProCategory('');
    setProEmail('');
    setProPhone('');
    setProRecommendation('');
    setShowAddPro(false);
    
    alert('Thank you for your recommendation! Our team will review it.');
  };

  const handlePostAd = async () => {
    const isPriceRequired = adCategory !== 'Jobs' && adCategory !== 'Services';
    if (!adTitle || (isPriceRequired && !adPrice)) return;
    
    setIsUploading(true);
    try {
      await marketplaceService.createAd({
        title: adTitle,
        price: adPrice,
        category: adCategory,
        condition: adCondition,
        location: adLocation,
        description: adDescription,
        type: adCategory === 'Real Estate' ? adHousingType : undefined,
        fuel_type: adCategory === 'Vehicles' ? adFuelType : undefined,
        property_type: adCategory === 'Real Estate' ? adPropertyType : undefined,
        contract_type: adCategory === 'Jobs' ? adContractType : undefined,
        size: adCategory === 'Clothing' ? adSize : undefined,
        image_url: uploadedImageUrls[0] || '',
        images: uploadedImageUrls
      });
      
      // Reset form
      setAdTitle('');
      setAdPrice('');
      setAdCategory('Vehicles');
      setAdCondition('Good');
      setAdLocation('');
      setAdDescription('');
      setAdHousingType('Rent');
      setAdFuelType('Petrol');
      setAdPropertyType('Apartment');
      setAdContractType('Full-time');
      setAdSize('M');
      setUploadedImageUrls([]);
      setShowAddAd(false);
      
      // Refresh list
      fetchAds();
    } catch (error) {
      console.error('Error posting ad:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remainingSlots = 3 - uploadedImageUrls.length;
    if (remainingSlots <= 0) {
      alert('Maximum 3 photos allowed');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Sanitize filename
        const sanitizedName = file.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9.]/g, '_')
          .replace(/_{2,}/g, '_');

        const fileName = `${Date.now()}-${sanitizedName}`;
        const path = `ads/${fileName}`;
        return await storageService.uploadFile('images', path, file);
      });

      const newUrls = await Promise.all(uploadPromises);
      setUploadedImageUrls(prev => [...prev, ...newUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload one or more images.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Bottom Nav Items
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Find Pro', icon: Search },
    { id: 'marketplace', label: 'Market', icon: ShoppingBag },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'guides', label: 'Guides', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const [direction, setDirection] = useState(0);

  const mainNavIds = navItems.map(item => item.id);

  const handleSearch = (query: string, location: string, category: string, filters?: any) => {
    setSearchParams({ query, location, category, filters });
    // No longer navigating to searchResults view, MarketplaceView will handle it internally
  };

  const navigateTo = (view: View) => {
    const currentIndex = mainNavIds.indexOf(activeView);
    const newIndex = mainNavIds.indexOf(view);

    if (currentIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > currentIndex ? 1 : -1);
    } else if (view === 'messages' || view === 'community-thread' || view === 'community') {
      setDirection(1); // Forward to sub-view
    } else if (activeView === 'messages' || activeView === 'community-thread' || activeView === 'community') {
      setDirection(-1); // Back from sub-view
    } else {
      setDirection(0);
    }
    setActiveView(view);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    // Special cases for sub-views
    if (activeView === 'messages' && direction === 'right') {
      navigateTo('explore');
      return;
    }
    if (activeView === 'community-thread' && direction === 'right') {
      navigateTo('community');
      return;
    }

    const currentIndex = mainNavIds.indexOf(activeView);
    if (currentIndex === -1) return;

    if (direction === 'left' && currentIndex < mainNavIds.length - 1) {
      navigateTo(mainNavIds[currentIndex + 1] as View);
    } else if (direction === 'right' && currentIndex > 0) {
      navigateTo(mainNavIds[currentIndex - 1] as View);
    }
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-white w-full mx-auto shadow-2xl overflow-hidden relative">
      <AnimatePresence>
        {isStarting && <SplashScreen />}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-100 flex-shrink-0 z-30">
        <div 
          onClick={() => navigateTo('home')}
          className="hover:opacity-80 transition-opacity cursor-pointer flex items-center"
        >
          <Logo className="items-start" />
        </div>
        <motion.button 
          onClick={() => setShowAddPro(true)}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="bg-brand-yellow text-white px-4 py-2 rounded-full shadow-lg shadow-brand-yellow/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Add a Pro</span>
        </motion.button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative pb-24">
        <motion.div
          className="min-h-full w-full"
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeView}
              custom={direction}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.5 }}
              className="min-h-full w-full"
            >
              {activeView === 'home' && (
                <HomeView 
                  key="home" 
                  onNavigate={navigateTo} 
                  onAddPro={() => setShowAddPro(true)} 
                  ads={ads} 
                  onSelectAd={setSelectedAd} 
                  onSelectPost={(post) => { setSelectedPost(post); navigateTo('community-thread'); }}
                />
              )}
              {activeView === 'explore' && (
                <ExploreView onNavigate={navigateTo} />
              )}
              {activeView === 'events' && <EventsView key="events" />}
              {activeView === 'guides' && <GuidesView key="guides" />}
              {activeView === 'profile' && (
                <ProfileView 
                  key="profile" 
                />
              )}
              {activeView === 'marketplace' && (
                <MarketplaceView 
                  key="marketplace" 
                  onAddAd={() => setShowAddAd(true)} 
                  ads={ads} 
                  onSelectAd={setSelectedAd} 
                />
              )}
              {activeView === 'messages' && (
                <MessagesView key="messages" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Modals contained in this area */}
        <AnimatePresence>
          {showAddPro && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] overflow-y-auto overscroll-contain"
              onClick={() => setShowAddPro(false)}
            >
              <div className="min-h-full flex items-start justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden relative shadow-2xl flex flex-col my-auto"
                  onClick={e => e.stopPropagation()}
                >
                {/* Modal Header */}
                <div className="bg-gradient-to-br from-brand-blue/10 to-brand-yellow/10 px-8 pt-12 pb-6 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-blue/5 rounded-full blur-3xl" />
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-blue/5 rounded-full blur-3xl" />
                  
                  <h2 className="text-2xl font-bold font-display text-brand-navy relative z-10">
                    Recommend a Pro
                  </h2>
                  
                  <button 
                    onClick={() => setShowAddPro(false)}
                    className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 pt-6 space-y-6">
                  <div className="space-y-5">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Professional Details</p>
                      
                      <div className="space-y-3">
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                            <User className="w-full h-full" />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Full Name" 
                            value={proName}
                            onChange={(e) => setProName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand-blue/30 focus:bg-white focus:ring-4 focus:ring-brand-blue/5 outline-none text-sm font-semibold transition-all" 
                          />
                        </div>
                        
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                            <Briefcase className="w-full h-full" />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Category (e.g. Plumber, Lawyer...)" 
                            value={proCategory}
                            onChange={(e) => setProCategory(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand-blue/30 focus:bg-white focus:ring-4 focus:ring-brand-blue/5 outline-none text-sm font-semibold transition-all" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Info Section */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Contact Information (One required)</p>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                            <Mail className="w-full h-full" />
                          </div>
                          <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={proEmail}
                            onChange={(e) => setProEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand-blue/30 focus:bg-white focus:ring-4 focus:ring-brand-blue/5 outline-none text-sm font-semibold transition-all" 
                          />
                        </div>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                            <Phone className="w-full h-full" />
                          </div>
                          <input 
                            type="tel" 
                            placeholder="Phone Number" 
                            value={proPhone}
                            onChange={(e) => setProPhone(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand-blue/30 focus:bg-white focus:ring-4 focus:ring-brand-blue/5 outline-none text-sm font-semibold transition-all" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Section */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Your Recommendation</p>
                      <div className="relative group">
                        <textarea 
                          placeholder="Why do you recommend them? What services did they provide?" 
                          value={proRecommendation}
                          onChange={(e) => setProRecommendation(e.target.value)}
                          className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 focus:border-brand-blue/30 focus:bg-white focus:ring-4 focus:ring-brand-blue/5 outline-none h-36 text-sm font-medium resize-none transition-all leading-relaxed" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 pb-2">
                    <button 
                      className="w-full py-4 bg-brand-blue text-white text-sm font-bold rounded-2xl shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2" 
                      onClick={handlePostPro}
                      disabled={!proName || !proCategory || (!proEmail.trim() && !proPhone.trim())}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Post Recommendation
                    </button>
                    <button 
                      onClick={() => setShowAddPro(false)}
                      className="w-full py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                    <Shield className="w-3 h-3" />
                    Your recommendation will be reviewed by our team
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        <AnimatePresence>
          {showAddAd && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] overflow-y-auto overscroll-contain touch-pan-y"
              onClick={() => setShowAddAd(false)}
            >
              <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white w-full max-w-lg rounded-[32px] p-6 sm:p-8 space-y-6 relative shadow-2xl my-auto"
                  onClick={e => e.stopPropagation()}
                >
                <button 
                  onClick={() => setShowAddAd(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display text-brand-navy">Post a New Ad</h2>
                    <span className="text-xs font-medium text-slate-400">{uploadedImageUrls.length}/3 photos</span>
                  </div>
                  <p className="text-slate-500 text-sm">Share what you're selling or looking for.</p>
                </div>
                <div className="space-y-6">
                  {/* Photo Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Photos</label>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {uploadedImageUrls.length}/3
                      </span>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      multiple
                      onChange={handleImageUpload}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedImageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                          <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setUploadedImageUrls(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 backdrop-blur text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {uploadedImageUrls.length < 3 && (
                        <button 
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                          disabled={isUploading}
                          className={cn(
                            "aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1.5 cursor-pointer hover:bg-slate-100 hover:border-brand-blue/20 hover:text-brand-blue transition-all active:scale-95",
                            isUploading && "opacity-50 cursor-wait"
                          )}
                        >
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                          ) : (
                            <>
                              <Camera className="w-6 h-6" />
                              <span className="text-[10px] font-bold">Add Photo</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basic Information</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="What are you listing?" 
                          value={adTitle}
                          onChange={(e) => setAdTitle(e.target.value)}
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder={adCategory === 'Jobs' || adCategory === 'Services' ? "Price (Optional)" : "Price"} 
                            value={adPrice}
                            onChange={(e) => setAdPrice(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium" 
                          />
                        </div>
                        <div className="relative">
                          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select 
                            value={adCategory}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdCategory(val);
                              if (val === 'Jobs' || val === 'Services') {
                                setAdCondition('N/A');
                              } else if (val === 'Real Estate') {
                                setAdCondition('N/A');
                              } else {
                                setAdCondition('Good');
                              }
                            }}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium appearance-none"
                          >
                            <option value="Vehicles">Vehicles</option>
                            <option value="Real Estate">Real Estate</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Home">Home</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Leisure">Leisure</option>
                            <option value="Services">Services</option>
                            <option value="Jobs">Jobs</option>
                          </select>
                        </div>
                      </div>

                      {adCategory === 'Real Estate' && (
                        <div className="space-y-3">
                          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                            {(['Rent', 'Sale'] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => setAdHousingType(type)}
                                className={cn(
                                  "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                                  adHousingType === type 
                                    ? "bg-white text-brand-blue shadow-sm" 
                                    : "text-slate-400 hover:text-slate-600"
                                )}
                              >
                                For {type}
                              </button>
                            ))}
                          </div>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select 
                              value={adPropertyType}
                              onChange={(e) => setAdPropertyType(e.target.value)}
                              className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium appearance-none"
                            >
                              <option value="Apartment">Apartment</option>
                              <option value="House">House</option>
                              <option value="Studio">Studio</option>
                              <option value="Office">Office</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {adCategory === 'Vehicles' && (
                        <div className="relative">
                          <Fuel className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select 
                            value={adFuelType}
                            onChange={(e) => setAdFuelType(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium appearance-none"
                          >
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>
                        </div>
                      )}

                      {adCategory === 'Jobs' && (
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select 
                            value={adContractType}
                            onChange={(e) => setAdContractType(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium appearance-none"
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                      )}

                      {adCategory === 'Clothing' && (
                        <div className="relative">
                          <Shirt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select 
                            value={adSize}
                            onChange={(e) => setAdSize(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium appearance-none"
                          >
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</label>
                    <div className={cn(
                      "grid gap-3",
                      (adCategory === 'Jobs' || adCategory === 'Services') ? "grid-cols-1" : "grid-cols-2"
                    )}>
                      {(adCategory !== 'Jobs' && adCategory !== 'Services') && (
                        <div className="relative">
                          <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select 
                            value={adCondition}
                            onChange={(e) => setAdCondition(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium appearance-none"
                          >
                            <option value="New">New</option>
                            <option value="Like New">Like New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                      )}
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Location" 
                          value={adLocation}
                          onChange={(e) => setAdLocation(e.target.value)}
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      placeholder="Tell us more about it..." 
                      value={adDescription}
                      onChange={(e) => setAdDescription(e.target.value)}
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none h-32 text-sm font-medium resize-none" 
                    />
                  </div>

                  <button 
                    className="w-full btn-primary py-4 text-lg font-bold rounded-2xl shadow-xl shadow-brand-blue/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none" 
                    onClick={handlePostAd}
                    disabled={isUploading || !adTitle || !adPrice}
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Posting...</span>
                      </div>
                    ) : (
                      'Post Listing'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        <AnimatePresence>
          {selectedAd && (
            <AdDetailModal 
              key="ad-detail-modal"
              ad={selectedAd} 
              onClose={() => setSelectedAd(null)} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 safe-area-bottom z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-2 py-2 max-w-xl mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id as View)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 active:scale-95 min-w-0",
                (activeView === item.id) ? "text-brand-blue" : "text-slate-400"
              )}
            >
              <item.icon className={cn(
                "w-8 h-8 transition-all", 
                (activeView === item.id) ? "stroke-[2.5px] text-brand-blue" : "stroke-[1.5px] text-slate-400"
              )} />
              <span className={cn(
                "text-[11px] font-bold text-center truncate w-full px-1 transition-all",
                (activeView === item.id) ? "text-brand-blue" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// --- Components ---

function ReviewModal({ pro, onClose, onSubmit }: { pro: any, onClose: () => void, onSubmit: (review: any) => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto no-scrollbar" onClick={onClose}>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl -z-10" />
      <div className="min-h-full flex items-center justify-center p-4 py-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Leave a Review</h2>
            <p className="text-sm text-slate-500">How was your experience with {pro.name}?</p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90"
              >
                <Star 
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoveredRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"
                  )} 
                />
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Feedback</label>
            <textarea 
              placeholder="Write your review here..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue outline-none h-32 text-sm font-medium resize-none" 
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={!rating || !comment.trim()}
              onClick={() => onSubmit({ rating, comment })}
              className="flex-1 py-4 bg-brand-blue text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-blue/20 active:scale-95 transition-all disabled:opacity-50"
            >
              Submit Review
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);
}

function AdDetailModal({ ad, onClose }: { ad: Ad | any, onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const price = ad.price.includes('€') ? ad.price : `${ad.price}€`;
  const images = ad.images && ad.images.length > 0 ? ad.images : [ad.image_url || ad.image];
  const createdAt = 'created_at' in ad ? ad.created_at : new Date().toISOString();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [ad.id]);

  const nextImage = (e?: any) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: any) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const onDragEnd = (event: any, info: any) => {
    if (images.length <= 1) return;
    const swipeThreshold = 50;
    const velocityThreshold = 500;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      nextImage();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      prevImage();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain touch-pan-y"
    >
      <div 
        className="min-h-full flex items-start justify-center p-4 py-12"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md -z-10"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col my-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={onClose}
              className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-900 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div 
              className="h-56 sm:h-80 overflow-hidden relative group cursor-zoom-in touch-pan-y no-swipe"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, x: direction * 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 100 }}
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                drag={images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                onClick={() => setIsFullScreen(true)}
              >
                <img 
                  src={images[currentImageIndex]} 
                  alt={ad.title} 
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </motion.div>
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_: any, i: number) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          i === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-1">
                    {ad.category}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 font-display">{ad.title}</h3>
                </div>
                <div className="text-2xl font-black text-brand-blue">
                  {price}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {ad.location && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    <MapPin className="w-3.5 h-3.5" />
                    {ad.location}
                  </div>
                )}
                {ad.condition && ad.condition !== 'N/A' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    <Tag className="w-3.5 h-3.5" />
                    {ad.condition}
                  </div>
                )}
                {ad.type && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 rounded-full text-xs font-bold text-brand-blue">
                    For {ad.type}
                  </div>
                )}
                {ad.fuel_type && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    <Fuel className="w-3.5 h-3.5" />
                    {ad.fuel_type}
                  </div>
                )}
                {ad.property_type && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    <Building2 className="w-3.5 h-3.5" />
                    {ad.property_type}
                  </div>
                )}
                {ad.contract_type && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    <Briefcase className="w-3.5 h-3.5" />
                    {ad.contract_type}
                  </div>
                )}
                {ad.size && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    <Shirt className="w-3.5 h-3.5" />
                    Size: {ad.size}
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelativeTime(createdAt)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Description</h4>
              <p className="text-slate-600 leading-relaxed">
                {ad.description || "No description provided for this item."}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button 
                className="flex-1 bg-brand-blue text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 active:scale-[0.98] transition-transform"
                onClick={() => {
                  window.location.href = `mailto:seller@example.com?subject=Inquiry about ${ad.title}`;
                }}
              >
                Send Email to Seller
              </button>
              <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-[0.98] transition-transform">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            </div>
          </div>
        </motion.div>

        {/* Full Screen Image Portal */}
        <AnimatePresence>
          {isFullScreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
              onClick={() => setIsFullScreen(false)}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFullScreen(false); }}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-[110]"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative w-full h-full flex items-center justify-center p-4 no-swipe">
                <motion.img
                  key={currentImageIndex}
                  initial={{ scale: 0.9, opacity: 0, x: direction * 200 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.9, opacity: 0, x: -direction * 200 }}
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={onDragEnd}
                  src={images[currentImageIndex]}
                  alt={ad.title}
                  className="max-w-full max-h-full object-contain shadow-2xl cursor-grab active:cursor-grabbing select-none"
                  onClick={(e) => e.stopPropagation()}
                />

                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
);
}

// --- Views ---

function HomeView({ onNavigate, onAddPro, ads, onSelectAd, onSelectPost }: { onNavigate: (view: View) => void, onAddPro: () => void, ads: Ad[], onSelectAd: (ad: Ad) => void, onSelectPost: (post: any) => void }) {
  const feedRef = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 space-y-8 max-w-7xl mx-auto w-full"
    >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
        <div className="space-y-1 flex flex-col items-center md:items-start">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-brand-navy">Hola, Vincent! 👋</h2>
          <p className="text-slate-500 text-lg">Welcome back to Valencia community.</p>
        </div>
      </div>

      {/* Hero Find Pro Section */}
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
        className="relative overflow-hidden rounded-[2rem] bg-white p-8 md:p-16 text-slate-900 border border-slate-100 shadow-sm transition-all duration-300"
      >
        {/* Subtle Background Elements */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-[1.15] tracking-tight max-w-2xl">
              Find recommended <span className="text-brand-blue italic">Pros</span> near you.
            </h1>
            <p className="text-slate-500 text-base md:text-xl max-w-md leading-relaxed">
              Connect with verified experts recommended by the community.
            </p>
            
            <div 
              className="relative group cursor-pointer w-full max-w-md" 
              onClick={() => onNavigate('explore')}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-brand-blue transition-colors" />
              <div className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-slate-100 text-slate-600 placeholder:text-slate-400 text-base hover:border-brand-blue/20 transition-all flex items-center shadow-sm group-hover:shadow-md">
                Search for a pro...
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex justify-center lg:justify-end relative">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-yellow rounded-full animate-pulse opacity-10 blur-2xl" />
              <div className="relative z-10 w-full h-full rounded-full border-2 border-slate-100 p-4 backdrop-blur-sm">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                   <img src="/valencia.jpg" alt="Valencia City" className="w-full h-full object-cover" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-xl">
        {/* Highlights of the week carousel */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg font-display text-brand-navy flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-blue" />
              Highlights of the week
            </h3>
          </div>
          
          <div className="relative group">
            <HighlightCarousel onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HighlightCarousel({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);

  const slides = [
    {
      type: 'event',
      title: 'Valencia Expat Connect',
      location: 'Marina Beach Club',
      tag: 'EVENT',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600',
      date: { day: 'FRI', num: '24' },
      action: () => onNavigate('events')
    },
    {
      type: 'pro',
      pro: MOCK_PROS[1],
      action: () => onNavigate('explore')
    },
    {
      type: 'tip',
      title: 'Getting your NIE in 3 simple steps',
      excerpt: 'Avoid the administrative headache with our updated 2024 guide for Valencia residents.',
      tag: 'TIPS',
      readTime: '4 min read',
      action: () => onNavigate('guides')
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-[32px] no-swipe">
      <motion.div 
        className="flex"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          const threshold = 50;
          if (info.offset.x < -threshold && currentIndex < totalSlides - 1) {
            setCurrentIndex(prev => prev + 1);
          } else if (info.offset.x > threshold && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
          }
        }}
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className="min-w-full px-1">
            {slide.type === 'event' && (
              <div 
                className="card bg-white overflow-hidden cursor-pointer h-[220px] border border-slate-100/50 shadow-sm flex flex-col"
                onClick={slide.action}
              >
                <div className="h-32 overflow-hidden relative">
                  <img src={slide.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-center shadow-sm">
                    <p className="text-[8px] font-bold text-brand-blue uppercase">{slide.date?.day}</p>
                    <p className="text-sm font-bold leading-none">{slide.date?.num}</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-brand-blue text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {slide.tag}
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{slide.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {slide.location}
                  </p>
                </div>
              </div>
            )}

            {slide.type === 'pro' && slide.pro && (
              <div 
                className="card bg-gradient-to-br from-brand-blue/5 to-transparent overflow-hidden cursor-pointer h-[220px] border border-brand-blue/10 shadow-sm relative flex flex-col justify-center items-center text-center p-5"
                onClick={slide.action}
              >
                <div className="absolute top-3 right-3 bg-brand-blue text-white p-1.5 rounded-full shadow-lg">
                  <Trophy className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2">Pro of the week</p>
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl mb-3">
                  <img src={slide.pro.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">{slide.pro.name}</h4>
                  <p className="text-xs text-brand-blue font-medium">{slide.pro.category}</p>
                </div>
              </div>
            )}

            {slide.type === 'tip' && (
              <div 
                className="card bg-white overflow-hidden cursor-pointer h-[220px] border border-slate-100/50 shadow-sm flex flex-col"
                onClick={slide.action}
              >
                <div className="h-24 bg-brand-blue/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-blue/20 rounded-full blur-2xl" />
                  <Lightbulb className="w-10 h-10 text-brand-blue relative z-10" />
                  <div className="absolute top-3 right-3 bg-brand-blue text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {slide.tag}
                  </div>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{slide.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{slide.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Guides</span>
                    <span className="text-[10px] font-bold text-brand-blue">{slide.readTime}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-1 transition-all duration-300 rounded-full",
              currentIndex === i ? "w-4 bg-brand-blue" : "w-1 bg-slate-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ExploreView({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);

  const categories = ['All', 'Plumber', 'Lawyer', 'Translator', 'Real Estate', 'Handyman'];
  const languages = ['All', 'Spanish', 'English', 'French', 'German', 'Italian'];

  const hasActiveFilter = search.trim() !== '' || selectedCategory !== 'All';

  const filteredPros = hasActiveFilter 
    ? MOCK_PROS.filter(pro => 
        (selectedCategory === 'All' || pro.category === selectedCategory) &&
        (selectedLanguage === 'All' || pro.languages.includes(selectedLanguage)) &&
        (pro.name.toLowerCase().includes(search.toLowerCase()) || pro.category.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-8 pb-24"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-display text-brand-navy">Find Trusted Pros</h2>
          <p className="text-slate-500">Verified experts recommended by the community.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or service..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Filter className="w-3 h-3" /> Categories
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 no-swipe">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border active:scale-95 hover:shadow-md",
                    selectedCategory === cat 
                      ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-blue/30"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Languages className="w-3 h-3" /> Languages
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 no-swipe">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border active:scale-95 hover:shadow-md",
                    selectedLanguage === lang 
                      ? "bg-brand-blue text-white border-brand-blue shadow-md" 
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-blue/30"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
        {!hasActiveFilter ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-brand-blue/5 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 text-brand-blue/30" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-900 font-bold text-lg">Search for Professionals</p>
              <p className="text-slate-500">Type a name or select a category to see results.</p>
            </div>
          </div>
        ) : filteredPros.length > 0 ? (
          filteredPros.map(pro => (
            <motion.div 
              key={pro.id} 
              layout
              onClick={() => setSelectedPro(pro)}
              className="card bg-white p-5 flex flex-col gap-4 border border-slate-100 transition-all shadow-sm hover-lift group cursor-pointer"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                  <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-brand-blue transition-colors">{pro.name}</h4>
                        {pro.verified && <CheckCircle2 className="w-4 h-4 text-brand-blue fill-brand-blue/10" />}
                      </div>
                      <p className="text-sm font-medium text-brand-blue">{pro.category}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-700">{pro.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">{pro.reviews} reviews</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {pro.bio}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pro.languages.map(lang => (
                      <span key={lang} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-medium border border-slate-100">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No professionals found matching your filters.</p>
            <button 
              onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedLanguage('All'); }}
              className="text-brand-blue font-bold text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Professional Detail Modal */}
      <AnimatePresence>
        {selectedPro && (
          <ProfessionalDetailView 
            pro={selectedPro} 
            onClose={() => setSelectedPro(null)} 
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MessagesView() {
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  const chats = [
    { id: 1, name: 'Thomas', lastMsg: 'Thanks for the recommendation!', time: '2m ago', avatar: 'https://i.pravatar.cc/150?u=thomas', online: true },
    { id: 2, name: 'Marie', lastMsg: 'Did you get your residency yet?', time: '1h ago', avatar: 'https://i.pravatar.cc/150?u=marie', online: false },
    { id: 3, name: 'Julie', lastMsg: 'The flat is amazing, Valencia is great!', time: '3h ago', avatar: 'https://i.pravatar.cc/150?u=julie', online: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto w-full h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] bg-white md:rounded-[32px] overflow-hidden shadow-sm border-x md:border border-slate-100 flex md:mt-4"
    >
      {/* Sidebar - Hidden on mobile if a chat is selected */}
      <div className={cn(
        "w-full md:w-80 border-r border-slate-100 flex flex-col transition-all duration-300",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur">
          <h2 className="text-xl font-black text-slate-900 font-display">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "p-4 flex gap-3 cursor-pointer transition-colors border-l-4",
                selectedChat?.id === chat.id ? "bg-brand-blue/5 border-brand-blue" : "hover:bg-slate-50 border-transparent"
              )}
            >
              <div className="relative flex-shrink-0">
                <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full" />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{chat.name}</h4>
                  <span className="text-[10px] text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area - Full screen on mobile if a chat is selected */}
      <div className={cn(
        "flex-1 flex flex-col bg-slate-50/30 transition-all duration-300",
        selectedChat ? "flex" : "hidden md:flex"
      )}>
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img src={selectedChat.avatar} alt="" className="w-10 h-10 rounded-full" />
                  {selectedChat.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedChat.name}</h4>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{selectedChat.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto bg-slate-50/50">
              <div className="flex justify-end">
                <div className="bg-brand-blue text-white p-3.5 rounded-2xl rounded-tr-none max-w-[85%] md:max-w-sm text-sm shadow-sm ring-1 ring-black/5">
                  Hey! I noticed you left a review for one of the pros. How was your experience?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white text-slate-700 p-3.5 rounded-2xl rounded-tl-none max-w-[85%] md:max-w-sm text-sm shadow-sm border border-slate-100">
                  {selectedChat.lastMsg}
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 pb-6 md:pb-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-blue/20 transition-all"
                />
                <button className="bg-brand-blue text-white p-2.5 rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 space-y-4 bg-white">
            <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center animate-bounce-slow">
              <MessageCircle className="w-10 h-10 text-brand-blue" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Your Conversations</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">Select a chat to start talking with other community members.</p>
            </div>
          </div>
        ) }
      </div>
    </motion.div>
  );
}

function ProfessionalDetailView({ pro, onClose, onNavigate }: { pro: Professional, onClose: () => void, onNavigate: (view: View) => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] overflow-y-auto overscroll-contain" onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl my-auto relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Image/Cover */}
          <div className="h-48 bg-gradient-to-r from-brand-blue/20 to-brand-yellow/20 relative">
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-8 pb-10 -mt-16 relative">
            <div className="flex flex-col md:flex-row gap-6 md:items-end mb-8">
              <div className="w-32 h-32 rounded-[32px] bg-white p-1 overflow-hidden shadow-xl border-4 border-white">
                <img src={pro.image} alt={pro.name} className="w-full h-full object-cover rounded-[28px]" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-black text-slate-900 font-display tracking-tight">{pro.name}</h3>
                  {pro.verified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-blue/10 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                      <span className="text-[10px] font-bold text-brand-blue uppercase">Verified</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    <Briefcase className="w-3.5 h-3.5 text-brand-blue" />
                    {pro.category}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-slate-700 font-bold">{pro.rating}</span>
                    <span className="text-slate-400">({pro.reviews} reviews)</span>
                  </div>
                  {pro.location && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {pro.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <section className="space-y-3">
                  <h4 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
                    About
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-base">
                    {pro.bio}
                  </p>
                </section>

                <section className="space-y-6">
                  <h4 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
                    Reviews & Testimonials
                  </h4>
                  <div className="space-y-4">
                    {pro.testimonials.map((t, i) => (
                      <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <img src={t.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-slate-50" />
                            <div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClose();
                                  onNavigate('messages');
                                }}
                                className="font-bold text-slate-900 hover:text-brand-blue flex items-center gap-1.5 transition-colors"
                              >
                                {t.author}
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex items-center gap-1">
                                {[...Array(t.rating)].map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">{t.date}</span>
                        </div>
                        <p className="text-slate-600 text-sm italic leading-relaxed">
                          "{t.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Contact Details</h4>
                  
                  <div className="space-y-4">
                    {pro.phone && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                        <a href={`tel:${pro.phone}`} className="flex items-center gap-3 text-slate-700 hover:text-brand-blue transition-colors group">
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                            <Phone className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm">{pro.phone}</span>
                        </a>
                      </div>
                    )}
                    
                    {pro.email && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                        <a href={`mailto:${pro.email}`} className="flex items-center gap-3 text-slate-700 hover:text-brand-blue transition-colors group">
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                            <Mail className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm">{pro.email}</span>
                        </a>
                      </div>
                    )}

                    <div className="space-y-1 border-t border-slate-200 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Languages</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {pro.languages.map(lang => (
                          <span key={lang} className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {pro.experience && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</label>
                        <p className="text-sm font-bold text-slate-700">{pro.experience}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EventsView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-display text-brand-navy">What's Up in Valencia</h2>
        <p className="text-slate-500">Discover meetups and cultural events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {MOCK_EVENTS.map(event => (
          <div key={event.id} className="card bg-white group hover-lift cursor-pointer">
            <div className="h-40 overflow-hidden relative">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-center">
                <p className="text-[10px] font-bold text-brand-blue uppercase">{event.date.split(' ')[0]}</p>
                <p className="text-lg font-bold leading-none">{event.date.split(' ')[1]}</p>
              </div>
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white p-2 rounded-full">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg">{event.title}</h4>
                <span className="text-[10px] font-bold bg-brand-blue/5 text-brand-blue px-2 py-1 rounded-full">{event.category}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold">+{event.attendees - 3}</div>
                </div>
                <button className="btn-primary text-xs">Attend Event</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function GuidesView() {
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | null>(null);

  if (selectedCategory) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="p-6 space-y-8 pb-24"
      >
        <button 
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-brand-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guides
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100">
            <selectedCategory.icon />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-display text-slate-900">{selectedCategory.title}</h2>
            <p className="text-slate-500">{selectedCategory.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Publications</h3>
          <div className="grid grid-cols-1 gap-4">
            {selectedCategory.articles.map(article => (
              <div key={article.id} className="card bg-white p-6 space-y-3 hover-lift group cursor-pointer">
                <div className="flex justify-between items-start">
                  {article.tag && (
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      {article.tag}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{article.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{article.excerpt}</p>
                <div className="flex items-center gap-2 text-brand-blue text-sm font-bold pt-2">
                  Read Article <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-8 pb-24"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold font-display text-brand-navy">Relocation Guides</h2>
        <p className="text-slate-500 text-lg">Everything you need to know to settle in Valencia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto w-full">
        {MOCK_GUIDE_CATEGORIES.map((category) => (
          <motion.div 
            key={category.id} 
            onClick={() => setSelectedCategory(category)}
            className="card bg-white p-5 flex gap-5 items-center relative group cursor-pointer border border-slate-100 transition-all shadow-sm hover-lift"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110">
              <category.icon />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-slate-900 text-lg">{category.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{category.description}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-blue" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Guide Section */}
      <div className="pt-4">
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-blue/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/20 border border-brand-blue/30 text-brand-blue uppercase tracking-wider">
              <Star className="w-3 h-3 fill-current" /> Most Popular
            </div>
            <h3 className="text-2xl font-bold font-display">The Ultimate NIE Guide</h3>
            <p className="text-slate-400 max-w-md">Stop struggling with appointments. We've simplified the entire process for you.</p>
            <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-yellow transition-colors">
              Read Guide
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MarketplaceView({ onAddAd, ads, onSelectAd }: { onAddAd: () => void, ads: Ad[], onSelectAd: (ad: Ad) => void }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [extraFilters, setExtraFilters] = useState<any>({});
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const handleSearch = () => {
    setShowResults(true);
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('search-results-anchor');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const categories = [
    { name: 'All', icon: LayoutGrid, color: 'bg-slate-100 text-slate-600' },
    { name: 'Vehicles', icon: Car, color: 'bg-blue-100 text-blue-600' },
    { name: 'Real Estate', icon: Building2, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Clothing', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
    { name: 'Home', icon: Armchair, color: 'bg-orange-100 text-orange-600' },
    { name: 'Electronics', icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
    { name: 'Leisure', icon: Gamepad, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Services', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
    { name: 'Jobs', icon: Briefcase, color: 'bg-cyan-100 text-cyan-600' },
  ];

  const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];

  const filteredAds = ads
    .filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCondition = selectedCondition === 'All' || item.condition === selectedCondition;
      const matchesLocation = !location || item.location?.toLowerCase().includes(location.toLowerCase());
      
      const priceNum = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
      const matchesPrice = priceNum >= priceRange[0] && priceNum <= priceRange[1];

      // Category specific matching
      let matchesExtra = true;
      if (activeCategory === 'Clothing' && extraFilters.size && extraFilters.size !== 'All') {
        // In a real app, check item.size
      }
      if (activeCategory === 'Vehicles' && extraFilters.fuel && extraFilters.fuel !== 'All') {
        // In a real app, check item.fuel
      }
      if (activeCategory === 'Real Estate' && extraFilters.propertyType && extraFilters.propertyType !== 'All') {
        // In a real app, check item.propertyType
      }
      if (activeCategory === 'Jobs' && extraFilters.contract && extraFilters.contract !== 'All') {
        // In a real app, check item.contract
      }

      return matchesCategory && matchesSearch && matchesCondition && matchesPrice && matchesLocation && matchesExtra;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'price-low') return (parseInt(a.price.replace(/[^0-9]/g, '')) || 0) - (parseInt(b.price.replace(/[^0-9]/g, '')) || 0);
      if (sortBy === 'price-high') return (parseInt(b.price.replace(/[^0-9]/g, '')) || 0) - (parseInt(a.price.replace(/[^0-9]/g, '')) || 0);
      return 0;
    });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-20"
    >
      {/* Search Hero Section */}
      <div className="bg-gradient-to-br from-brand-blue/5 via-white to-brand-yellow/5 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-12">
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 tracking-tight">
              Unlock'd Marketplace
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Find everything you need from the local community.
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-white p-2 rounded-[32px] shadow-2xl shadow-brand-blue/10 border border-slate-100 flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-14 pr-4 py-5 bg-transparent rounded-2xl outline-none text-lg font-medium"
              />
            </div>
            <div className="h-10 w-px bg-slate-100 hidden md:block" />
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Where? (e.g. Ruzafa)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-14 pr-4 py-5 bg-transparent rounded-2xl outline-none text-lg font-medium"
              />
            </div>
            <div className="h-10 w-px bg-slate-100 hidden md:block" />
            <div className="relative flex-1 w-full">
              <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full pl-14 pr-8 py-5 bg-transparent rounded-2xl outline-none text-lg font-medium appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button 
              onClick={handleSearch}
              className="w-full md:w-auto bg-brand-blue text-white px-10 py-5 rounded-[24px] font-bold text-lg hover:bg-brand-blue/90 transition-all active:scale-95 shadow-lg shadow-brand-blue/20"
            >
              Search
            </button>
          </div>

          {/* Conditional Filters */}
          <AnimatePresence>
            {activeCategory !== 'All' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto bg-white/50 backdrop-blur-sm p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Price Range */}
                  <div className="flex-1 space-y-4">
                    <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Euro className="w-4 h-4 text-brand-blue" />
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">€</span>
                        <input 
                          type="number" 
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full pl-8 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">€</span>
                        <input 
                          type="number" 
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                          className="w-full pl-8 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Condition - Hide for Jobs and Services */}
                  {activeCategory !== 'Jobs' && activeCategory !== 'Services' && (
                    <div className="flex-1 space-y-4">
                      <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
                        Condition
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {conditions.map(c => (
                          <button
                            key={c}
                            onClick={() => setSelectedCondition(c)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                              selectedCondition === c 
                                ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20" 
                                : "bg-white text-slate-600 border-slate-100 hover:border-brand-blue/30"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Specific Filters */}
                  {activeCategory === 'Vehicles' && (
                    <div className="flex-1 space-y-4">
                      <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Car className="w-4 h-4 text-brand-blue" />
                        Fuel Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => (
                          <button
                            key={f}
                            onClick={() => setExtraFilters({ ...extraFilters, fuel: f })}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                              extraFilters.fuel === f || (!extraFilters.fuel && f === 'All')
                                ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20" 
                                : "bg-white text-slate-600 border-slate-100 hover:border-brand-blue/30"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeCategory === 'Real Estate' && (
                    <div className="flex-1 space-y-4">
                      <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-blue" />
                        Property Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Apartment', 'House', 'Studio', 'Office'].map(t => (
                          <button
                            key={t}
                            onClick={() => setExtraFilters({ ...extraFilters, propertyType: t })}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                              extraFilters.propertyType === t || (!extraFilters.propertyType && t === 'All')
                                ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20" 
                                : "bg-white text-slate-600 border-slate-100 hover:border-brand-blue/30"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeCategory === 'Jobs' && (
                    <div className="flex-1 space-y-4">
                      <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-brand-blue" />
                        Contract Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Full-time', 'Part-time', 'Contract', 'Internship'].map(c => (
                          <button
                            key={c}
                            onClick={() => setExtraFilters({ ...extraFilters, contract: c })}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                              extraFilters.contract === c || (!extraFilters.contract && c === 'All')
                                ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20" 
                                : "bg-white text-slate-600 border-slate-100 hover:border-brand-blue/30"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeCategory === 'Clothing' && (
                    <div className="flex-1 space-y-4">
                      <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Shirt className="w-4 h-4 text-brand-blue" />
                        Size
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                          <button
                            key={s}
                            onClick={() => setExtraFilters({ ...extraFilters, size: s })}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                              extraFilters.size === s || (!extraFilters.size && s === 'All')
                                ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20" 
                                : "bg-white text-slate-600 border-slate-100 hover:border-brand-blue/30"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div id="search-results-anchor" />

      <AnimatePresence>
        {showResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 py-12 space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">
                  {filteredAds.length} {filteredAds.length === 1 ? 'item' : 'items'} found
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {searchQuery || 'All items'} {location && `in ${location}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-100 rounded-xl px-4 py-2 font-bold text-brand-blue outline-none cursor-pointer shadow-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <button 
                  onClick={() => setShowResults(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  title="Clear results"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {filteredAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAds.map((ad) => (
                  <motion.div 
                    key={ad.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card bg-white overflow-hidden group cursor-pointer border border-slate-100 hover-lift"
                    onClick={() => onSelectAd(ad)}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={ad.image_url} 
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-900 shadow-sm uppercase tracking-wider">
                          {ad.category}
                        </span>
                        {ad.condition && ad.condition !== 'All' && (
                          <span className="px-2 py-1 rounded-lg bg-brand-blue text-white text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            {ad.condition}
                          </span>
                        )}
                      </div>
                      <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-pink-500 transition-colors shadow-sm">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-blue transition-colors">{ad.title}</h4>
                        <span className="text-lg font-black text-brand-blue whitespace-nowrap">{ad.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {ad.type && (
                          <span className="px-2 py-0.5 rounded-md bg-brand-blue/10 text-[10px] font-bold text-brand-blue border border-brand-blue/20">
                            For {ad.type}
                          </span>
                        )}
                        {ad.fuel_type && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100">
                            {ad.fuel_type}
                          </span>
                        )}
                        {ad.property_type && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100">
                            {ad.property_type}
                          </span>
                        )}
                        {ad.contract_type && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100">
                            {ad.contract_type}
                          </span>
                        )}
                        {ad.size && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100">
                            Size: {ad.size}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ad.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ad.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-slate-900">No items found</p>
                  <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setLocation('');
                    setActiveCategory('All');
                    setPriceRange([0, 100000]);
                    setSelectedCondition('All');
                    setExtraFilters({});
                  }}
                  className="text-brand-blue font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="w-24 h-24 bg-brand-blue/5 rounded-full flex items-center justify-center mx-auto">
          <Plus className="w-10 h-10 text-brand-blue" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-slate-900 font-display">Have something to sell?</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Join the community and post your listing in seconds.</p>
        </div>
        <button 
          onClick={onAddAd}
          className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-bold text-lg hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
        >
          Post a Listing
        </button>
      </div>
    </motion.div>
  );
}

function ProfileView() {
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);

  const menuItems = [
    { label: 'Account Security', icon: Shield },
    { label: 'Change Password', icon: Lock },
    { label: 'Payment', icon: CreditCard },
    { label: 'Promos', icon: Gift },
    { label: 'Notifications', icon: Bell },
    { label: 'Privacy Settings', icon: Shield },
    { label: 'Support', icon: HelpCircle },
    { label: 'About', icon: Info },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-12"
    >
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-8 pb-10 bg-white border-b border-slate-100">
        <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-sm overflow-hidden mb-4">
          <img src="/photo-vincent.jpg" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-bold font-display text-brand-navy">Vincent D.</h2>
      </div>

      {/* Menu List */}
      <div className="bg-white border-y border-slate-100">
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50">
          <span className="font-bold text-slate-900">Account</span>
          <span className="text-sm text-slate-500">vincentdurroux@gmail.com</span>
        </div>

        {menuItems.map((item, index) => (
          <button 
            key={index}
            onClick={() => setActiveSubPage(item.label)}
            className={cn(
              "w-full px-6 py-4 flex justify-between items-center active:bg-slate-50 hover:bg-slate-50/50 transition-all group",
              index !== menuItems.length - 1 && "border-b border-slate-50"
            )}
          >
            <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
              <item.icon className="w-5 h-5 text-slate-400 group-hover:text-brand-blue transition-colors" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-blue transition-colors" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-6 mt-8">
        <button className="w-full py-4 text-slate-500 font-medium hover:text-red-500 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Sub-pages */}
      <AnimatePresence>
        {activeSubPage === 'Account Security' && (
          <ProfileSubPage title="Account Security" onBack={() => setActiveSubPage(null)}>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <p className="font-bold text-slate-900">Login History</p>
                <div className="space-y-4">
                  {[
                    { device: 'iPhone 15 Pro', location: 'Valencia, ES', time: 'Active now' },
                    { device: 'MacBook Air', location: 'Valencia, ES', time: '2 hours ago' }
                  ].map((login, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-slate-700">{login.device}</p>
                        <p className="text-xs text-slate-400">{login.location}</p>
                      </div>
                      <span className="text-xs text-slate-400">{login.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ProfileSubPage>
        )}

        {activeSubPage === 'Change Password' && (
          <ProfileSubPage title="Change Password" onBack={() => setActiveSubPage(null)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none" />
              </div>
              <button className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-lg shadow-brand-blue/20 mt-4">
                Update Password
              </button>
            </div>
          </ProfileSubPage>
        )}

        {activeSubPage === 'Payment' && (
          <ProfileSubPage title="Payment Methods" onBack={() => setActiveSubPage(null)}>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Cards</p>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-8 bg-slate-900 rounded flex items-center justify-center text-[10px] text-white font-bold">VISA</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">•••• •••• •••• 4242</p>
                    <p className="text-xs text-slate-500">Expires 12/25</p>
                  </div>
                  <button className="text-brand-blue font-bold text-sm">Edit</button>
                </div>
              </div>
              <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
                <Plus className="w-5 h-5" />
                Add New Method
              </button>
            </div>
          </ProfileSubPage>
        )}

        {activeSubPage === 'Promos' && (
          <ProfileSubPage title="Promos & Referrals" onBack={() => setActiveSubPage(null)}>
            <div className="space-y-6">
              <div className="bg-brand-blue p-6 rounded-2xl text-white space-y-4 shadow-lg shadow-brand-blue/20">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">Your Referral Code</p>
                    <p className="text-2xl font-black">VALENCIA2024</p>
                  </div>
                </div>
                <p className="text-sm opacity-90">Share this code with friends and you both get €10 credit on your next booking!</p>
                <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-colors">
                  Share Code
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Promos</p>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Welcome Bonus</p>
                    <p className="text-xs text-slate-500">€5 off any service</p>
                  </div>
                  <span className="text-xs font-bold text-brand-blue bg-brand-blue/5 px-2 py-1 rounded-lg">Applied</span>
                </div>
              </div>
            </div>
          </ProfileSubPage>
        )}

        {activeSubPage === 'Notifications' && (
          <ProfileSubPage title="Notifications" onBack={() => setActiveSubPage(null)}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {[
                { title: 'Push Notifications', desc: 'Receive alerts on your device' },
                { title: 'Email Updates', desc: 'Weekly community highlights' },
                { title: 'Booking Reminders', desc: 'Stay on top of your schedule' },
                { title: 'Marketplace Alerts', desc: 'When items you follow are listed' }
              ].map((item, i) => (
                <div key={i} className={cn(
                  "p-6 flex items-center justify-between",
                  i !== 3 && "border-b border-slate-50"
                )}>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative cursor-pointer transition-colors",
                    i < 2 ? "bg-brand-blue" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      i < 2 ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </ProfileSubPage>
        )}

        {activeSubPage === 'Privacy Settings' && (
          <ProfileSubPage title="Privacy Settings" onBack={() => setActiveSubPage(null)}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {[
                { title: 'Public Profile', desc: 'Allow others to see your profile' },
                { title: 'Show Activity', desc: 'Show when you are online' },
                { title: 'Data Sharing', desc: 'Share anonymous usage data' }
              ].map((item, i) => (
                <div key={i} className={cn(
                  "p-6 flex items-center justify-between",
                  i !== 2 && "border-b border-slate-50"
                )}>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative cursor-pointer transition-colors",
                    i === 0 ? "bg-brand-blue" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      i === 0 ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </ProfileSubPage>
        )}

        {activeSubPage === 'Support' && (
          <ProfileSubPage title="Support" onBack={() => setActiveSubPage(null)}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <button className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-brand-blue/30 transition-all w-full">
                  <div className="w-12 h-12 bg-brand-blue/5 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-lg">Email Us</p>
                    <p className="text-sm text-slate-500">support@valenciaguide.com</p>
                  </div>
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <p className="p-6 font-bold text-slate-900 border-b border-slate-50">Frequently Asked Questions</p>
                {[
                  'How do I book a professional?',
                  'What is the cancellation policy?',
                  'How can I list an item in marketplace?',
                  'Is my payment secure?'
                ].map((q, i) => (
                  <button key={i} className="w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <span className="text-sm font-medium text-slate-700">{q}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </ProfileSubPage>
        )}

        {activeSubPage === 'About' && (
          <ProfileSubPage title="About Valencia" onBack={() => setActiveSubPage(null)}>
            <div className="flex flex-col items-center text-center space-y-8 py-8">
              <div className="w-24 h-24 bg-brand-blue rounded-3xl flex items-center justify-center shadow-xl shadow-brand-blue/20">
                <span className="text-4xl font-black text-white">V</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-display">Valencia Community</h3>
                <p className="text-slate-500">Version 1.2.4 (Build 452)</p>
              </div>
              <div className="w-full space-y-2">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Licenses'].map((item, i) => (
                  <button key={i} className="w-full p-4 bg-white rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="font-medium text-slate-700">{item}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">© 2024 Valencia Community App. All rights reserved.</p>
            </div>
          </ProfileSubPage>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProfileSubPage({ title, onBack, children }: { title: string, onBack: () => void, children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-slate-50 z-[60] flex flex-col"
    >
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h2 className="text-xl font-bold font-display text-brand-navy">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {children}
      </div>
    </motion.div>
  );
}

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* Main Logo Animation Group */}
        <div className="relative flex items-center justify-center h-32 mb-12">
          {/* Left Blue Arc */}
          <motion.div
            initial={{ x: 25, opacity: 0 }}
            animate={{ x: -140, opacity: 1 }}
            transition={{ 
              duration: 2.5, 
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="z-20"
          >
            <svg width="40" height="100" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 md:h-32 w-auto">
              <path d="M22 2C10 8 2 20 2 30C2 40 10 52 22 58" stroke="#00AEEF" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </motion.div>

          {/* Center Name - Appears as the circle splits */}
          <div className="absolute flex items-center justify-center">
            <div className="flex items-center">
              {"unlock".split("").map((char, i) => {
                // Grouping: 'lock' (indices 2-5) first, then 'un' (0-1)
                let delay;
                if (i >= 2) {
                  // "lock" letters appear first with a synchronized reveal
                  delay = 0.5 + ((i - 2) * 0.12);
                } else {
                  // "un" follows shortly after "lock" starts appearing
                  delay = 1.4 + (i * 0.15);
                }
                
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ 
                      duration: 1.4, // Keep it smooth
                      delay: delay,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="text-5xl md:text-6xl font-medium tracking-tight text-[#0A1629] font-display inline-block"
                  >
                    {char}
                  </motion.span>
                );
              })}
              
              <motion.div
                initial={{ rotate: -180, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 120,
                  damping: 15,
                  delay: 1.1 // Show icon as "lock" becomes clear
                }}
                className="mx-1.5 md:mx-3"
              >
                <svg width="36" height="36" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
                  <path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" fill="#FBB03B" />
                </svg>
              </motion.div>

              <motion.span
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ 
                  duration: 1.4, 
                  delay: 2.2, // "d" is the grand finale
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="text-5xl md:text-6xl font-medium tracking-tight text-[#0A1629] font-display inline-block"
              >
                d
              </motion.span>
            </div>
          </div>

          {/* Right Yellow Arc */}
          <motion.div
            initial={{ x: -25, opacity: 0 }}
            animate={{ x: 140, opacity: 1 }}
            transition={{ 
              duration: 2.5, 
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="z-20"
          >
            <svg width="40" height="100" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 md:h-32 w-auto">
              <path d="M2 2C14 8 22 20 22 30C22 40 14 52 2 58" stroke="#FBB03B" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>

        {/* Tagline and Progress Bar - Sits BELOW the arcs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 2.8 }}
          className="flex flex-col items-center"
        >
          <p className="text-xs md:text-sm font-medium text-slate-500 whitespace-nowrap px-4 text-center">
            Your circle. Your people. <span className="text-[#00AEEF]">Your recommendations.</span>
          </p>
          
          {/* Loading Progress Bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "140px", opacity: 1 }}
            transition={{ delay: 3.5, duration: 3, ease: "easeInOut" }}
            className="h-[3px] bg-brand-blue/10 mt-8 rounded-full overflow-hidden relative"
          >
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-brand-blue"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative background circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.03 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 bg-brand-blue rounded-full blur-[100px] pointer-events-none"
      />
    </motion.div>
  );
}
