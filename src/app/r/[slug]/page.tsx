import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface ReferralPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ReferralPage({ params }: ReferralPageProps) {
  const { slug } = await params;
  const sourcePath = `/r/${slug}`;

  try {
    const supabase = await createClient();
    const { data: redirectEntry } = await supabase
      .from('redirects')
      .select('destination_path, status_code')
      .eq('source_path', sourcePath)
      .maybeSingle();

    if (redirectEntry?.destination_path) {
      redirect(redirectEntry.destination_path);
    }
  } catch {
    // If Supabase is unconfigured or no redirect entry exists, fallback to home root.
  }

  redirect('/');
}
