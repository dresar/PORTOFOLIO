import React, { useState } from 'react';
import { 
  Github, 
  Linkedin, 
  Facebook, 
  Youtube, 
  Mail, 
  Globe, 
  Phone,
  Link as LinkIcon 
} from 'lucide-react';

interface SocialIconProps {
  platform?: string;
  icon?: string;
  url?: string;
  className?: string;
  size?: number;
}

// ── High-Precision SVG Vectors for Brand Accuracy & Zero-Latency ─────────────

const TikTokIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.38a6.34 6.34 0 0 0-.85-.06A6.33 6.33 0 0 0 3.15 15.65a6.33 6.33 0 0 0 6.33 6.34 6.33 6.33 0 0 0 6.33-6.34V9.87a8.28 8.28 0 0 0 5-1.74l-1.22-1.44z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z" />
  </svg>
);

const TelegramIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

const XIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const DiscordIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const SpotifyIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.308c-.215.352-.674.464-1.026.248-2.812-1.718-6.352-2.107-10.522-1.155-.403.092-.804-.158-.896-.561-.092-.403.158-.804.561-.896 4.566-1.044 8.487-.604 11.635 1.338.352.216.464.674.248 1.026zm1.47-3.264c-.27.44-.848.577-1.288.307-3.218-1.978-8.125-2.55-11.93-1.394-.498.15-1.026-.134-1.176-.632-.151-.498.134-1.026.632-1.176 4.35-1.32 9.774-.68 13.455 1.607.44.27.577.848.307 1.288zm.127-3.41c-3.858-2.29-10.222-2.502-13.896-1.387-.59.18-1.22-.16-1.399-.75-.18-.59.16-1.22.75-1.4 4.225-1.282 11.258-1.036 15.688 1.593.53.315.703 1.002.388 1.533-.315.53-1.002.703-1.531.411z" />
  </svg>
);

// ── Strict & Safe Platform Detector ─────────────────────────────────────────

export const detectPlatform = (platform?: string, icon?: string, url?: string): string => {
  const p = (platform || '').toLowerCase().trim();
  const i = (icon || '').toLowerCase().trim();
  const u = (url || '').toLowerCase().trim();

  // 1. Direct platform name matching
  if (p === 'telegram' || p === 'tg') return 'telegram';
  if (p === 'tiktok' || p === 'tik tok') return 'tiktok';
  if (p === 'whatsapp' || p === 'wa' || p === 'wa.me') return 'whatsapp';
  if (p === 'instagram' || p === 'ig') return 'instagram';
  if (p === 'linkedin') return 'linkedin';
  if (p === 'github' || p === 'gh') return 'github';
  if (p === 'youtube' || p === 'yt') return 'youtube';
  if (p === 'facebook' || p === 'fb') return 'facebook';
  if (p === 'twitter' || p === 'x' || p === 'twitter / x' || p === 'x / twitter') return 'x';
  if (p === 'discord') return 'discord';
  if (p === 'spotify') return 'spotify';
  if (p === 'email' || p === 'mail' || p === 'gmail') return 'email';
  if (p === 'phone' || p === 'tel' || p === 'telepon') return 'phone';
  if (p === 'website' || p === 'web' || p === 'site' || p === 'portofolio' || p === 'portfolio') return 'website';

  // 2. Direct icon name matching
  if (i === 'telegram' || i === 'send') return 'telegram';
  if (i === 'tiktok') return 'tiktok';
  if (i === 'whatsapp' || i === 'message-circle' || i === 'phone') return 'whatsapp';
  if (i === 'instagram') return 'instagram';
  if (i === 'linkedin') return 'linkedin';
  if (i === 'github') return 'github';
  if (i === 'youtube') return 'youtube';
  if (i === 'facebook') return 'facebook';
  if (i === 'twitter' || i === 'x') return 'x';
  if (i === 'discord') return 'discord';
  if (i === 'spotify') return 'spotify';
  if (i === 'mail' || i === 'email') return 'email';
  if (i === 'globe' || i === 'website') return 'website';

  // 3. Strict URL hostname / domain matching (NEVER match single letters like 'x' against the whole url)
  if (u) {
    try {
      const parsed = new URL(u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`);
      const host = parsed.hostname.toLowerCase();
      
      if (host.includes('t.me') || host.includes('telegram.me') || host.includes('telegram.org')) return 'telegram';
      if (host.includes('tiktok.com')) return 'tiktok';
      if (host.includes('whatsapp.com') || host.includes('wa.me')) return 'whatsapp';
      if (host.includes('instagram.com')) return 'instagram';
      if (host.includes('linkedin.com')) return 'linkedin';
      if (host.includes('github.com')) return 'github';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
      if (host.includes('facebook.com') || host.includes('fb.com')) return 'facebook';
      if (host === 'x.com' || host.endsWith('.x.com') || host.includes('twitter.com')) return 'x';
      if (host.includes('discord.gg') || host.includes('discord.com')) return 'discord';
      if (host.includes('spotify.com')) return 'spotify';
      if (parsed.protocol === 'mailto:') return 'email';
      if (parsed.protocol === 'tel:') return 'phone';
    } catch {
      // Fallback domain inspection for non-standard URLs
      if (u.includes('t.me/') || u.includes('telegram.me/')) return 'telegram';
      if (u.includes('tiktok.com/')) return 'tiktok';
      if (u.includes('wa.me/') || u.includes('whatsapp.com/')) return 'whatsapp';
      if (u.includes('instagram.com/')) return 'instagram';
      if (u.includes('linkedin.com/')) return 'linkedin';
      if (u.includes('github.com/')) return 'github';
      if (u.includes('youtube.com/') || u.includes('youtu.be/')) return 'youtube';
      if (u.includes('facebook.com/')) return 'facebook';
      if (u.includes('twitter.com/') || u.includes('x.com/')) return 'x';
    }
  }

  // Fallback check on string boundaries
  if (p.includes('telegram')) return 'telegram';
  if (p.includes('tiktok')) return 'tiktok';
  if (p.includes('whatsapp')) return 'whatsapp';
  if (p.includes('instagram')) return 'instagram';
  if (p.includes('linkedin')) return 'linkedin';
  if (p.includes('github')) return 'github';
  if (p.includes('youtube')) return 'youtube';
  if (p.includes('facebook')) return 'facebook';

  return 'website';
};

// Preset list for Admin panel selection
export const PRESET_SOCIAL_PLATFORMS = [
  { name: 'GitHub', slug: 'github' },
  { name: 'LinkedIn', slug: 'linkedin' },
  { name: 'TikTok', slug: 'tiktok' },
  { name: 'Instagram', slug: 'instagram' },
  { name: 'Telegram', slug: 'telegram' },
  { name: 'WhatsApp', slug: 'whatsapp' },
  { name: 'YouTube', slug: 'youtube' },
  { name: 'Facebook', slug: 'facebook' },
  { name: 'Twitter / X', slug: 'x' },
  { name: 'Discord', slug: 'discord' },
  { name: 'Spotify', slug: 'spotify' },
  { name: 'Email', slug: 'email' },
  { name: 'Website', slug: 'website' },
];

export const SocialIcon: React.FC<SocialIconProps> = ({
  platform = '',
  icon = '',
  url = '',
  className = 'w-5 h-5',
  size = 20
}) => {
  const [imgError, setImgError] = useState(false);

  // 1. Direct Custom Image URL in `icon` prop (e.g. uploaded CDN asset)
  if (icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:'))) {
    if (!imgError) {
      return (
        <img
          src={icon}
          alt={platform || 'Social'}
          className={`${className} object-contain`}
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
        />
      );
    }
  }

  // 2. Identify platform strictly & accurately
  const resolved = detectPlatform(platform, icon, url);

  switch (resolved) {
    case 'tiktok':
      return <TikTokIcon className={className} size={size} />;
    case 'whatsapp':
      return <WhatsAppIcon className={className} size={size} />;
    case 'telegram':
      return <TelegramIcon className={className} size={size} />;
    case 'instagram':
      return <InstagramIcon className={className} size={size} />;
    case 'x':
      return <XIcon className={className} size={size} />;
    case 'github':
      return <Github className={className} size={size} />;
    case 'linkedin':
      return <Linkedin className={className} size={size} />;
    case 'youtube':
      return <Youtube className={className} size={size} />;
    case 'facebook':
      return <Facebook className={className} size={size} />;
    case 'discord':
      return <DiscordIcon className={className} size={size} />;
    case 'spotify':
      return <SpotifyIcon className={className} size={size} />;
    case 'email':
      return <Mail className={className} size={size} />;
    case 'phone':
      return <Phone className={className} size={size} />;
    case 'website':
      return <Globe className={className} size={size} />;
    default:
      return <LinkIcon className={className} size={size} />;
  }
};
