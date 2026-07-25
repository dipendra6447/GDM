import { redirect } from 'next/navigation';

export default async function LegacyEmployerPostJobRedirect({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const destination = tab ? `/dashboard?tab=${encodeURIComponent(tab)}` : '/dashboard';
  redirect(destination);
}
