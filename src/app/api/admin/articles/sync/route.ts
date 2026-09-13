import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchDevtoArticles, 
  fetchHashnodeArticles, 
  importArticlesToSupabase, 
  type ExtractedArticle 
} from '@/lib/sync/articleExtractor';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      source = 'devto', 
      username, 
      hashnodeHost 
    } = body;

    const devtoApiKey = process.env.DEVTO_API_KEY;
    const hashnodeToken = process.env.HASHNODE_ACCESS_TOKEN;

    let articles: ExtractedArticle[] = [];

    // 1. Fetch from Dev.to
    if (source === 'devto' || source === 'both') {
      try {
        const devtoResults = await fetchDevtoArticles({
          apiKey: devtoApiKey,
          username: username || undefined,
        });
        articles.push(...devtoResults);
      } catch (err: any) {
        return NextResponse.json(
          { error: `Dev.to extraction failed: ${err.message}` },
          { status: 400 }
        );
      }
    }

    // 2. Fetch from Hashnode
    if (source === 'hashnode' || source === 'both') {
      if (!hashnodeHost && !username) {
        return NextResponse.json(
          { error: 'Please provide a Hashnode blog domain or username (e.g. blog.mydomain.com or username)' },
          { status: 400 }
        );
      }

      try {
        const hashnodeResults = await fetchHashnodeArticles({
          hostOrUsername: hashnodeHost || username,
          token: hashnodeToken,
        });
        articles.push(...hashnodeResults);
      } catch (err: any) {
        return NextResponse.json(
          { error: `Hashnode extraction failed: ${err.message}` },
          { status: 400 }
        );
      }
    }

    if (articles.length === 0) {
      return NextResponse.json({
        message: 'No articles were found matching the specified parameters.',
        summary: { total: 0, inserted: 0, updated: 0, errors: [] },
      });
    }

    // 3. Persist directly into Supabase
    const summary = await importArticlesToSupabase(articles);

    return NextResponse.json({
      success: true,
      message: `Extracted ${articles.length} articles and stored them in Supabase.`,
      summary,
    });
  } catch (err: any) {
    console.error('Error in article sync API:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while syncing articles.' },
      { status: 500 }
    );
  }
}
