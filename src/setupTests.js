import "@testing-library/jest-dom";
import { vi, TextDecoder, TextEncoder } from "util";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}
global.IS_REACT_ACT_ENVIRONMENT = true;
global.jest = vi;
