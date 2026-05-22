import { getEnvVariable, getNextRuntime } from "@stackframe/stack-shared/dist/utils/env";
import "./polyfills";

export function register() {
  if (getNextRuntime() === "nodejs") {
    globalThis.process.title = `stack-dashboard:${getEnvVariable("NEXT_PUBLIC_STACK_PORT_PREFIX", "81")} (node/nextjs)`;
  }
}
