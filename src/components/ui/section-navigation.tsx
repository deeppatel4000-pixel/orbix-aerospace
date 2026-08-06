interface SectionNavigationItem {
  id: string;
  label: string;
}

interface SectionNavigationProps {
  items: readonly SectionNavigationItem[];
  label?: string;
}

export function SectionNavigation({
  items,
  label = "Page sections",
}: SectionNavigationProps) {
  return (
    <nav aria-label={label} className="orbix-anchor-nav">
      {items.map((item) => (
        <a href={`#${item.id}`} key={item.id}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
