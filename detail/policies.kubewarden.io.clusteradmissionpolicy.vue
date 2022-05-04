<script>
import { mapGetters } from 'vuex';
import { _CREATE } from '@/config/query-params';
import { monitoringStatus } from '@/utils/monitoring';
import { dashboardExists } from '@/utils/grafana';
import CreateEditView from '@/mixins/create-edit-view';

import DashboardMetrics from '@/components/DashboardMetrics';
import ResourceTabs from '@/components/form/ResourceTabs';
import Tab from '@/components/Tabbed/Tab';
import TraceTable from '@/components/TraceTable';

export default {
  name: 'ClusterAdmissionPolicy',

  components: {
    DashboardMetrics, ResourceTabs, Tab, TraceTable
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

    try {
      if ( this.monitoringStatus.installed ) {
        const grafana = await this.grafanaQuery();

        this.metricsService = await dashboardExists(this.$store, this.currentCluster?.id, grafana);
      }
    } catch (e) {
      console.error(`Error fetching metrics status: ${ e }`); // eslint-disable-line no-console
    }

    this.jaegerService = await this.value.jaegerService();

    if ( this.jaegerService ) {
      try {
        const TRACE_TAGS = `"allowed"%3A"false"%2C"policy_id"%3A"clusterwide-${ this.value.metadata?.name }"`;
        const PROXY_PATH = `api/traces?service=kubewarden-policy-server&operation=validation&tags={${ TRACE_TAGS }}`;
        const JAEGER_PATH = `${ this.jaegerService.proxyUrl('http', 16686) + PROXY_PATH }`;

        this.traces = await this.$store.dispatch(`${ inStore }/request`, { url: JAEGER_PATH });
      } catch (e) {
        console.error(`Error fetching Jaeger service: ${ e }`); // eslint-disable-line no-console
      }
    }
  },

  data() {
    return {
      metricsService:     null,
      jaegerService:      null,
      traces:             null,
    };
  },

  computed: {
    ...mapGetters(['currentCluster']),
    ...monitoringStatus(),

    dashboardVars() {
      return { policy_name: `clusterwide-${ this.value?.id }` };
    },

    hasMetricsTabs() {
      return this.metricsService;
    },

    hasRelationships() {
      return !!this.value.metadata?.relationships;
    },

    tracesRows() {
      return this.value.traceTableRows(this.traces);
    }
  }
};
</script>

<template>
  <div>
    <div class="mb-20">
      <h3>{{ t('namespace.resources') }}</h3>
    </div>
    <ResourceTabs v-model="value" :mode="mode" :need-related="hasRelationships">
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
      <Tab v-if="traces" name="policy-tracing" label="Tracing">
        <TraceTable
          :rows="tracesRows"
        />
      </Tab>
    </ResourceTabs>
  </div>
</template>
