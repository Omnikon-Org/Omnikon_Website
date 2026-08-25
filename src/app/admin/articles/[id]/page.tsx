import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArticleEditor } from '@/components/admin/ArticleEditor';

export const dynamic = 'force-dynamic';

interface EditArticleProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticleProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: article },
    { data: categories },
    { data: { user } },
  ] = await Promise.all([
    supabase.from('articles').select('*').eq('id', id).maybeSingle(),
    supabase.from('categories').select('id, name').order('name', { ascending: true }),
    supabase.auth.getUser(),
  ]);

  if (!article) {
    notFound();
  }

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
      initialData={article}
      categories={categories || []}
      userRole={userRole}
    />
  );
}
