"use client";

import { useEffect, useState } from "react";

export interface ProfileNavItem {
  readonly id: string;
  readonly label: string;
}

interface ProfileSectionNavProps {
  items: readonly ProfileNavItem[];
}

/**
 * "On this page" (spec 14). Plain anchor links; the section currently being
 * read gets `aria-current="location"` and the 2px accent left border. Without
 * JavaScript the links still work and simply show no current item.
 */
export function ProfileSectionNav({ items }: ProfileSectionNavProps) {
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0 || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // The first section in document order that is in the reading band.
        const first = sections.find((section) => visible.has(section.id));
        if (first) setCurrentId(first.id);
      },
      // A band from just under the header to 40% down the viewport.
      { rootMargin: "-72px 0px -60% 0px" },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-labelledby="profile-on-this-page">
      <h2 className="orbix-h4 text-foreground" id="profile-on-this-page">
        On this page
      </h2>
      <ul className="mt-3 flex flex-col border-l border-border">
        {items.map((item) => (
          <li className="-ml-px" key={item.id}>
            <a
              aria-current={item.id === currentId ? "location" : undefined}
              className="orbix-profile-nav-link w-full"
              href={`#${item.id}`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
