---
name: frontend
description: Use when creating or reviewing React components, hooks, or state in the QuietWealth frontend. Includes exact code patterns from the real codebase — hooks, atoms, molecules, and service access via facade.
---

# QuietWealth Frontend Skill

## Stack
- React 19 + TypeScript
- Vite + TailwindCSS 4
- i18next for translations
- `useApplicationServices()` facade for all service calls
- No direct axios/fetch in components or hooks

## Folder Structure

```
app/src/
  components/
    atoms/       → Input, Button, Badge, Surface, TextArea
    molecules/   → composite components using atoms
    pages/       → full page components
    hooks/       → use<Name>.ts custom hooks
    templates/   → AppShell layout wrappers
  services/
    applicationFacade.ts   → singleton service registry
  auth/
    AuthFacade.ts
  models/
    local-mvp.ts           → shared TypeScript types
```

---

## Hook – Exact Pattern

Based on real `useLogin.ts` from the codebase:

```typescript
// app/src/components/hooks/use<Name>.ts
import { useState } from "react";
import { useApplicationServices } from "./useApplicationServices";

type <Name>Input = {
  field: string;
};

export function use<Name>() {
  const { <service> } = useApplicationServices();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function <action>(input: <Name>Input) {
    setError(null);
    setIsLoading(true);

    try {
      const result = await <service>.<action>(input);
      if (!result) {
        setError("No result was returned by the server.");
        return false;
      }
      return result;
    } catch (reason) {
      if (<service>.is<SpecificError>(reason)) {
        setError("Specific error message.");
        return false;
      }
      setError(<service>.toErrorMessage(reason, "<Action> failed."));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { <action>, isLoading, error };
}
```

**Rules:**
- Always use `useApplicationServices()` — never import services directly
- `error` is always `string | null`
- Always have `isLoading` boolean
- Always reset `error` to `null` before starting action
- Always use `finally` to reset `isLoading`
- No `any` types

---

## Atom Component – Exact Pattern

Based on real `Input.tsx` from the codebase:

```typescript
// app/src/components/atoms/<Name>.tsx
import { forwardRef, type InputHTMLAttributes } from "react";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type <Name>Props = InputHTMLAttributes<HTMLInputElement>;

export const <Name> = forwardRef<HTMLInputElement, <Name>Props>(function <Name>(
  { className, ...props },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      className={joinClasses("ui-<name>", className)}
    />
  );
});
```

**Rules:**
- Always use `forwardRef` for input-like elements
- Always spread `...props` before custom props
- Use `joinClasses` for className composition
- CSS class prefix: `ui-<component-name>`

---

## Molecule Component – Exact Pattern

Based on real `ValidationDialog.tsx` from the codebase:

```typescript
// app/src/components/molecules/<Name>.tsx
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";
import { Surface } from "../atoms/Surface";

type <Name>Props = {
  onClose: () => void;
  onConfirm: () => void;
};

export function <Name>({ onClose, onConfirm }: <Name>Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <Surface
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>{t("<namespace>.title")}</h2>
      <Button ref={closeButtonRef} onClick={onClose}>
        {t("common.close")}
      </Button>
      <Button onClick={onConfirm}>
        {t("common.confirm")}
      </Button>
    </Surface>
  );
}
```

**Rules:**
- Props defined as `type` not `interface`
- Always use `useTranslation()` — never hardcode visible strings
- Use `useId()` for accessibility IDs on dialogs/labels
- Use `useRef` + `useEffect` for focus management in dialogs
- Always clean up event listeners in `useEffect` return

---

## Service Facade – How to Access Services

```typescript
// The facade is a singleton — always access via hook:
import { useApplicationServices } from "./useApplicationServices";

// Inside a hook:
const { auth, http } = useApplicationServices();

// Available services:
// auth  → AuthFacade  (login, logout, session, error helpers)
// http  → HttpClientFacade  (generic HTTP calls)
```

```typescript
//  NEVER do this:
import { applicationServiceFacade } from "../../services/applicationFacade";

//  ALWAYS do this:
const { auth } = useApplicationServices();
```

---

## i18n Rules

```typescript
// Always use translation keys, never hardcode strings
const { t } = useTranslation();
<p>{t("feature.section.key")}</p>

// Add keys to both:
// app/src/i18n/en.json
// app/src/i18n/es.json
```

---

## TypeScript Rules

- No `any` — use `unknown` and narrow with type guards
- Props: use `type` not `interface`
- Optional error: `string | null` never `string | undefined`
- Guid fields in TS models: `string` type

## Close-Out Checklist

- [ ] Hook uses `useApplicationServices()` not direct imports
- [ ] All visible text uses `t("key")` from `useTranslation()`
- [ ] Atoms use `forwardRef` and `joinClasses`
- [ ] Molecules use `useId()` for accessibility
- [ ] No `any` types anywhere
- [ ] `error` state is `string | null`
- [ ] `isLoading` resets in `finally` block
