<script>
import { mapGetters } from 'vuex';
import { _CREATE } from '@/config/query-params';
import { SERVICE } from '@/config/types';
import { monitoringStatus } from '@/utils/monitoring';
import { dashboardExists } from '@/utils/grafana';
import CreateEditView from '@/mixins/create-edit-view';
import { POLICY_METRICS_URL, TRACE_HEADERS, OPERATION_MAP } from '@/models/policies.kubewarden.io.admissionpolicy';

import BadgeState from '@/components/BadgeState';
import DashboardMetrics from '@/components/DashboardMetrics';
import ResourceTabs from '@/components/form/ResourceTabs';
import SortableTable from '@/components/SortableTable';
import Tab from '@/components/Tabbed/Tab';

export default {
  name: 'AdmissionPolicy',

  components: {
    BadgeState,
    DashboardMetrics,
    ResourceTabs,
    SortableTable,
    Tab
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
        const duration = span.duration / 1000;

        span.startTime = date.toUTCString();
        span.duration = duration.toFixed(2);

        const keys = ['kind', 'mutated', 'name', 'namespace', 'operation', 'response_message', 'response_code'];
        const tags = keys.map(k => span.tags.find(tag => tag.key === k));

        return tags?.reduce((tag, item) => ({
          ...span, ...tag, [item?.key]: item?.value
        }), {});
      });

      return out;
    }
  },

  methods: {
    color(op) {
      return OPERATION_MAP[op];
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
          <SortableTable
            v-if="traces"
            :rows="tracesRows"
            :headers="TRACE_HEADERS"
            :table-actions="false"
            :row-actions="false"
            key-field="traceID"
            default-sort-by="startTime"
            :sub-expandable="true"
            :sub-expand-column="true"
            :sub-rows="true"
            :paging="true"
            :rows-per-page="10"
          >
            <template #col:operation="{row}">
              <td>
                <BadgeState
                  :label="row.operation"
                  :color="color(row.operation)"
                />
              </td>
            </template>
            <template #sub-row="{row, fullColspan}">
              <td :colspan="fullColspan" class="sub-row">
                <div class="details">
                  <section class="col">
                    <div class="title">
                      Response Message
                    </div>
                    <span class="text-warning">
                      {{ row.response_message }}
                    </span>
                  </section>
                  <section class="col">
                    <div class="title">
                      Response Code
                    </div>
                    <span class="text-info">
                      {{ row.response_code ? row.response_code : 'N/A' }}
                    </span>
                  </section>
                  <section class="col">
                    <div class="title">
                      Mutated
                    </div>
                    <span class="text-info">
                      {{ row.mutated }}
                    </span>
                  </section>
                </div>
              </td>
            </template>
          </SortableTable>
        </template>
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
