import { Link } from "react-router-dom";

interface Post {
  slug: string;
  title: string;
  date: string;
}

interface BlogSidebarProps {
  posts: Post[];
}

export default function BlogSidebar({ posts }: BlogSidebarProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <nav className="page-sidebar">
      <ul className="page-sidebar-list">
        {posts.map((post) => (
          <li key={post.slug} className="page-sidebar-item">
            <div className="page-sidebar-item-wrapper">
              <span className="page-sidebar-spacer" />
              <Link
                to={`/${post.slug}`}
                className="page-sidebar-link"
              >
                {post.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
