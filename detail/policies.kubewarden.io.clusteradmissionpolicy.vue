<script>
import { mapGetters } from 'vuex';
import { _CREATE } from '@/config/query-params';
import { SERVICE } from '@/config/types';
import { monitoringStatus } from '@/utils/monitoring';
import { dashboardExists } from '@/utils/grafana';
import CreateEditView from '@/mixins/create-edit-view';
import { POLICY_METRICS_URL, TRACE_HEADERS } from '@/models/policies.kubewarden.io.clusteradmissionpolicy';

import DashboardMetrics from '@/components/DashboardMetrics';
import ResourceTabs from '@/components/form/ResourceTabs';
import ResourceTable from '@/components/ResourceTable';
import Tab from '@/components/Tabbed/Tab';

export default {
  name: 'ClusterAdmissionPolicy',

  components: {
    DashboardMetrics, ResourceTabs, ResourceTable, Tab
  },

  mixins: [CreateEditView],

  props: {
    mode: {
      type:    String,
      default: _CREATE,
    },
    resource: {
      type:    String,
      default: null
    },
    value: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const inStore = this.$store.getters['currentStore'](this.resource);
    const CLUSTER_PATH = `/k8s/clusters/${ this.currentCluster?.id }/api/v1/namespaces`;

    const JAEGER_PROXY = `${ CLUSTER_PATH }/jaeger/services/http:all-in-one-query:16686/proxy/api/traces?service=kubewarden-policy-server&operation=validation&tags={"allowed"%3A"false"}`;

    try {
      this.metricsService = this.monitoringStatus.installed && await dashboardExists(this.$store, this.currentCluster?.id, POLICY_METRICS_URL);
    } catch (e) {
      console.error(`Error fetching metrics status: ${ e }`); // eslint-disable-line no-console
    }

    try {
      this.jaegerService = await this.$store.dispatch('cluster/find', { type: SERVICE, id: 'jaeger/jaeger-operator-metrics' });
      this.traces = await this.$store.dispatch(`${ inStore }/request`, { url: JAEGER_PROXY });
    } catch (e) {
      console.error(`Error fetching Jaeger service: ${ e }`); // eslint-disable-line no-console
    }
  },

  data() {
    return {
      POLICY_METRICS_URL,
      TRACE_HEADERS,

      metricsService:     null,
      jaegerService:      null,
      traces:             null,
    };
  },

  computed: {
    ...mapGetters(['currentCluster']),
    ...monitoringStatus(),

    dashboardVars() {
      return { policy_name: this.value?.id };
    },

    hasMetricsTabs() {
      return this.metricsService;
    },

    tracesRows() {
      const out = this.traces?.data?.map((trace) => {
        const span = trace.spans.find(s => s.operationName === 'validation');

        const date = new Date(span.startTime / 1000);

        span.startTime = date.toUTCString();

        const tags = span.tags.filter(t => (
          t.key === 'kind' || t.key === 'name' || t.key === 'namespace' || t.key === 'operation'
        ));

        return tags.reduce((tag, item) => ({
          ...span, ...tag, [item.key]: item.value
        }), {});
      });

      return out;
    }
  }
};
</script>

<template>
  <div>
    <div class="mb-20">
      <h3>{{ t('namespace.resources') }}</h3>
    </div>
    <ResourceTabs v-model="value" :mode="mode">
      <Tab v-if="metricsService" name="policy-metrics" label="Metrics" :weight="2">
        <template #default="props">
          <DashboardMetrics
            v-if="props.active"
            :detail-url="POLICY_METRICS_URL"
            :summary-url="POLICY_METRICS_URL"
            :vars="dashboardVars"
            graph-height="825px"
          />
        </template>
      </Tab>
      <Tab v-if="jaegerService" name="policy-tracing" label="Tracing">
        <template #default>
          <ResourceTable
            v-if="traces"
            :rows="tracesRows"
            :headers="TRACE_HEADERS"
            :table-actions="false"
            :row-actions="false"
            key-field="key"
            default-sort-by="state"
            :paged="true"
          />
        </template>
      </Tab>
    </ResourceTabs>
  </div>
</template>
