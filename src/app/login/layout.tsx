import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Authenticate',
  description: 'Sign in or register your developer account to access the Omnikon dashboard.',
  canonicalUrl: '/login',
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
