            import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Business } from '@/types/Business';
import { FiHome, FiBox, FiBarChart2, FiShoppingCart, FiUsers, FiGlobe, FiFolder, FiMapPin } from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: <FiHome size={22}/> },
  { name: 'Products', href: '/dashboard/products', icon: <FiBox size={22}/> },
  { name: 'Orders', href: '/dashboard/orders', icon: <FiShoppingCart size={22}/> },
  { name: 'Customers', href: '/dashboard/customers', icon: <FiUsers size={22}/> },
  { name: 'Analytics', href: '/dashboard/analytics', icon: <FiBarChart2 size={22}/> },
  { name: 'Intranet', href: '/dashboard/intranet', icon: <FiGlobe size={22}/> },
  { name: 'Resources', href: '/dashboard/resources', icon: <FiFolder size={22}/> },
];

export default function DashboardNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      if (session?.user?.id) {
        setLoading(true);
        try {
          const res = await fetch(`/api/business/${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            // Debug log API response
            console.log('Fetched business data for navbar:', data);
            console.log('Business object:', data);
            console.log('Business logo value:', data.logo);
            setBusiness(data || {});
          } else {
            setBusiness(null);
          }
        } catch (err) {
          setBusiness(null);
          console.error('Error fetching business for navbar:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchBusiness();
  }, [session?.user?.id]);

  // Normalize logo path for Next.js Image
  // Debug: log business and logo at render
  if (typeof window !== 'undefined') {
    console.log('DashboardNavbar render: business =', business);
    if (business) {
      console.log('DashboardNavbar render: business.logo =', business.logo);
    }
  }

  let businessLogo: string = '/default-logo.png';
  if (!loading && business && business.logo && business.logo.trim() !== '') {
    businessLogo = business.logo.startsWith('http') || business.logo.startsWith('/')
      ? business.logo
      : '/' + business.logo;
  }

  const businessName = business?.name || session?.user?.business_name || session?.user?.name || 'Your Business';

  return (
    <aside className="fixed top-12 left-0 z-30 h-[calc(100vh-3rem)] w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Mini Profile Header */}
      <div className="relative">
        {/* Background Image */}
        {business?.background_image && (
          <div className="h-[4.5rem] relative rounded-t-lg overflow-hidden">
            <Image
              src={business.background_image}
              alt="Business Background"
              layout="fill"
              objectFit="cover"
              className=""
            />
          </div>
        )}
        
        {/* Profile Details */}
        <div className="relative">
          {/* Business Logo */}
          <div className="flex justify-center -mt-8 mb-2 z-10 relative">
            {loading ? (
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
            ) : (
              <Image 
                src={businessLogo}
                alt="Business Logo" 
                width={64} 
                height={64} 
                className="rounded-full border-4 border-white object-cover shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-logo.png';
                }}
              />
            )}
          </div>
          
          {/* Business Details Section */}
          <div className="bg-white px-4 pb-4 pt-2 rounded-b-lg shadow-sm">
            {/* Business Name */}
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">{businessName}</h2>
            
            {/* Tagline */}
            {business?.tagline && (
              <p className="text-sm text-gray-600 italic text-center mb-2">
                {business.tagline}
              </p>
            )}
            
            {/* Business Description */}
            {business?.description && (
              <div 
                className="text-xs text-gray-700 mt-2 line-clamp-3 overflow-hidden text-center mb-2"
                dangerouslySetInnerHTML={{ __html: business.description }}
              />
            )}
            
            {/* Location */}
            {business?.location && (
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <FiMapPin size={14} className="text-gray-500" />
                <span>{business.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 mb-1 rounded-lg transition-colors duration-150 relative group text-sm ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
              style={{ textDecoration: 'none' }}
            >
              {/* Vertical bar for active item */}
              <span className={`absolute left-0 top-2 bottom-2 w-1 rounded bg-blue-600 transition-all duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}></span>
              <span className="ml-2">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
