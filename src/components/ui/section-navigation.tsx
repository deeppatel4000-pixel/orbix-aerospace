interface SectionNavigationItem {
  id: string;
  label: string;
}

interface SectionNavigationProps {
  items: readonly SectionNavigationItem[];
  label?: string;
}

/**
 * In-page section links (spec 9): a plain list of links, with no rules per
 * item, no numbers and no uppercase. Sticky only if it never covers
 * content; this component is static.
 */
export function SectionNavigation({
  items,
  label = "Page sections",
}: SectionNavigationProps) {
  return (
    <nav aria-label={label}>
      <ul className="orbix-anchor-nav">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
