import { ButtonLink } from "@/components/ui/button-link";

interface ProfileLinkProps {
  href: string;
  /** The vehicle's name, completing the link's accessible name. */
  name: string;
}

/**
 * "View profile" under a registry hero's featured-vehicle `SpecPanel`: a
 * tertiary link with a right arrow. The vehicle name follows in visually
 * hidden text, so the accessible name starts with the visible words
 * (label in name) and still says which profile it opens.
 */
export function ProfileLink({ href, name }: ProfileLinkProps) {
  return (
    <ButtonLink arrow="right" href={href} variant="tertiary">
      View profile<span className="sr-only"> of the {name}</span>
    </ButtonLink>
  );
}
