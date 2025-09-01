import DashboardClient from '@/components/dashboard/dashboard-client';

export default function DashboardPage() {
  // Data fetching is now handled on the client-side to get the current user's UID.
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground mb-6">
        Dashboard
      </h1>
      <DashboardClient />
    </div>
  );
}
