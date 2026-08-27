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
export default function SocialLinks({ variant = "icons" }: { variant?: "icons" | "text" }) {
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

  const iconClass =
    "flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--page))] text-muted-foreground transition-colors hover:bg-foreground hover:text-white";
  const textClass = "text-[13.5px] text-muted-foreground transition-colors hover:text-foreground";
  const className = variant === "icons" ? iconClass : textClass;

  return (
    <ul className={variant === "icons" ? "flex flex-wrap items-center gap-2" : "flex flex-wrap gap-5"}>
      {shown.map((social) => {
        const inner =
          variant === "icons" ? <SocialIcon name={social.icon} /> : <>{social.label}</>;

        return (
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
                {inner}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleCopy(social.label, social.copy!)}
                aria-label={`Copy ${social.label} username`}
                title={`${social.label}: ${social.copy}`}
                className={className}
              >
                {inner}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
