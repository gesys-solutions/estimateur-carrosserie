import { ClientDetailView } from "@/components/clients";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  return <ClientDetailView clientId={id} />;
}
