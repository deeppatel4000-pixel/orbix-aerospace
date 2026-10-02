"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/config/navigation";

function isCurrentRoute(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Links sit directly in the header. The current page is in ink and
 * underlined in the division color (spec 9).
 */
export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden self-stretch lg:block"
    >
      <ul className="orbix-nav">
        {navigationItems.map((item) => {
          const isActive = isCurrentRoute(pathname, item.href);

          return (
            <li className="flex" key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className="orbix-nav-link"
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
