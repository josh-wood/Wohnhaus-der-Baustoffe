"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, saveEndText, toggleCampaign, type EndTextState, type LoginState } from "@/app/admin/actions";
import { texts } from "@/content/texts";
import { END_TEXT_MAX_LENGTH } from "@/lib/limits";

const t = texts.admin;

function Submit({ children, className = "btn-primary" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${className} disabled:opacity-50`} disabled={pending}>
      {children}
    </button>
  );
}

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action] = useActionState<LoginState, FormData>(login, {});
  if (!configured) {
    return (
      <p role="alert" className="text-accent">
        {t.notConfigured}
      </p>
    );
  }
  return (
    <form action={action} className="space-y-4" data-testid="login-form">
      <label htmlFor="password" className="block text-lg">
        {t.passwordLabel}
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="w-full rounded-lg border border-ink/30 bg-white px-4 py-3 text-lg"
      />
      {state.error && (
        <p role="alert" className="text-accent" data-testid="login-error">
          {state.error === "config" ? t.notConfigured : t.wrongPassword}
        </p>
      )}
      <Submit>{t.login}</Submit>
    </form>
  );
}

export function CampaignToggle({ closed }: { closed: boolean }) {
  return (
    <form
      action={toggleCampaign}
      onSubmit={(e) => {
        if (!window.confirm(closed ? t.confirmReopen : t.confirmClose)) e.preventDefault();
      }}
    >
      <input type="hidden" name="closed" value={closed ? "false" : "true"} />
      <Submit className={closed ? "btn-primary" : "btn-primary !bg-accent"}>{closed ? t.reopen : t.close}</Submit>
    </form>
  );
}

export function EndTextForm({ endText }: { endText: string }) {
  const [state, action] = useActionState<EndTextState, FormData>(saveEndText, {});
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="endText" className="block">
        {t.endTextLabel}
      </label>
      <textarea
        id="endText"
        name="endText"
        rows={4}
        maxLength={END_TEXT_MAX_LENGTH}
        defaultValue={endText}
        placeholder={texts.end.defaultText}
        className="w-full rounded-lg border border-ink/30 bg-white px-4 py-3"
      />
      <div className="flex items-center gap-4">
        <Submit className="btn-secondary">{t.saveEndText}</Submit>
        {state.saved && (
          <span role="status" data-testid="end-text-saved">
            {t.saved}
          </span>
        )}
      </div>
    </form>
  );
}
