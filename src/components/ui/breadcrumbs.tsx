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
              {index > 0 ? <span aria-hidden="true">/</span> : null}
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
