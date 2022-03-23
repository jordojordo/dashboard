import SteveModel from '@/plugins/steve/steve-class';
// import { KUBEWARDEN } from '@/config/types';

// The uid in the proxy `r3Pw-107z` is setup in the configmap for the kubewarden dashboard
// It's the generic uid from the json here: https://grafana.com/grafana/dashboards/15314
export const POLICY_METRICS_URL = `/api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-grafana:80/proxy/d/r3Pw-1O7z/kubewarden?orgId=1`;

export const TRACE_HEADERS = [
  {
    name:   'kind',
    value:  'kind',
    label:  'Kind',
    sort:   'kind'
  },
  {
    name:   'startTime',
    value:  'startTime',
    label:  'Start Time',
    sort:   'startTime'
  },
  {
    name:   'duration',
    value:  'duration',
    label:  'Duration (ms)',
    sort:   'duration'
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
    name:  'operation',
    value: 'operation',
    label: 'Operation',
    sort:  'operation'
  },
];

export default class AdmissionPolicy extends SteveModel {
  // get allPolicies() {
  //   return async() => {
  //     try {
  //       return await this.$store.dispatch('cluster/findAll', { type: KUBEWARDEN.ADMISSION_POLICY }, { root: true });
  //     } catch (e) {
  //       console.error(`Error fetching policies: ${ e }`); // eslint-disable-line no-console
  //     }
  //   };
  // }

  get detailPageHeaderBadgeOverride() {
    return this.status?.policyStatus;
  }

  get componentForBadge() {
    if ( this.detailPageHeaderBadgeOverride ) {
      return require(`@/components/formatter/PolicyStatus.vue`).default;
    }

    return null;
  }
}
