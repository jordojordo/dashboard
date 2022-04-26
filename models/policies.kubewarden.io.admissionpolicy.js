import SteveModel from '@/plugins/steve/steve-class';
import { KUBEWARDEN, SERVICE } from '@/config/types';

// The uid in the proxy `r3Pw-107z` is setup in the configmap for the kubewarden dashboard
// It's the generic uid from the json here: https://grafana.com/grafana/dashboards/15314
export const POLICY_METRICS_URL = `/api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-grafana:80/proxy/d/r3Pw-1O7z/kubewarden?orgId=1`;

export const TRACE_HEADERS = [
  {
    name:  'operation',
    value: 'operation',
    label: 'Operation',
    sort:  'operation'
  },
  {
    name:   'kind',
    value:  'kind',
    label:  'Kind',
    sort:   'kind'
  },
  {
    name:  'name',
    value: 'name',
    label: 'Name',
    sort:  'name'
  },
  {
    name:  'namespace',
    value: 'namespace',
    label: 'Namespace',
    sort:  'namespace'
  },
  {
    name:   'startTime',
    value:  'startTime',
    label:  'Start Time',
    sort:   'startTime:desc'
  },
  {
    name:   'duration',
    value:  'duration',
    label:  'Duration (ms)',
    sort:   'duration'
  }
];

export const OPERATION_MAP = {
  CREATE: 'bg-info',
  UPDATE: 'bg-warning',
  DELETE: 'bg-error'
};

export default class AdmissionPolicy extends SteveModel {
  get detailPageHeaderBadgeOverride() {
    return this.status?.policyStatus;
  }

  get componentForBadge() {
    if ( this.detailPageHeaderBadgeOverride ) {
      return require(`@/components/formatter/PolicyStatus.vue`).default;
    }

    return null;
  }

  get jaegerQuery() {
    return async() => {
      try {
        const services = await this.$dispatch('cluster/findAll', { type: SERVICE }, { root: true });

        if ( services ) {
          return services.find((s) => {
            const found = s.metadata?.labels?.['app'] === 'jaeger' && s.metadata?.labels?.['app.kubernetes.io/component'] === 'service-query';

            if ( found ) {
              return s;
            }
          });
        }
      } catch (e) {
        console.error(`Error fetching services: ${ e }`); // eslint-disable-line no-console
      }

      return null;
    };
  }

  get policyTypes() {
    const out = Object.values(KUBEWARDEN.SPOOFED);

    return out;
  }

  get policyQuestions() {
    const module = this.spec.module;

    const found = this.policyTypes.find((t) => {
      if ( module.includes( t.replace(`${ KUBEWARDEN.SPOOFED.POLICIES }.`, '') ) ) {
        return t;
      }
    });

    // Spoofing the questions object from hard-typed questions json for each policy
    if ( found ) {
      const short = found.replace(`${ KUBEWARDEN.SPOOFED.POLICIES }.`, '');

      return require(`@/.questions/policy-questions/${ short }.json`);
    }

    return null;
  }
}
