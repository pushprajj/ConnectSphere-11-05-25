import DashboardNavbar from '@/components/DashboardNavbar';

interface DashboardNavWrapperProps {
  children: React.ReactNode;
}

export default function DashboardNavWrapper({ children }: DashboardNavWrapperProps) {
  return (
    <div className="flex">
      <DashboardNavbar />
      <main className="flex-1 ml-64 mt-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}

