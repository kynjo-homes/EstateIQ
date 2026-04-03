/**
 * Footer social URLs. Override with NEXT_PUBLIC_SOCIAL_TWITTER, LINKEDIN, GITHUB in env.
 */
export const footerSocialLinks = [
  {
    label: 'X (Twitter)',
    href:
      process.env.NEXT_PUBLIC_SOCIAL_TWITTER?.trim() ||
      'https://x.com/KynjoHomes',
  },
  {
    label: 'LinkedIn',
    href:
      process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN?.trim() ||
      'https://www.linkedin.com/company/kynjo-homes',
  },
  {
    label: 'GitHub',
    href:
      process.env.NEXT_PUBLIC_SOCIAL_GITHUB?.trim() ||
      'https://github.com/kynjohomes',
  },
] as const
