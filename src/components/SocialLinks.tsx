import { useToast } from "@/hooks/use-toast";
import { profile } from "@/content/site";
import SocialIcon from "./SocialIcon";

/**
 * The social row, shared by the About card and the footer.
 *
 * Entries with an `href` are links. Entries with a `copy` value are buttons
 * that put that value on the clipboard — Discord has no public profile URL
 * for a username, so linking there would go nowhere.
 */
export default function SocialLinks() {
  const { toast } = useToast();

  const shown = profile.socials.filter((social) => social.href || social.copy);

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} username copied`, description: value });
    } catch {
      toast({ title: `${label}: ${value}`, description: "Copy it from here." });
    }
  };

  // Sized so all seven sit on one row inside the footer at 390px
  const className =
    "flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--page))] text-muted-foreground transition-colors hover:bg-foreground hover:text-white sm:h-10 sm:w-10";

  return (
    <ul className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
      {shown.map((social) => (
        <li key={social.label}>
          {social.href ? (
            <a
              href={social.href}
              target={social.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={social.label}
              title={social.label}
              className={className}
            >
              <SocialIcon name={social.icon} />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => handleCopy(social.label, social.copy!)}
              aria-label={`Copy ${social.label} username`}
              title={`${social.label}: ${social.copy}`}
              className={className}
            >
              <SocialIcon name={social.icon} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
