import Link from "next/link";

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  label?: string;
}

export function Breadcrumbs({
  items,
  label = "Breadcrumb navigation",
}: BreadcrumbsProps) {
  return (
    <nav aria-label={label}>
      <ol className="orbix-breadcrumbs">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li className="contents" key={`${item.label}-${index}`}>
              {/* A single slash is the conventional hierarchy separator and
                  carries real meaning here, unlike the decorative `//` used
                  elsewhere in the product. It stays `aria-hidden` so screen
                  readers get the list semantics, not punctuation. */}
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="orbix-breadcrumbs-separator"
                >
                  /
                </span>
              ) : null}
              {item.href && !isCurrent ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
