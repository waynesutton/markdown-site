import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import DocsLayout from "../components/DocsLayout";
import BlogPost from "../components/BlogPost";
import { extractHeadings } from "../utils/extractHeadings";
import siteConfig from "../config/siteConfig";
import { ArrowRight } from "lucide-react";

export default function DocsPage() {
  // Fetch landing page content (checks pages first, then posts)
  const landingPage = useQuery(api.pages.getDocsLandingPage);
  const landingPost = useQuery(api.posts.getDocsLandingPost);

  // Fetch all docs items for fallback (first doc if no landing)
  const docsPosts = useQuery(api.posts.getDocsPosts);
  const docsPages = useQuery(api.pages.getDocsPages);

  // Determine which content to use: page takes priority over post
  const landingContent = landingPage || landingPost;

  // Get first doc item as fallback if no landing page is set
  const allDocsItems = [
    ...(docsPages || []),
    ...(docsPosts || []),
  ].sort((a, b) => {
    const orderA = a.docsSectionOrder ?? 999;
    const orderB = b.docsSectionOrder ?? 999;
    return orderA - orderB;
  });
  const firstDocSlug = allDocsItems.length > 0 ? allDocsItems[0].slug : null;

  // Update page title
  useEffect(() => {
    const title = landingContent?.title || siteConfig.docsSection?.title || "Documentation";
    document.title = `${title} | ${siteConfig.name}`;
    return () => {
      document.title = siteConfig.name;
    };
  }, [landingContent]);

  // Loading state - show skeleton to prevent flash
  if (
    landingPage === undefined ||
    landingPost === undefined ||
    docsPosts === undefined ||
    docsPages === undefined
  ) {
    return (
      <DocsLayout headings={[]} currentSlug="">
        <article className="docs-article">
          <div className="docs-article-loading">
            <div className="docs-loading-skeleton docs-loading-title" />
            <div className="docs-loading-skeleton docs-loading-text" />
            <div className="docs-loading-skeleton docs-loading-text" />
            <div className="docs-loading-skeleton docs-loading-text-short" />
          </div>
        </article>
      </DocsLayout>
    );
  }

  // If we have landing content, render it with DocsLayout
  if (landingContent) {
    const headings = extractHeadings(landingContent.content);

    return (
      <DocsLayout headings={headings} currentSlug={landingContent.slug}>
        <article className="docs-article">
          <header className="docs-article-header">
            <h1 className="docs-article-title">{landingContent.title}</h1>
            {"description" in landingContent && landingContent.description && (
              <p className="docs-article-description">
                {landingContent.description}
              </p>
            )}
            {"excerpt" in landingContent && landingContent.excerpt && (
              <p className="docs-article-description">{landingContent.excerpt}</p>
            )}
          </header>
          <BlogPost
            content={landingContent.content}
            slug={landingContent.slug}
            pageType={"date" in landingContent ? "post" : "page"}
          />
        </article>
      </DocsLayout>
    );
  }

  // No landing page set - show a getting started guide
  return (
    <DocsLayout headings={[]} currentSlug="">
      <article className="docs-article">
        <header className="docs-article-header">
          <h1 className="docs-article-title">
            {siteConfig.docsSection?.title || "Documentation"}
          </h1>
          <p className="docs-article-description">
            Welcome to the documentation section.
          </p>
        </header>

        <div className="docs-landing-content">
          {allDocsItems.length > 0 ? (
            <>
              <p>Browse the documentation using the sidebar navigation, or get started with one of these pages:</p>
              <ul className="docs-landing-list">
                {allDocsItems.slice(0, 5).map((item) => (
                  <li key={item.slug} className="docs-landing-item">
                    <Link to={`/${item.slug}`} className="docs-landing-link">
                      <span>{item.title}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
              {allDocsItems.length > 5 && (
                <p className="docs-landing-more">
                  And {allDocsItems.length - 5} more pages in the sidebar...
                </p>
              )}
            </>
          ) : (
            <div className="docs-landing-empty">
              <p>No documentation pages have been created yet.</p>
              <p>
                To add a page to the docs section, add{" "}
                <code>docsSection: true</code> to the frontmatter of any
                markdown file.
              </p>
            </div>
          )}
        </div>
      </article>
    </DocsLayout>
  );
}
