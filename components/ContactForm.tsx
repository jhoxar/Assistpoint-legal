"use client";

import { useState } from "react";
import { copy } from "@/content/site";

const FORM_NAME = "consultation";

/**
 * Consultation request.
 *
 * The artifact's form went nowhere — `submit` only set `sent: true`, and the
 * page shipped two notes telling the client's IT team to wire it up, rendered
 * where visitors could read them. It now posts to Netlify Forms, which needs
 * three things: the form present in the exported HTML (it is — this is
 * prerendered), a hidden `form-name` field, and a urlencoded POST.
 */
export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    setState("sending");
    try {
      const data = new FormData(form);
      data.set("form-name", FORM_NAME);
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="form-card form-sent">
        <span className="sent-mark" aria-hidden="true">✓</span>
        <h2 className="h2" style={{ fontSize: "var(--fs-card-lg)" }}>{copy.contact.sentH2}</h2>
        <p className="lede" style={{ marginTop: 14 }}>{copy.contact.sentBody}</p>
        <button type="button" className="back-link" onClick={() => setState("idle")}>
          {copy.contact.back}
        </button>
      </div>
    );
  }

  const f = copy.contact.fields;

  return (
    <div className="form-card">
      <p className="eyebrow">
        <span className="rule" aria-hidden="true" />
        {copy.contact.formEyebrow}
      </p>
      <h2 className="h2" style={{ fontSize: "var(--fs-card-lg)", marginBottom: 26 }}>
        {copy.contact.formH2}
      </h2>

      <form
        name={FORM_NAME}
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={onSubmit}
        noValidate
      >
        {/* Required by Netlify for an AJAX submission to be attributed. */}
        <input type="hidden" name="form-name" value={FORM_NAME} />
        <p hidden>
          <label>
            Do not fill this in <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <div className="field-pair">
          <label className="field">
            <span>{f.name}</span>
            <input name="full_name" autoComplete="name" required />
          </label>
          <label className="field">
            <span>{f.org}</span>
            <input name="organization" autoComplete="organization" />
          </label>
        </div>

        <div className="field-pair">
          <label className="field">
            <span>{f.email}</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field">
            <span>{f.phone}</span>
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
        </div>

        <div className="field-pair">
          <label className="field">
            <span>{f.orgType}</span>
            <select name="organization_type" defaultValue="">
              <option value="" />
              {copy.contact.orgTypes.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{f.interest}</span>
            <select name="area_of_interest" defaultValue="">
              <option value="" />
              {copy.contact.interests.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>{f.message}</span>
          <textarea name="message" rows={5} style={{ resize: "vertical" }} />
        </label>

        {state === "error" && (
          <p className="form-error" role="alert">
            That didn&rsquo;t send. Check your connection and try again, or email{" "}
            <a href="mailto:info@assistpointclinical.com">info@assistpointclinical.com</a>.
          </p>
        )}

        <button type="submit" className="form-submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : copy.contact.submit}
        </button>
      </form>
    </div>
  );
}
