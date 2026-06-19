import "@testing-library/jest-dom";
import "whatwg-fetch";
import { TextDecoder, TextEncoder } from "util";

Object.defineProperty(globalThis, "TextEncoder", {
  configurable: true,
  value: TextEncoder,
});

Object.defineProperty(globalThis, "TextDecoder", {
  configurable: true,
  value: TextDecoder,
});
