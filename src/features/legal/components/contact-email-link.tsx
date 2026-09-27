import { siteLegal } from "@/config/site-legal";

/** The operator's contact address as a mailto link, from one config value. */
export function ContactEmailLink() {
  return (
    <a href={`mailto:${siteLegal.contactEmail}`}>{siteLegal.contactEmail}</a>
  );
}
