import React, { useState } from 'react';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Facebook, 
  Youtube, 
  Mail, 
  Globe, 
  MessageCircle,
  Send,
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

// Mapping of platform key to SimpleIcons CDN slug
const PLATFORM_CDN_SLUGS: Record<string, string> = {
  github: 'github',
  linkedin: 'linkedin',
  twitter: 'x',
  x: 'x',
  instagram: 'instagram',
  facebook: 'facebook',
  youtube: 'youtube',
  tiktok: 'tiktok',
  whatsapp: 'whatsapp',
  wa: 'whatsapp',
  telegram: 'telegram',
  discord: 'discord',
  spotify: 'spotify',
  steam: 'steam',
  twitch: 'twitch',
  medium: 'medium',
  devto: 'devdotto',
  'dev.to': 'devdotto',
  gitlab: 'gitlab',
  codepen: 'codepen',
  threads: 'threads',
  dribbble: 'dribbble',
  behance: 'behance',
  pinterest: 'pinterest',
  reddit: 'reddit',
  stackoverflow: 'stackoverflow',
  kaggle: 'kaggle',
  leetcode: 'leetcode',
  email: 'gmail',
  gmail: 'gmail',
  paypal: 'paypal',
  buymeacoffee: 'buymeacoffee',
  patreon: 'patreon',
  signal: 'signal',
  line: 'line',
  wechat: 'wechat',
  mastodon: 'mastodon',
  npm: 'npm',
};

// Lucide fallback icons for popular platforms
const LUCIDE_FALLBACKS: Record<string, any> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  email: Mail,
  mail: Mail,
  gmail: Mail,
  whatsapp: MessageCircle,
  wa: MessageCircle,
  telegram: Send,
  phone: Phone,
  website: Globe,
  site: Globe,
  blog: Globe,
  web: Globe,
  portofolio: Globe,
};

export const resolveSocialSlug = (platform?: string, icon?: string, url?: string): string => {
  const p = (platform || '').toLowerCase().trim();
  const i = (icon || '').toLowerCase().trim();
  const u = (url || '').toLowerCase().trim();

  // Helper to test string against keywords
  const match = (str: string) => {
    for (const key of Object.keys(PLATFORM_CDN_SLUGS)) {
      if (str.includes(key)) return PLATFORM_CDN_SLUGS[key];
    }
    return null;
  };

  return match(p) || match(i) || match(u) || '';
};

export const PRESET_SOCIAL_PLATFORMS = [
  { name: 'GitHub', slug: 'github', cdnUrl: 'https://cdn.simpleicons.org/github/white' },
  { name: 'LinkedIn', slug: 'linkedin', cdnUrl: 'https://cdn.simpleicons.org/linkedin/0A66C2' },
  { name: 'Twitter / X', slug: 'x', cdnUrl: 'https://cdn.simpleicons.org/x/white' },
  { name: 'Instagram', slug: 'instagram', cdnUrl: 'https://cdn.simpleicons.org/instagram/E4405F' },
  { name: 'Facebook', slug: 'facebook', cdnUrl: 'https://cdn.simpleicons.org/facebook/1877F2' },
  { name: 'YouTube', slug: 'youtube', cdnUrl: 'https://cdn.simpleicons.org/youtube/FF0000' },
  { name: 'TikTok', slug: 'tiktok', cdnUrl: 'https://cdn.simpleicons.org/tiktok/white' },
  { name: 'WhatsApp', slug: 'whatsapp', cdnUrl: 'https://cdn.simpleicons.org/whatsapp/25D366' },
  { name: 'Telegram', slug: 'telegram', cdnUrl: 'https://cdn.simpleicons.org/telegram/26A5E4' },
  { name: 'Discord', slug: 'discord', cdnUrl: 'https://cdn.simpleicons.org/discord/5865F2' },
  { name: 'Spotify', slug: 'spotify', cdnUrl: 'https://cdn.simpleicons.org/spotify/1DB954' },
  { name: 'Steam', slug: 'steam', cdnUrl: 'https://cdn.simpleicons.org/steam/white' },
  { name: 'Medium', slug: 'medium', cdnUrl: 'https://cdn.simpleicons.org/medium/white' },
  { name: 'Dev.to', slug: 'devdotto', cdnUrl: 'https://cdn.simpleicons.org/devdotto/white' },
  { name: 'Twitch', slug: 'twitch', cdnUrl: 'https://cdn.simpleicons.org/twitch/9146FF' },
  { name: 'GitLab', slug: 'gitlab', cdnUrl: 'https://cdn.simpleicons.org/gitlab/FC6D26' },
  { name: 'CodePen', slug: 'codepen', cdnUrl: 'https://cdn.simpleicons.org/codepen/white' },
  { name: 'Threads', slug: 'threads', cdnUrl: 'https://cdn.simpleicons.org/threads/white' },
  { name: 'Dribbble', slug: 'dribbble', cdnUrl: 'https://cdn.simpleicons.org/dribbble/EA4C89' },
  { name: 'Behance', slug: 'behance', cdnUrl: 'https://cdn.simpleicons.org/behance/1769FF' },
  { name: 'Pinterest', slug: 'pinterest', cdnUrl: 'https://cdn.simpleicons.org/pinterest/BD081C' },
  { name: 'Reddit', slug: 'reddit', cdnUrl: 'https://cdn.simpleicons.org/reddit/FF4500' },
  { name: 'StackOverflow', slug: 'stackoverflow', cdnUrl: 'https://cdn.simpleicons.org/stackoverflow/F48024' },
  { name: 'Kaggle', slug: 'kaggle', cdnUrl: 'https://cdn.simpleicons.org/kaggle/20BEFF' },
  { name: 'LeetCode', slug: 'leetcode', cdnUrl: 'https://cdn.simpleicons.org/leetcode/FFA116' },
  { name: 'Email', slug: 'gmail', cdnUrl: 'https://cdn.simpleicons.org/gmail/EA4335' },
  { name: 'Website', slug: 'website', cdnUrl: '' },
];

export const SocialIcon: React.FC<SocialIconProps> = ({
  platform = '',
  icon = '',
  url = '',
  className = 'w-5 h-5',
  size = 20
}) => {
  const [imgError, setImgError] = useState(false);

  // 1. Direct Custom Image URL in `icon` prop
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

  // 2. Resolve SimpleIcons CDN slug
  const slug = resolveSocialSlug(platform, icon, url);

  if (slug && !imgError) {
    const BRAND_HEX_COLORS: Record<string, string> = {
      linkedin: '0077b5',
      instagram: 'e4405f',
      facebook: '1877f2',
      youtube: 'ff0000',
      whatsapp: '25d366',
      telegram: '26a5e4',
      discord: '5865f2',
      spotify: '1db954',
      twitch: '9146ff',
      gitlab: 'fc6d26',
      dribbble: 'ea4c89',
      behance: '1769ff',
      pinterest: 'bd081c',
      reddit: 'ff4500',
      stackoverflow: 'f48024',
      kaggle: '20beff',
      leetcode: 'ffa116',
      gmail: 'ea4335',
      email: 'ea4335',
      github: 'white',
      x: 'white',
      twitter: 'white',
      tiktok: 'white',
      steam: 'white',
      medium: 'white',
      devdotto: 'white',
      codepen: 'white',
      threads: 'white',
    };

    const hexColor = BRAND_HEX_COLORS[slug] || 'white';
    const cdnUrl = hexColor === 'white' 
      ? `https://cdn.simpleicons.org/${slug}/white`
      : `https://cdn.simpleicons.org/${slug}/${hexColor}`;

    return (
      <img
        src={cdnUrl}
        alt={platform || slug}
        className={`${className} object-contain transition-transform duration-300 hover:scale-110`}
        style={{ width: size, height: size }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!target.dataset.fallbackTried) {
            target.dataset.fallbackTried = 'true';
            target.src = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
          } else {
            setImgError(true);
          }
        }}
      />
    );
  }

  // 3. Check Lucide fallback
  const cleanKey = (platform || icon || '').toLowerCase();
  for (const k of Object.keys(LUCIDE_FALLBACKS)) {
    if (cleanKey.includes(k) || (url && url.toLowerCase().includes(k))) {
      const LucideComp = LUCIDE_FALLBACKS[k];
      return <LucideComp className={className} size={size} />;
    }
  }

  // 4. Ultimate fallback
  return <LinkIcon className={className} size={size} />;
};
