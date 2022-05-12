import SteveModel from '@/plugins/steve/steve-class';
import { KUBEWARDEN, SERVICE } from '@/config/types';
import { proxyUrlFromParts } from '@/models/service';
import { findBy } from '@/utils/array';
import { isEmpty } from '@/utils/object';
import filter from 'lodash/filter';
import matches from 'lodash/matches';

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

export default class KubewardenModel extends SteveModel {
  async allServices() {
    return await this.$dispatch('cluster/findAll', { type: SERVICE }, { root: true });
  }

  get detailPageHeaderBadgeOverride() {
    return this.status?.policyStatus;
  }

  get componentForBadge() {
    if ( this.detailPageHeaderBadgeOverride ) {
      return require(`@/components/formatter/PolicyStatus.vue`).default;
    }

    return null;
  }

  get link() {
    if ( this.spec?.toURL ) {
      return this.spec.toURL;
    } else if ( this.spec?.toService ) {
      const s = this.spec.toService;

      return proxyUrlFromParts(this.$rootGetters['clusterId'], s.namespace, s.name, s.scheme, s.port, s.path);
    } else {
      return null;
    }
  }

  get grafanaProxy() {
    return async() => {
      try {
        const services = await this.allServices();

        if ( services ) {
          const grafana = findBy(services, 'id', 'cattle-monitoring-system/rancher-monitoring-grafana');

          if ( grafana ) {
            // The uid in the proxy `r3Pw-107z` is setup in the configmap for the kubewarden dashboard
            // It's the generic uid from the json here: https://grafana.com/grafana/dashboards/15314
            return `${ grafana.proxyUrl('http', 80) }d/r3Pw-1O7z/kubewarden?orgId=1`;
          }
        }
      } catch (e) {
        console.error(`Error fetching metrics service: ${ e }`); // eslint-disable-line no-console
      }

      return null;
    };
  }

  get jaegerService() {
    return async() => {
      try {
        const services = await this.allServices();

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

  // Determines if a policy is targeting rancher specific namespaces (which happens by default)
  get namespaceSelector() {
    const labelSelector = {
      key:      'kubernetes.io/metadata.name',
      operator: 'NotIn',
      values:   ['cattle-system', 'rancher-operator-system']
    };

    const out = filter(this.spec?.namespaceSelector?.matchExpressions, matches(labelSelector));

    if ( !isEmpty(out) ) {
      return true;
    }

    return false;
  }

  get policyTypes() {
    const out = Object.values(KUBEWARDEN.SPOOFED);

    return out;
  }

  get policyQuestions() {
    return async() => {
      const module = this.spec.module;

      const found = this.policyTypes.find((t) => {
        if ( module.includes( t.replace(`${ KUBEWARDEN.SPOOFED.POLICIES }.`, '') ) ) {
          return t;
        }
      });

      // Spoofing the questions object from hard-typed questions json for each policy
      if ( found ) {
        const short = found.replace(`${ KUBEWARDEN.SPOOFED.POLICIES }.`, '');
        const json = (await import(/* webpackChunkName: "policy-questions" */`@/.questions/policy-questions/${ short }.json`)).default;

        return json;
      }

      return null;
    };
  }

  traceTableRows(traces) {
    const out = traces?.data?.map((trace) => {
      const span = trace.spans.find(s => s.operationName === 'validation');

      const date = new Date(span.startTime / 1000);
      const duration = span.duration / 1000;

      span.startTime = date.toUTCString();
      span.duration = duration.toFixed(2);

      const keys = ['kind', 'mutated', 'name', 'namespace', 'operation', 'policy_id', 'response_message', 'response_code'];
      const tags = keys.map(k => span.tags.find(tag => tag.key === k));

      return tags?.reduce((tag, item) => ({
        ...span, ...tag, [item?.key]: item?.value
      }), {});
    });

    return out;
  }
}
