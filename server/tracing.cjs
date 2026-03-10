'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const Pyroscope = require('@pyroscope/nodejs');

const serviceName = process.env.OTEL_SERVICE_NAME || 'bookmarked-server';

// Start Pyroscope continuous profiling with trace-to-profile linking
Pyroscope.init({
  serverAddress: process.env.PYROSCOPE_SERVER_ADDRESS || 'http://localhost:9999',
  appName: serviceName,
  tags: {
    env: process.env.NODE_ENV || 'development',
    cluster: 'k3s-home',
  },
  collectCPULabels: true,
  collectMemLabels: true,
});
Pyroscope.start();

// Configure OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  Pyroscope.stop();
  sdk.shutdown().finally(() => process.exit(0));
});
