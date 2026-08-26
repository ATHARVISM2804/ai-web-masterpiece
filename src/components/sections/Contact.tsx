import { useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { contact, profile, WEB3FORMS_KEY } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";

const field =
  "w-full rounded-2xl bg-white px-5 py-4 text-[15px] outline-none ring-4 ring-white transition-shadow placeholder:text-muted-foreground/70 focus:ring-foreground/15";

export default function Contact() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [budget, setBudget] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);

    const payload = new FormData(form);
    payload.append("access_key", WEB3FORMS_KEY);
    payload.append("subject", "New project enquiry — atharvgolait.dev");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: payload,
      });
      const result = await response.json();

      if (!result.success) throw new Error(result.message ?? "Request failed");

      form.reset();
      setBudget("");
      toast({
        title: "Message sent",
        description: "I read every one of these and reply within one working day.",
      });
    } catch {
      toast({
        title: "That didn't send",
        description: `Email me at ${profile.email} and I'll pick it up there.`,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="shell">
        <SectionHead badge={contact.badge} title={contact.title} lede={contact.lede} />

        <Reveal className="mx-auto mt-14 max-w-[600px] sm:mt-20">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label htmlFor="name" className="mb-2.5 block font-medium">
                Your Name
              </label>
              <input id="name" name="name" required className={field} placeholder="Full Name" />
            </div>

            <div>
              <label htmlFor="email" className="mb-2.5 block font-medium">
                Your Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={field}
                placeholder="Email Address"
              />
            </div>

            <fieldset>
              <legend className="mb-2.5 font-medium">Budget</legend>
              <input type="hidden" name="budget" value={budget} />

              <div className="grid gap-3 sm:grid-cols-2">
                {contact.budgets.map((option) => {
                  const selected = budget === option;

                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setBudget(option)}
                      aria-pressed={selected}
                      className={`flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-left text-[15px] ring-4 transition-shadow ${
                        selected ? "ring-foreground/25" : "ring-white"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected ? "border-foreground" : "border-border"
                        }`}
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="message" className="mb-2.5 block font-medium">
                Tell me about the project
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className={`${field} resize-y`}
                placeholder="What happens today, who does it manually, and what you'd like it to do instead."
              />
            </div>

            <button type="submit" disabled={sending} className="btn-dark mt-2 w-full">
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
