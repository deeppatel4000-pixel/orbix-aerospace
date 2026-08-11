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

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Flipped to true immediately before an Escape-driven close, so the
  // focus-restoration effect below can tell that dismissal apart from a
  // link click (the user is intentionally navigating away -- forcing focus
  // back to the toggle would fight them) or a plain toggle-button click
  // (focus is already on the toggle; nothing to restore). Only the Escape
  // path should send focus back to the toggle.
  const restoreFocusOnCloseRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      restoreFocusOnCloseRef.current = true;
      setIsOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Runs after commit, once `isOpen` has already flipped to false and the
  // <nav> (and whichever link inside it held focus) has already unmounted --
  // so restoring focus here can't race React's own DOM update, and doesn't
  // require a setTimeout to "wait" for the unmount. Guarded by the ref above
  // so it only fires for an Escape-driven close, never on initial mount
  // (isOpen starts false and the ref starts false) and never for a link
  // click or a plain toggle click.
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
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        className="orbix-icon-control"
        onClick={() => setIsOpen((open) => !open)}
        ref={toggleRef}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" size={19} />
        ) : (
          <Menu aria-hidden="true" size={19} />
        )}
      </button>

      {isOpen ? (
        // `orbix-mobile-nav` now carries its own surface, so the stacked
        // `orbix-surface`/`--mission` gradients (which added a decorative
        // accent hairline and a blue wash) are gone. Links are full-width
        // rows at a 3rem minimum height rather than toolbar chips reused
        // from the desktop nav.
        <nav
          aria-label="Mobile navigation"
          className="orbix-mobile-nav absolute inset-x-5 top-[calc(100%+0.5rem)] p-2 sm:inset-x-8"
          id={menuId}
        >
          <ul className="flex flex-col gap-0.5">
            {navigationItems.map((item) => {
              const isActive = isCurrentRoute(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className="orbix-mobile-nav-link"
                    href={item.href}
                    onClick={() => setIsOpen(false)}
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
