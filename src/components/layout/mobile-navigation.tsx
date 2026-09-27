"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { navigationItems } from "@/config/navigation";

function isCurrentRoute(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Disclosure menu below 1024px (spec 10). The toggle's visible text is its
 * accessible name ("Menu" / "Close menu"). Opening moves focus to the first
 * link; Escape closes the sheet and returns focus to the toggle.
 */
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  // Set immediately before an Escape-driven close, so the effect below
  // returns focus to the toggle only for that path. A link click navigates
  // away, and a toggle click already leaves focus on the toggle.
  const restoreFocusOnCloseRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    firstLinkRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      restoreFocusOnCloseRef.current = true;
      setIsOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Runs after commit, once the sheet has unmounted, so restoring focus
  // cannot race React's DOM update.
  useEffect(() => {
    if (isOpen) return;
    if (!restoreFocusOnCloseRef.current) return;

    restoreFocusOnCloseRef.current = false;
    toggleRef.current?.focus();
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        className="orbix-menu-toggle"
        onClick={() => setIsOpen((open) => !open)}
        ref={toggleRef}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" size={16} />
        ) : (
          <Menu aria-hidden="true" size={16} />
        )}
        {isOpen ? "Close menu" : "Menu"}
      </button>

      {isOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="orbix-mobile-nav absolute inset-x-0 top-full"
          id={menuId}
        >
          <ul className="flex flex-col py-2">
            {navigationItems.map((item, index) => {
              const isActive = isCurrentRoute(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className="orbix-mobile-nav-link"
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    ref={index === 0 ? firstLinkRef : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
