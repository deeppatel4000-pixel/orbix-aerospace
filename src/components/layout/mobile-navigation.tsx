"use client";

import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { footerNavigationItems, navigationItems } from "@/config/navigation";
import { siteLegal } from "@/config/site-legal";

function isCurrentRoute(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The quieter group anchored to the bottom of the sheet: the pages the
 * footer lists outside the header (Compare, Learn, About, Image credits).
 */
const secondaryItems = footerNavigationItems;

/** Matches the `lg` breakpoint at which the desktop links take over. */
const DESKTOP_QUERY = "(min-width: 64rem)";

/**
 * Disclosure menu below 1024px (spec 9): a full-height sheet under the
 * header with the links in the condensed display cut at 28px and no rules
 * between them, the current page underlined in the division color as on
 * desktop, and Compare, Learn, About,
 * Image credits and the operator line anchored to the bottom. It opens and
 * closes instantly, with no stagger.
 *
 * - The toggle reads "Menu" when closed and "Close" when open; open, its
 *   accessible name is "Close menu", which starts with the visible word
 *   (label-in-name). It keeps one width and one border in both states, so
 *   the header does not shift when it toggles.
 * - Opening moves focus to the first link and stops the page behind the
 *   sheet from scrolling.
 * - Escape closes the sheet and returns focus to the toggle.
 * - Moving focus out of the menu (Tab past the last link, or Shift+Tab
 *   past the toggle) closes it, so keyboard focus never lands on content
 *   hidden behind the sheet.
 * - Widening the window past the breakpoint closes it.
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

    const desktop = window.matchMedia(DESKTOP_QUERY);
    function handleBreakpoint(event: MediaQueryListEvent) {
      if (event.matches) setIsOpen(false);
    }

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);
    desktop.addEventListener("change", handleBreakpoint);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
      desktop.removeEventListener("change", handleBreakpoint);
    };
  }, [isOpen]);

  // Runs after commit, once the sheet has unmounted, so restoring focus
  // cannot race React's DOM update.
  useEffect(() => {
    if (isOpen) return;
    if (!restoreFocusOnCloseRef.current) return;

    restoreFocusOnCloseRef.current = false;
    toggleRef.current?.focus();
  }, [isOpen]);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!isOpen) return;
    const next = event.relatedTarget;
    // `null` means focus went nowhere in particular (a click on the sheet's
    // empty space); only a move to another element outside closes it.
    if (next instanceof Node && !event.currentTarget.contains(next)) {
      setIsOpen(false);
    }
  }

  return (
    <div className="lg:hidden" onBlur={handleBlur}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : undefined}
        className="orbix-menu-toggle"
        onClick={() => setIsOpen((open) => !open)}
        ref={toggleRef}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" size={16} strokeWidth={1.5} />
        ) : (
          <Menu aria-hidden="true" size={16} strokeWidth={1.5} />
        )}
        {isOpen ? "Close" : "Menu"}
      </button>

      {isOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="orbix-mobile-nav"
          id={menuId}
        >
          <ul className="orbix-mobile-nav__list">
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

          <div className="orbix-mobile-nav__secondary">
            <ul className="orbix-mobile-nav__secondary-list">
              {secondaryItems.map((item) => (
                <li key={item.href}>
                  <Link
                    aria-current={
                      isCurrentRoute(pathname, item.href) ? "page" : undefined
                    }
                    className="orbix-mobile-nav-secondary-link"
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="orbix-mobile-nav__note">
              Operated by {siteLegal.operatorName}. Contact{" "}
              <a href={`mailto:${siteLegal.contactEmail}`}>
                {siteLegal.contactEmail}
              </a>
            </p>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
