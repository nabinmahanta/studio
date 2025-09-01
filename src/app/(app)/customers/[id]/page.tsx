import { getCustomerById } from '@/lib/data';
import { notFound } from 'next/navigation';
import CustomerDetailClient from '@/components/customer/customer-detail-client';
import { auth } from '@/lib/firebase';

type CustomerPageProps = {
  params: { id: string };
};

export default function CustomerPage({ params }: CustomerPageProps) {
  // This page needs to be a client component to get the user
  // but we are fetching data on the server.
  // For this app, we'll assume a user is always logged in to view this.
  // In a real-world scenario with server-side rendering, you'd handle session management.
  // We cannot call `getCustomerById` here anymore without the userId.
  // The logic is moved to the client component.

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CustomerDetailClient customerId={params.id} />
    </div>
  );
}
