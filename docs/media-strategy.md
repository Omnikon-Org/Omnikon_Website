# Omnikon 2.0 — Media & Asset Strategy Specification

## 1. Storage Architecture Overview
Omnikon 2.0 uses **Supabase Storage** for hosting user uploads, technical article graphics, open-source project visual teardowns, event banners, author avatars, and OpenGraph social cards. Public assets are served over CDN edge nodes and rendered via Next.js `<Image />` components with automatic format conversion (`WebP`/`AVIF`) and layout-shift prevention.

---

## 2. Supabase Storage Buckets Structure

```
Supabase Storage Buckets
├── article-images/          # Public: Article & tutorial illustrations, code diagrams
│   └── {article-id}/
│       ├── cover.webp
│       └── diagram-1.webp
├── project-images/          # Public: Project logos, screenshots, UI teardowns
│   └── {project-id}/
│       ├── banner.webp
│       └── screenshot-1.webp
├── event-images/            # Public: Hackathon banners, track graphics, recaps
│   └── {event-id}/
│       └── hero-banner.webp
├── avatars/                 # Public: User profile avatars
│   └── {user-id}/
│       └── avatar.webp
└── og-images/               # Public: Dynamic OpenGraph social card graphics
    └── og-{slug}.webp
```

---

## 3. Storage Bucket Permissions & RLS Policies

| Bucket Name | Public Access | Allowed File Types | Max File Size | Upload Authorization | Delete Authorization |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `article-images` | ✅ Public | `.webp`, `.png`, `.jpg`, `.svg` | 5 MB | `contributor`, `editor`, `admin` | Author / `editor` |
| `project-images` | ✅ Public | `.webp`, `.png`, `.jpg`, `.svg` | 5 MB | `contributor`, `editor`, `admin` | Author / `editor` |
| `event-images` | ✅ Public | `.webp`, `.png`, `.jpg`, `.svg` | 10 MB | `editor`, `admin` | `editor`, `admin` |
| `avatars` | ✅ Public | `.webp`, `.png`, `.jpg` | 2 MB | Authenticated User (Own Folder) | Authenticated User |
| `og-images` | ✅ Public | `.webp`, `.png` | 2 MB | Server Route / `editor` | `admin` |

---

## 4. Image Optimization Protocols

### A. Format Standards
- All uploaded images are converted to compressed **WebP** or **AVIF** formats prior to persistent storage.
- SVGs are permitted for clean architectural diagrams and vector icons.

### B. Next.js `<Image />` Component Standards
```tsx
import Image from 'next/image';

export function ArticleCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-[360px] bg-[#0A0A0A] border border-[#27272A] overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
        priority
        className="object-cover"
      />
    </div>
  );
}
```

### C. Layout Shift (CLS) Protection
- All dynamic images must specify explicit `width` and `height` properties or use `fill` within a pre-dimensioned CSS container to prevent page layout jumps during rendering.
