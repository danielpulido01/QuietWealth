import { useContext } from "react";
import { SessionContext, type SessionContextValue } from "../../state/SessionProvider";

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return context;
}
