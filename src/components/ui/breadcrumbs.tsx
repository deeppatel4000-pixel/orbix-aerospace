import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  label?: string;
}

/**
 * Breadcrumb trail (spec 10). The separator is decorative and hidden from
 * assistive technology; the current item is text with `aria-current`.
 */
export function Breadcrumbs({ items, label = "Breadcrumb" }: BreadcrumbsProps) {
  return (
    <nav aria-label={label}>
      <ol className="orbix-breadcrumbs">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li className="contents" key={`${item.label}-${index}`}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="orbix-breadcrumbs-separator"
                >
                  <ChevronRight size={12} />
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
