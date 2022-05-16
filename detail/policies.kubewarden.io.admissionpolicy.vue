<script>
import { mapGetters } from 'vuex';
import { _CREATE } from '@/config/query-params';
import { monitoringStatus } from '@/utils/monitoring';
import { dashboardExists } from '@/utils/grafana';
import CreateEditView from '@/mixins/create-edit-view';

import DashboardMetrics from '@/components/DashboardMetrics';
import Loading from '@/components/Loading';
import ResourceTabs from '@/components/form/ResourceTabs';
import Tab from '@/components/Tabbed/Tab';
import TraceTable from '@/components/TraceTable';

export default {
  name: 'AdmissionPolicy',

  components: {
    DashboardMetrics, Loading, ResourceTabs, Tab, TraceTable
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
    const fullPolicyName = `${ this.value.metadata?.namespace }-${ this.value.metadata?.name }`;

    this.metricsProxy = await this.value.grafanaProxy();

    if ( this.monitoringStatus.installed ) {
      try {
        this.metricsProxy = await this.value.grafanaProxy();

        if ( this.metricsProxy ) {
          this.metricsService = await dashboardExists(this.$store, this.currentCluster?.id, this.metricsProxy);
        }
      } catch (e) {
        console.error(`Error fetching Grafana service: ${ e }`); // eslint-disable-line no-console
      }
    }

    this.jaegerService = await this.value.jaegerService();

    if ( this.jaegerService ) {
      try {
        const TRACE_TAGS = `"allowed"%3A"false"%2C"policy_id"%3A"namespaced-${ fullPolicyName }"`;
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
      jaegerService:      null,
      metricsProxy:       null,
      metricsService:     null,
      traces:             null,
    };
  },

  computed: {
    ...mapGetters(['currentCluster']),
    ...monitoringStatus(),

    dashboardVars() {
      const id = this.value?.id.replace('/', '-'); // prometheus needs `namespaced-<namespace>-<id>` not `namespaced-<namespace>/<id>`

      return { policy_name: `namespaced-${ id }` };
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
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <div class="mb-20">
      <h3>{{ t('namespace.resources') }}</h3>
    </div>
    <ResourceTabs v-model="value" :mode="mode" :need-related="hasRelationships">
      <Tab v-if="metricsService" name="policy-metrics" label="Metrics" :weight="99">
        <template #default="props">
          <DashboardMetrics
            v-if="props.active"
            :detail-url="metricsProxy"
            :summary-url="metricsProxy"
            :vars="dashboardVars"
            graph-height="825px"
          />
        </template>
      </Tab>
      <Tab v-if="traces" name="policy-tracing" label="Tracing" :weight="98">
        <TraceTable
          :rows="tracesRows"
        />
      </Tab>
    </ResourceTabs>
  </div>
</template>

<style lang="scss" scoped>
.sub-row {
  background-color: var(--body-bg);
  border-bottom: 1px solid var(--sortable-table-top-divider);
  padding-left: 1rem;
  padding-right: 1rem;
}

.details {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 1em;

  .col {
    display: flex;
    flex-direction: column;

    section {
      margin-bottom: 1.5rem;
    }

    .title {
      color: var(--muted);
      margin-bottom: 0.5rem;
    }
  }
}

</style>
