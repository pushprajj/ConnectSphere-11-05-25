// src/components/ProfileTabs.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaBriefcase, FaMapMarkerAlt, FaGlobe, FaEdit, FaCamera, FaUsers, FaCalendar } from 'react-icons/fa';
import ImageUploadModal from './ImageUploadModal';
import EditBusinessNameModal from './EditBusinessNameModal';
import EditBusinessInfoModal from './EditBusinessInfoModal';
import EditTaglineModal from './EditTaglineModal';
import EditAboutModal from './EditAboutModal';

interface Product {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  cost: number;
  price: number;
  photo_url: string;
  availability: string;
  business_id: string;
}

type UserData = {
  id: string;
  name?: string;
  image?: string;
  full_name?: string;
  username?: string;
};

type BusinessData = {
  id: string;
  name?: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  background_image?: string;
  contact_person_name?: string;
  logo?: string;
  tagline?: string;
  size?: string;
  founded_year?: string;
};

function ProductCards({ businessId }: { businessId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/products', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        console.log('Fetch products response:', res.status, data);
        setProducts((data.products || []).filter((p: Product) => p.business_id && p.business_id != '' && p.business_id != '0' && p.business_id != null && p.business_id == businessId));
      } catch (e) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [businessId]);

  if (loading) return <div className="text-gray-500">Loading products...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!products.length) return <div className="text-gray-500">No products found.</div>;

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
      {products.map(product => (
        <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-md transition">
          {product.photo_url ? (
            <div className="-mx-4 mb-3">
              <img src={product.photo_url} alt={product.name} className="w-full h-40 object-cover rounded-t-lg" />
            </div>
          ) : (
            <div className="-mx-4 mb-3">
              <div className="w-full h-40 bg-gray-100 rounded-t-lg flex items-center justify-center text-gray-400">No Image</div>
            </div>
          )}
          <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
          <div className="text-indigo-600 font-bold mb-1">
            {typeof product.price === 'number' && !isNaN(product.price)
              ? `$${product.price.toFixed(2)}`
              : product.price && !isNaN(Number(product.price))
                ? `$${Number(product.price).toFixed(2)}`
                : 'No price'}
          </div>
          <div className="text-gray-600 text-sm line-clamp-3 mb-2">{product.description}</div>
          <div className="mt-auto">
            <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${product.availability === 'Available' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {product.availability}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfileTabs({ user, business }: { user: UserData; business: BusinessData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [businessDescription, setBusinessDescription] = useState(business.description ?? '');
  const [showFullHomeDescription, setShowFullHomeDescription] = useState(false);
  const isOwnProfile = session?.user?.username === user?.username;
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isEditAboutModalOpen, setIsEditAboutModalOpen] = useState(false);
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  const [isEditTaglineModalOpen, setIsEditTaglineModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState(business.name ?? '');
  const [businessTagline, setBusinessTagline] = useState(business.tagline ?? '');
  const [businessWebsite, setBusinessWebsite] = useState(business.website ?? '');
  const [businessLocation, setBusinessLocation] = useState(business.location ?? '');
  const [businessIndustry, setBusinessIndustry] = useState(business.industry ?? '');

  const updates: any[] = [
    {
      id: '1',
      title: 'New Product Launch',
      date: '2024-03-15',
      content: 'We are excited to announce our new product line launching next month!',
    },
    {
      id: '2',
      title: 'Company Milestone',
      date: '2024-03-10',
      content: 'We have reached 10,000 customers! Thank you for your support.',
    },
  ];

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'products', label: 'Products/Services' },
    { id: 'people', label: 'People' },
    { id: 'contact', label: 'Contact' },
    { id: 'updates', label: 'Updates' },
  ];

  const defaultBackground = '/default-background.jpg';
  const defaultLogo = '/default-logo.png';

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/business/${user.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched business data:', { tagline: data.tagline });
        setBusinessDescription(data.description ?? '');
        setBusinessName(data.name ?? '');
        setBusinessTagline(data.tagline ?? '');
        setBusinessWebsite(data.website ?? '');
        setBusinessLocation(data.location ?? '');
        setBusinessIndustry(data.industry ?? '');
      } else {
        console.error('Failed to fetch business data:', await res.json());
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [user.id, fetchBusiness]);

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('userId', user.id);

    const response = await fetch('/api/business/logo', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    console.log('Logo upload response:', response.status, await response.json());
    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }

    window.location.reload();
  };

  const handleBackgroundUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('background', file);
    formData.append('userId', user.id);

    const response = await fetch('/api/business/background', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    console.log('Background upload response:', response.status, await response.json());
    if (!response.ok) {
      throw new Error('Failed to upload background image');
    }

    window.location.reload();
  };

  const handleSaveBusinessInfo = async (website: string, location: string, industry: string) => {
    if (!business || !business.id) {
      console.error('Business ID not found');
      return;
    }
    try {
      if (website) {
        const response = await fetch('/api/business/details', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ field: 'website', value: website, userId: user.id }),
        });
        console.log('Update website response:', response.status, await response.json());
        if (response.ok) {
          setBusinessWebsite(website);
          await fetchBusiness(); // Re-fetch to ensure latest data
        }
      }
      if (location) {
        const response = await fetch('/api/business/details', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ field: 'location', value: location, userId: user.id }),
        });
        console.log('Update location response:', response.status, await response.json());
        if (response.ok) {
          setBusinessLocation(location);
          await fetchBusiness(); // Re-fetch to ensure latest data
        }
      }
      if (industry) {
        const response = await fetch('/api/business/details', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ field: 'industry', value: industry, userId: user.id }),
        });
        console.log('Update industry response:', response.status, await response.json());
        if (response.ok) {
          setBusinessIndustry(industry);
          await fetchBusiness(); // Re-fetch to ensure latest data
        }
      }
    } catch (error) {
      console.error('Error updating business info:', error);
    }
  };

  const handleSaveTagline = async (newTagline: string) => {
    if (!business || !business.id) {
      console.error('Business ID not found');
      return;
    }
    try {
      const response = await fetch('/api/business/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ field: 'tagline', value: newTagline, userId: user.id }),
      });
      console.log('Update tagline response:', response.status, await response.json());
      if (response.ok) {
        setBusinessTagline(newTagline);
        console.log('Tagline saved locally, re-fetching data');
        await fetchBusiness(); // Re-fetch to ensure latest data
      }
    } catch (error) {
      console.error('Error updating tagline:', error);
    }
  };

  const EditButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="ml-2 text-gray-400 hover:text-indigo-600 transition-colors"
    >
      <FaEdit className="w-4 h-4" />
    </button>
  );

  return (
    <div className="bg-[#f3f2ef] min-h-screen w-full">
      <div className="max-w-[1128px] mx-auto grid grid-cols-12 gap-4 pt-6">
        {/* Main Content (Left) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-4">
          <div className="bg-white border-b border-gray-200 rounded-xl overflow-hidden">
            <div className="relative h-48 w-full rounded-t-xl">
              <Image
                src={business.background_image || defaultBackground}
                alt="Background"
                fill
                className="object-cover"
                priority
              />
              {isOwnProfile && (
                <button
                  onClick={() => setIsBackgroundModalOpen(true)}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <FaCamera className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col">
                <div className="relative w-36 h-36 -mt-20 border-4 border-white rounded-full object-cover">
                  <Image
                    src={business.logo || defaultLogo}
                    alt="Logo"
                    fill
                    className="object-cover rounded-full"
                  />
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsLogoModalOpen(true)}
                      className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
                    />
                  )}
                </div>
                {/* Business Name */}
                <div className="flex items-center mb-5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{businessName}</h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditNameModalOpen(true)}
                      className="ml-2 text-gray-400 hover:text-indigo-600"
                      aria-label="Edit business name"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Tagline */}
                <div className="flex items-center mb-5">
                  <h3 className="text-xl font-medium text-gray-600 m-0">{businessTagline || <span className="italic text-gray-400">Add a tagline</span>}</h3>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditTaglineModalOpen(true)}
                      className="ml-2 text-gray-400 hover:text-indigo-600"
                      aria-label="Edit tagline"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 text-sm mb-5">
                  <div className="flex items-center">
                    <FaBriefcase className="w-4 h-4 mr-1" />
                    <span>{businessIndustry}</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                    <span>{businessLocation}</span>
                  </div>
                  <div className="flex items-center">
                    <FaGlobe className="w-4 h-4 mr-1" />
                    <span>{businessWebsite}</span>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditInfoModalOpen(true)}
                        className="ml-2 text-gray-400 hover:text-indigo-600"
                        aria-label="Edit business info"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="flex gap-4 mt-6">
                    <button
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
                      type="button"
                    >
                      Enhance Profile
                    </button>
                    <button
                      className="bg-white text-indigo-600 px-4 py-2 rounded-md border border-indigo-600 hover:bg-indigo-50"
                      type="button"
                    >
                      AI Insights
                    </button>
                  </div>
                )}

                {/* Edit Tagline Modal */}
                <EditTaglineModal
                  isOpen={isEditTaglineModalOpen}
                  currentTagline={businessTagline}
                  onClose={() => setIsEditTaglineModalOpen(false)}
                  onSave={handleSaveTagline}
                />

                {/* Edit Business Info Modal */}
                <EditBusinessInfoModal
                  isOpen={isEditInfoModalOpen}
                  onClose={() => setIsEditInfoModalOpen(false)}
                  onSave={handleSaveBusinessInfo}
                  currentWebsite={businessWebsite}
                  currentLocation={businessLocation}
                  currentIndustry={businessIndustry}
                />

                {/* Edit Business Name Modal */}
                <EditBusinessNameModal
                  isOpen={isEditNameModalOpen}
                  currentName={businessName}
                  onClose={() => setIsEditNameModalOpen(false)}
                  onSave={async (newName: string) => {
                    try {
                      const formData = new FormData();
                      formData.append('userId', user.id);
                      formData.append('name', newName);
                      const res = await fetch('/api/business', {
                        method: 'PUT',
                        body: formData,
                        credentials: 'include',
                      });
                      console.log('Update business name response:', res.status, await res.json());
                      if (!res.ok) throw new Error('Failed to update business name');
                      setBusinessName(newName);
                    } catch (e) {
                      alert('Failed to update business name.');
                    }
                  }}
                />

                {/* Edit About Modal */}
                <EditAboutModal
                  isOpen={isEditAboutModalOpen}
                  currentDescription={businessDescription}
                  onClose={() => setIsEditAboutModalOpen(false)}
                  onSave={async (desc: string) => {
                    try {
                      const res = await fetch('/api/business/details', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ field: 'description', value: desc, userId: user.id }),
                      });
                      console.log('Update about response:', res.status, await res.json());
                      if (!res.ok) throw new Error('Failed to update description');
                      setBusinessDescription(desc);
                    } catch (e) {
                      alert('Failed to update About section.');
                    }
                  }}
                />

                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                      Connect
                    </button>
                    <button className="bg-white text-indigo-600 px-4 py-2 rounded-md border border-indigo-600 hover:bg-indigo-50">
                      Follow
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-gray-200 shadow-none rounded-xl">
            <div>
              <nav className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                <div className="flex space-x-4 overflow-x-auto flex-nowrap w-full scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 ${activeTab === tab.id ? 'text-black font-semibold border-b-2 border-black' : ''}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {isOwnProfile && (
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm font-medium">
                      Create post
                    </button>
                    <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  </div>
                )}
              </nav>
            </div>
            <div className="p-4 sm:p-6">
              {activeTab === 'home' && (
                <div className="space-y-6">
                  {/* About Us Section */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Overview</h3>
                    <div className="mb-4">
                      <div
                        className={`text-gray-600 ${showFullHomeDescription ? '' : 'line-clamp-5'} overflow-hidden`}
                        style={{ display: '-webkit-box', WebkitLineClamp: showFullHomeDescription ? 'none' : 5, WebkitBoxOrient: 'vertical' }}
                        dangerouslySetInnerHTML={{ __html: businessDescription || 'No about info yet.' }}
                      />
                      {businessDescription && (
                        <button
                          className="text-indigo-600 hover:underline text-sm mt-1"
                          onClick={() => setShowFullHomeDescription(v => !v)}
                        >
                          {showFullHomeDescription ? 'View less' : 'View more'}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Updates Section */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Updates</h3>
                    <div className="space-y-4">
                      {updates.map((update) => (
                        <div key={update.id} className="border-b border-gray-200 pb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-md font-medium text-gray-900">
                              {update.title}
                            </h4>
                            <span className="text-sm text-gray-500">{update.date}</span>
                          </div>
                          <p className="mt-2 text-gray-600">{update.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'about' && (
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditAboutModalOpen(true)}
                        className="ml-2 text-gray-400 hover:text-indigo-600"
                        aria-label="Edit about section"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: businessDescription || 'No about info yet.' }} />
                </div>
              )}
              {activeTab === 'products' && (
                <div>
                  <div className="flex items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Products/Services</h2>
                    {isOwnProfile && (
                      <button
                        onClick={() => router.push('/products') }
                        className="ml-2 text-gray-400 hover:text-indigo-600"
                        aria-label="Edit products/services"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <ProductCards businessId={business.id} />
                </div>
              )}
              {activeTab === 'people' && (
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">People</h2>
                    {isOwnProfile && <EditButton onClick={() => {}} />}
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-600">{user.full_name || user.username} - Owner</p>
                    {business.contact_person_name && (
                      <p className="text-gray-600">{business.contact_person_name} - Contact</p>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'contact' && (
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Contact</h2>
                    {isOwnProfile && <EditButton onClick={() => {}} />}
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-600">Website: {businessWebsite}</p>
                    {business.contact_person_name && (
                      <p className="text-gray-600">Contact: {business.contact_person_name}</p>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'updates' && (
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Updates</h2>
                    {isOwnProfile && <EditButton onClick={() => {}} />}
                  </div>
                  <p className="text-gray-600 mt-2">Latest posts and updates coming soon.</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Modals */}
          {isLogoModalOpen && (
            <ImageUploadModal
              isOpen={isLogoModalOpen}
              onClose={() => setIsLogoModalOpen(false)}
              onUpload={handleLogoUpload}
              currentImage={business.logo}
              title="Update Logo"
              userId={user.id}
            />
          )}
          {isBackgroundModalOpen && (
            <ImageUploadModal
              isOpen={isBackgroundModalOpen}
              onClose={() => setIsBackgroundModalOpen(false)}
              onUpload={handleBackgroundUpload}
              currentImage={business.background_image}
              title="Update Background"
              userId={user.id}
            />
          )}
        </div>

        {/* Sidebar (Right) */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4">
          {/* Removed Updates & Insights section as per user request */}
        </aside>
      </div>
    </div>
  );
}