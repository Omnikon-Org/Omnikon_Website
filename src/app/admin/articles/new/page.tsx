import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ArticleEditor } from '@/components/admin/ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: { user } }] = await Promise.all([
    supabase.from('categories').select('id, name').order('name', { ascending: true }),
    supabase.auth.getUser(),
  ]);

  let userRole = 'contributor';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.role) {
      userRole = profile.role;
    }
  }

  return (
    <ArticleEditor
      categories={categories || []}
      userRole={userRole}
    />
  );
}
