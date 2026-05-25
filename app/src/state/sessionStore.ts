import { createStore } from "redux";
import type { AuthSession } from "./session.types";

export type SessionStoreState = {
  session: AuthSession | null;
};

type SetSessionAction = {
  type: "session/set";
  payload: AuthSession | null;
};

type ClearSessionAction = {
  type: "session/clear";
};

type SessionStoreAction = SetSessionAction | ClearSessionAction;

const initialState: SessionStoreState = {
  session: null,
};

function sessionReducer(state: SessionStoreState = initialState, action: SessionStoreAction): SessionStoreState {
  switch (action.type) {
    case "session/set":
      return {
        ...state,
        session: action.payload,
      };
    case "session/clear":
      return {
        ...state,
        session: null,
      };
    default:
      return state;
  }
}

export const sessionActions = {
  set(session: AuthSession | null): SetSessionAction {
    return {
      type: "session/set",
      payload: session,
    };
  },
  clear(): ClearSessionAction {
    return {
      type: "session/clear",
    };
  },
};

export const sessionStore = createStore(sessionReducer);

export function selectSession(state: SessionStoreState) {
  return state.session;
}
