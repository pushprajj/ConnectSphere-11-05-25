'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import BusinessDetails from '@/components/BusinessDetails';
import ProfileTabs from '@/components/ProfileTabs';

type PageParams = {
  [key: string]: string | string[];
  username: string;
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const params = useParams<PageParams>();
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const username = params?.username;
        
        if (!username) {
          throw new Error('Username is required');
        }

        // Fetch user data
        const userResponse = await fetch(`/api/users/${username}`);
        if (!userResponse.ok) {
          throw new Error('User not found');
        }
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch business data
        const businessResponse = await fetch(`/api/business/${userData.id}`);
        if (!businessResponse.ok) {
          throw new Error('Business data not found');
        }
        const businessData = await businessResponse.json();
        setBusiness(businessData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (params?.username) {
      fetchProfile();
    }
  }, [params?.username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!user || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileTabs user={user} business={business} />
    </div>
  );
} 