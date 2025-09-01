import { getCustomerById } from '@/lib/data';
import { notFound } from 'next/navigation';
import CustomerDetailClient from '@/components/customer/customer-detail-client';

type CustomerPageProps = {
  params: { id: string };
};

export default async function CustomerPage({ params }: CustomerPageProps) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CustomerDetailClient customer={customer} />
    </div>
  );
}
