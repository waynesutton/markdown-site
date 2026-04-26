import siteConfig from "../config/siteConfig";
import type { SocialLink } from "../config/siteConfig";
import {
  GithubLogo,
  XLogo,
  LinkedinLogo,
  InstagramLogo,
  YoutubeLogo,
  TiktokLogo,
  DiscordLogo,
  Globe,
  Robot,
  FileText,
  type Icon,
} from "@phosphor-icons/react";

// Map platform names to Phosphor icons
// Exported for reuse in header social icons
export const platformIcons: Record<SocialLink["platform"], Icon> = {
  github: GithubLogo,
  twitter: XLogo,
  linkedin: LinkedinLogo,
  instagram: InstagramLogo,
  youtube: YoutubeLogo,
  tiktok: TiktokLogo,
  discord: DiscordLogo,
  website: Globe,
};

// Social footer component
// Displays social icons on left and copyright on right
// Visibility controlled by siteConfig.socialFooter settings and frontmatter showSocialFooter field
export default function SocialFooter() {
  const { socialFooter } = siteConfig;

  // Don't render if social footer is globally disabled
  if (!socialFooter?.enabled) {
    return null;
  }

  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <section className="social-footer">
      <div className="social-footer-content">
        {/* Social links on the left */}
        <div className="social-footer-links">
          {socialFooter.socialLinks.map((link) => {
            const IconComponent = platformIcons[link.platform];
            return (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-footer-link"
                aria-label={`Follow on ${link.platform}`}
              >
                <IconComponent size={20} weight="regular" />
              </a>
            );
          })}
        </div>

        {/* AI discovery links (llms.txt and AGENTS.md) */}
        <div className="social-footer-ai-links">
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="social-footer-ai-link"
            aria-label="LLMs.txt"
            title="LLM discovery file"
          >
            <Robot size={14} weight="regular" />
            <span>llms.txt</span>
          </a>
          <a
            href="/AGENTS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="social-footer-ai-link"
            aria-label="AGENTS.md"
            title="AI agent instructions"
          >
            <FileText size={14} weight="regular" />
            <span>AGENTS.md</span>
          </a>
        </div>

        {/* Copyright on the right */}
        <div className="social-footer-copyright">
          <span className="social-footer-copyright-symbol">&copy;</span>
          <span className="social-footer-copyright-name">
            {socialFooter.copyright.siteName}
          </span>
          {socialFooter.copyright.showYear && (
            <span className="social-footer-copyright-year">{currentYear}</span>
          )}
        </div>
      </div>
    </section>
  );
}
