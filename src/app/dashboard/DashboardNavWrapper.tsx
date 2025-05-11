import DashboardNavbar from '@/components/DashboardNavbar';
import { usePathname } from 'next/navigation';

interface DashboardNavWrapperProps {
  children: React.ReactNode;
}

export default function DashboardNavWrapper({ children }: DashboardNavWrapperProps) {
  console.log('DashboardNavWrapper rendered on pathname:', usePathname());
  return (
    <div className="flex">
      <DashboardNavbar />
      <main className="flex-1 ml-64 mt-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}
