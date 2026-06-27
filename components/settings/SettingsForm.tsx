"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, KeyRound, Loader2 } from "lucide-react";
import { updateSettings, type SettingsState } from "@/app/(authed)/settings/actions";

type Defaults = {
  timezone: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  anthropicModel: string;
  anthropicKeyMasked: string | null;
};

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const [state, action] = useActionState<SettingsState, FormData>(updateSettings, null);
  const [tz, setTz] = useState(defaults.timezone);

  useEffect(() => {
    if (defaults.timezone === "UTC") {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detected && detected !== "UTC") setTz(detected);
      } catch {}
    }
  }, [defaults.timezone]);

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-[var(--color-border)] p-4">
      <div className="space-y-2">
        <label htmlFor="timezone" className="text-sm font-medium">
          Timezone (for daily reminders)
        </label>
        <input
          id="timezone"
          name="timezone"
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
        <p className="text-xs text-[var(--color-muted-foreground)]">
          We auto-detect from your browser. Override if you travel.
        </p>
      </div>

      <Toggle
        name="emailEnabled"
        defaultChecked={defaults.emailEnabled}
        label="Email daily digest"
        hint="Sent at 8 AM in your timezone, only when items are due."
      />
      <Toggle
        name="pushEnabled"
        defaultChecked={defaults.pushEnabled}
        label="Web push reminders"
        hint="Pair with the toggle below to subscribe this device."
      />

      <fieldset className="space-y-2 rounded-md border border-[var(--color-border)] p-3">
        <legend className="px-1 text-sm font-medium">
          <KeyRound className="mr-1 inline h-3.5 w-3.5" /> Anthropic API key
        </legend>
        {defaults.anthropicKeyMasked && (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Current key: <span className="font-mono">{defaults.anthropicKeyMasked}</span>
          </p>
        )}
        <input
          name="anthropicKey"
          type="password"
          autoComplete="off"
          placeholder={defaults.anthropicKeyMasked ? "Paste a new key to replace" : "sk-ant-…"}
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
        <input
          name="anthropicModel"
          defaultValue={defaults.anthropicModel}
          placeholder="claude-haiku-4-5-20251001 (default)"
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
        <label className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
          <input type="checkbox" name="clearKey" /> Remove stored key
        </label>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Stored encrypted with AES-256-GCM. Used only when you enable AI on an item.
        </p>
      </fieldset>

      {state && (state.ok ? <Saved /> : <ErrorMsg message={state.error} />)}

      <Submit />
    </form>
  );
}

function Toggle({
  name,
  defaultChecked,
  label,
  hint,
}: {
  name: string;
  defaultChecked: boolean;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-[var(--color-border)] p-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5" />
      <span>
        <span className="font-medium">{label}</span>
        <span className="ml-1 text-[var(--color-muted-foreground)]">{hint}</span>
      </span>
    </label>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Save
    </button>
  );
}

function Saved() {
  return (
    <p className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
      <Check className="h-3.5 w-3.5" /> Saved
    </p>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <p role="alert" className="text-xs text-red-600 dark:text-red-300">
      {message}
    </p>
  );
}
