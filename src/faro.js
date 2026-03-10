import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import { ReactIntegration } from '@grafana/faro-react';
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const faroUrl = process.env.REACT_APP_FARO_URL;

const faro = faroUrl
  ? initializeFaro({
      url: faroUrl,
      app: {
        name: 'bookmarked-client',
        version: process.env.REACT_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'production',
      },
      instrumentations: [
        ...getWebInstrumentations({
          captureConsole: false,
        }),
        new TracingInstrumentation(),
        new ReactIntegration({
          router: {
            version: '6',
            dependencies: {
              createRoutesFromChildren,
              matchRoutes,
              Routes,
              useLocation,
              useNavigationType,
            },
          },
        }),
      ],
    })
  : null;

export default faro;
