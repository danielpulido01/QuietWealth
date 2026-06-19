import type { HTMLAttributes } from "react";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Surface({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={joinClasses("ui-surface", className)} />;
}
