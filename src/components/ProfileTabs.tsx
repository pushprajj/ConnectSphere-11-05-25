// src/components/ProfileTabs.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaBriefcase, FaMapMarkerAlt, FaGlobe, FaEdit, FaCamera, FaPhone, FaEnvelope, FaClock, FaUser } from 'react-icons/fa';
import ImageUploadModal from './ImageUploadModal';
import EditBusinessNameModal from './EditBusinessNameModal';
import EditBusinessInfoModal from './EditBusinessInfoModal';
import EditTaglineModal from './EditTaglineModal';
import EditAboutModal from './EditAboutModal';
import Script from 'next/script'; // Import Script component for loading Google Maps API

// Add type declaration for window.google to avoid property access errors
declare global {
  interface Window {
    google: any;
  }
}

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
  hours?: string;
  contact_phone?: string;
  contact_email?: string;
  business_street?: string;
  business_city?: string;
  business_state?: string;
  business_zip_code?: string;
  business_country?: string;
};

function ProductCards({ businessId, limit = 10 }: { businessId: string, limit?: number }) {
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
        setProducts((data.products || []).filter((p: Product) => p.business_id && p.business_id != '' && p.business_id != '0' && p.business_id != null && p.business_id == businessId).slice(0, limit));
      } catch (e) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [businessId, limit]);

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
  const [contact, setContact] = useState({
    contact_person: business.contact_person_name ?? '', // New field for contact person's name
    street: business.business_street ?? '',
    city: business.business_city ?? '',
    state: business.business_state ?? '',
    business_zip_code: business.business_zip_code ?? '',
    country: business.business_country ?? '',
    phone: business.contact_phone ?? '',
    email: business.contact_email ?? '',
    website: business.website ?? ''
  });
  const [editContact, setEditContact] = useState(contact);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    if (!isContactModalOpen) {
      setContact({
        contact_person: business.contact_person_name ?? '', // New field for contact person's name
        street: business.business_street ?? '',
        city: business.business_city ?? '',
        state: business.business_state ?? '',
        business_zip_code: business.business_zip_code ?? '',
        country: business.business_country ?? '',
        phone: business.contact_phone ?? '',
        email: business.contact_email ?? '',
        website: business.website ?? ''
      });
    }
  }, [business, isContactModalOpen]);

  useEffect(() => {
    console.log('Contact state updated:', contact);
  }, [contact]);

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
        console.log('Fetched business data:', data);
        setBusinessDescription(data.description ?? '');
        setBusinessName(data.name ?? '');
        setBusinessTagline(data.tagline ?? '');
        setBusinessWebsite(data.website ?? '');
        setBusinessLocation(data.location ?? '');
        setBusinessIndustry(data.industry ?? '');
        setContact({ // Sync contact state with fetched data
          contact_person: data.contact_person_name ?? '', // New field for contact person's name
          street: data.business_street ?? '',
          city: data.business_city ?? '',
          state: data.business_state ?? '',
          business_zip_code: data.business_zip_code ?? '',
          country: data.business_country ?? '',
          phone: data.contact_phone ?? '',
          email: data.contact_email ?? '',
          website: data.website ?? ''
        });
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

  const handleSaveBusinessName = async (newName: string) => {
    if (!business || !business.id) {
      console.error('Business ID not found');
      return;
    }
    try {
      const response = await fetch('/api/business/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ businessId: business.id, updates: { name: newName } }),
      });
      console.log('Update business name response:', response.status, await response.json());
      if (response.ok) {
        await fetchBusiness(); // Re-fetch to ensure latest data
      }
    } catch (error) {
      console.error('Error updating business name:', error);
    }
  };

  const handleSaveBusinessInfo = async (website: string, location: string, industry: string) => {
    if (!business || !business.id) {
      console.error('Business ID not found');
      return;
    }
    try {
      const updates: Record<string, any> = {};
      if (website) updates.website = website;
      if (location) updates.location = location;
      if (industry) updates.industry = industry;
      if (Object.keys(updates).length === 0) return;
      console.log('Sending update request for businessId:', business.id, 'with updates:', updates);
      const response = await fetch('/api/business/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ businessId: business.id, updates }),
      });
      console.log('API response status:', response.status, 'response body:', await response.json());
      if (response.ok) {
        await fetchBusiness(); // Re-fetch to ensure latest data
      } else {
        console.error('API update failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error in handleSaveBusinessInfo:', error);
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
        body: JSON.stringify({ businessId: business.id, updates: { tagline: newTagline } }),
      });
      console.log('Update tagline response:', response.status, await response.json());
      if (response.ok) {
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

  const mapContainerRef = useRef(null);
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);

  useEffect(() => {
    if (isGoogleApiLoaded) {
      if (mapContainerRef.current && window.google) {
        const geocoder = new window.google.maps.Geocoder();
        const address = `${contact.street}, ${contact.city}, ${contact.state}, ${contact.business_zip_code}, ${contact.country}`;
        console.log('Geocoding address:', address);
        geocoder.geocode({ address: address }, (results: any, status: string) => {
          console.log('Geocode status:', status);
          if (status === 'OK' && results[0]) {
            console.log('Geocode success, location:', results[0].geometry.location);
            new window.google.maps.Map(mapContainerRef.current, {
              center: results[0].geometry.location,
              zoom: 14
            });
          } else {
            console.error('Geocode failed: ' + status + ', using default location');
            new window.google.maps.Map(mapContainerRef.current, {
              center: { lat: -34.397, lng: 150.644 },
              zoom: 8
            });
          }
        });
      } else {
        console.error('Map container or Google API not available');
      }
    }
  }, [isGoogleApiLoaded, contact.street, contact.city, contact.state, contact.business_zip_code, contact.country]);

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
                <div className="flex justify-between items-start mb-5">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
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
                    <div className="flex items-center mb-2">
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
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 text-sm">
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
                  </div>
                  <div className="flex flex-col items-end text-sm text-gray-500">
                    <div className="flex items-center mb-1">
                      <FaPhone className="mr-1" /> {contact.phone || '123-456-7890'}
                    </div>
                    <div className="flex items-center mb-1">
                      <FaEnvelope className="mr-1" /> {contact.email || 'info@company.com'}
                    </div>
                    <div className="flex items-center mb-1">
                      <FaMapMarkerAlt className="mr-1" /> {contact.street}, {contact.city}, {contact.state} {contact.business_zip_code}, {contact.country}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1" /> {business.hours || 'Mon-Fri: 9 AM - 5 PM'}
                    </div>
                  </div>
                </div>

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
                  onSave={handleSaveBusinessName}
                />

                {/* Edit About Modal */}
                <EditAboutModal
                  isOpen={isEditAboutModalOpen}
                  currentDescription={businessDescription}
                  onClose={() => setIsEditAboutModalOpen(false)}
                  onSave={async (desc: string) => {
                    if (!business || !business.id) {
                      console.error('Business ID not found for description update');
                      return;
                    }
                    try {
                      console.log('Sending description update request for businessId:', business.id, 'with description:', desc);
                      const response = await fetch('/api/business/details', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ businessId: business.id, updates: { description: desc } }),
                      });
                      console.log('API response for description update: status', response.status, 'body:', await response.json());
                      if (response.ok) {
                        setBusinessDescription(desc);
                        await fetchBusiness(); // Re-fetch to ensure latest data
                      } else {
                        console.error('Description update failed with status:', response.status);
                      }
                    } catch (error) {
                      console.error('Error updating description:', error);
                    }
                  }}
                />

                {/* Edit Contact Modal */}
                {isContactModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded shadow-lg w-96">
                      <h2 className="text-lg font-bold mb-2">Edit Contact</h2>
                      <input key="contact_person-input" type="text" value={editContact.contact_person} onChange={(e) => { const newValue = e.target.value; console.log('Contact Person changed from', editContact.contact_person, 'to', newValue); setEditContact(prev => ({ ...prev, contact_person: newValue })); }} className="border p-2 w-full mb-2" placeholder="Contact Person" />
                      <input key="street-input" type="text" value={editContact.street} onChange={(e) => { const newValue = e.target.value; console.log('Street changed from', editContact.street, 'to', newValue); setEditContact(prev => ({ ...prev, street: newValue })); }} className="border p-2 w-full mb-2" placeholder="Street" />
                      <input key="city-input" type="text" value={editContact.city} onChange={(e) => { const newValue = e.target.value; console.log('City changed from', editContact.city, 'to', newValue); setEditContact(prev => ({ ...prev, city: newValue })); }} className="border p-2 w-full mb-2" placeholder="City" />
                      <input key="state-input" type="text" value={editContact.state} onChange={(e) => { const newValue = e.target.value; console.log('State changed from', editContact.state, 'to', newValue); setEditContact(prev => ({ ...prev, state: newValue })); }} className="border p-2 w-full mb-2" placeholder="State" />
                      <input key="business_zip_code-input" type="text" value={editContact.business_zip_code} onChange={(e) => { const newValue = e.target.value; console.log('Business Zip Code changed from', editContact.business_zip_code, 'to', newValue); setEditContact(prev => ({ ...prev, business_zip_code: newValue })); }} className="border p-2 w-full mb-2" placeholder="Zip/Post Code" />
                      <input key="country-input" type="text" value={editContact.country} onChange={(e) => { const newValue = e.target.value; console.log('Country changed from', editContact.country, 'to', newValue); setEditContact(prev => ({ ...prev, country: newValue })); }} className="border p-2 w-full mb-2" placeholder="Country" />
                      <input key="phone-input" type="text" value={editContact.phone} onChange={(e) => { const newValue = e.target.value; console.log('Phone changed from', editContact.phone, 'to', newValue); setEditContact(prev => ({ ...prev, phone: newValue })); }} className="border p-2 w-full mb-2" placeholder="Phone" />
                      <input key="email-input" type="text" value={editContact.email} onChange={(e) => { const newValue = e.target.value; console.log('Email changed from', editContact.email, 'to', newValue); setEditContact(prev => ({ ...prev, email: newValue })); }} className="border p-2 w-full mb-2" placeholder="Email" />
                      <input key="website-input" type="text" value={editContact.website} onChange={(e) => { const newValue = e.target.value; console.log('Website changed from', editContact.website, 'to', newValue); setEditContact(prev => ({ ...prev, website: newValue })); }} className="border p-2 w-full mb-2" placeholder="Website" />
                      <button onClick={async () => {
                        console.log('Sending contact update to API:', { businessId: business.id, updates: editContact });
                        try {
                          const response = await fetch('/api/business/details', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ businessId: business.id, updates: {
                              contact_person: editContact.contact_person, // Added new field
                              business_street: editContact.street,
                              business_city: editContact.city,
                              business_state: editContact.state,
                              business_zip_code: editContact.business_zip_code,
                              business_country: editContact.country,
                              contact_phone: editContact.phone,
                              contact_email: editContact.email,
                              website: editContact.website
                            } })
                          });
                          const responseData = await response.json();
                          console.log('API response for contact save:', responseData);
                          if (response.ok) {
                            setContact(editContact); // Update main contact state
                            await fetchBusiness(); // Sync with server
                            setIsContactModalOpen(false);
                          } else {
                            console.error('Failed to save contact, status:', response.status, 'data:', responseData);
                            alert('Failed to save contact. Please check console for details.');
                          }
                        } catch (error) {
                          console.error('Error during contact save API call:', error);
                          alert('Error saving contact. Please check console for details.');
                        }
                      }} className="bg-blue-500 text-white px-4 py-2 mr-2">Save</button>
                      <button onClick={() => setIsContactModalOpen(false)} className="bg-gray-300 px-4 py-2">Cancel</button>
                    </div>
                  </div>
                )}
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
                <div>
                  {/* Existing home tab content */}
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
                    {/* Featured Products Section */}
                    <div className="bg-white shadow rounded-lg p-6 mt-8">
                      <h2 className="text-lg font-semibold mb-4">Featured Products</h2>
                      <ProductCards businessId={business.id} limit={4} />
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('products'); }} className="text-blue-600 hover:underline mt-2 inline-block">View more</a>
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
                  <div className="space-y-4">
                    <div className="p-4 border rounded shadow-md">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        Contact Details
                        {isOwnProfile && (
                          <button
                            onClick={() => { console.log('Opening contact modal, copying current contact:', contact); setEditContact({ ...contact }); setIsContactModalOpen(true); }}
                            className="ml-2 text-gray-500 hover:text-blue-500"
                            aria-label="Edit Contact"
                          >
                            <FaEdit />
                          </button>
                        )}
                      </h3>
                      {business.contact_person_name && (
                        <p className="text-gray-600 flex items-center mb-1">
                          <FaUser className="mr-1" /> Contact Person: {business.contact_person_name}
                        </p>
                      )}
                      <p className="text-gray-600 flex items-center mb-1">
                        <FaMapMarkerAlt className="mr-1" /> Address: {contact.street}, {contact.city}, {contact.state} {contact.business_zip_code}, {contact.country}
                      </p>
                      <p className="text-gray-600 flex items-center mb-1">
                        <FaPhone className="mr-1" /> Phone: {contact.phone}
                      </p>
                      <p className="text-gray-600 flex items-center mb-1">
                        <FaEnvelope className="mr-1" /> Email: {contact.email}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <FaGlobe className="mr-1" /> Website: {contact.website}
                      </p>
                    </div>
                    <div className="p-4 border rounded shadow-md mt-4">
                      <h3 className="text-lg font-semibold mb-2">Map Location</h3>
                      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                        <div>
                          <Script
                            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                            strategy="afterInteractive"
                            onLoad={() => {
                              console.log('Google Maps API loaded');
                              setIsGoogleApiLoaded(true);
                            }}
                          />
                          <div ref={mapContainerRef} style={{ height: '400px', width: '100%' }}></div>
                        </div>
                      ) : (
                        <p className="text-red-500">Dynamic map not available. Please ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.</p>
                      )}
                    </div>
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