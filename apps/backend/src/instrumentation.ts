import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { getEnvVariable, getNextRuntime, getNodeEnvironment } from "@stackframe/stack-shared/dist/utils/env";
import { registerOTel } from '@vercel/otel';
import { initPerfStats } from "./lib/dev-perf-stats";
import "./polyfills";

// this is a hack for making prisma instrumentation work
// somehow prisma instrumentation accesses global and it makes edge instrumentation complain
globalThis.global = globalThis;

export async function register() {
  registerOTel({
    serviceName: 'stack-backend',
    instrumentations: [
      new PrismaInstrumentation(),
      ...getNextRuntime() === "nodejs" ? getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          enabled: false,
        },
      }) : [],
    ],
    ...getNodeEnvironment() === "development" && getNextRuntime() === "nodejs" ? {
      traceExporter: new OTLPTraceExporter({
        url: `http://localhost:${getEnvVariable("NEXT_PUBLIC_STACK_PORT_PREFIX", "81")}31/v1/traces`,
      }),
    } : {},
  });

  if (getNextRuntime() === "nodejs") {
    (globalThis as any).process.title = `stack-backend:${getEnvVariable("NEXT_PUBLIC_STACK_PORT_PREFIX", "81")} (node/nextjs)`;

    // Initialize performance stats collection in development
    initPerfStats();
  }
}
