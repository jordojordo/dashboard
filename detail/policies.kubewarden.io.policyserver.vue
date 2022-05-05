<script>
import { mapGetters } from 'vuex';
import { _CREATE } from '@/config/query-params';
import { RELATED_HEADERS } from '@/models/policies.kubewarden.io.policyserver';
import { dashboardExists } from '@/utils/grafana';
import { monitoringStatus } from '@/utils/monitoring';
import CreateEditView from '@/mixins/create-edit-view';

import DashboardMetrics from '@/components/DashboardMetrics';
import ResourceTabs from '@/components/form/ResourceTabs';
import ResourceTable from '@/components/ResourceTable';
import Tab from '@/components/Tabbed/Tab';
import TraceTable from '@/components/TraceTable';

export default {
  name: 'PolicyServer',

  components: {
    DashboardMetrics, ResourceTabs, ResourceTable, Tab, TraceTable
  },

  mixins: [CreateEditView],

  props: {
    mode: {
      type:    String,
      default: _CREATE,
    },
    value: {
      type:     Object,
      required: true,
    }
  },

  async fetch() {
    const inStore = this.$store.getters['currentStore'](this.resource);

    this.relatedPolicies = await this.value.allRelatedPolicies();

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

    const jaegerProxy = await this.value.jaegerProxy();

    if ( jaegerProxy ) {
      const promises = jaegerProxy.map(p => this.$store.dispatch(`${ inStore }/request`, { url: p }));

      try {
        this.traces = await Promise.all(promises);
      } catch (e) {
        console.error(`Error fetching Jaeger service: ${ e }`); // eslint-disable-line no-console
      }
    }
  },

  data() {
    return {
      RELATED_HEADERS,
      metricsProxy:    null,
      metricsService:  null,
      relatedPolicies: null,
      traces:          null
    };
  },

  computed: {
    ...mapGetters(['currentCluster']),
    ...monitoringStatus(),

    tracesRows() {
      return this.value.consolidateTracesRows(this.traces);
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
      <Tab v-if="relatedPolicies" name="related-policies" label="Policies" :weight="1">
        <template #default>
          <ResourceTable
            :rows="relatedPolicies"
            :headers="RELATED_HEADERS"
            :groupable="true"
            group-by="kind"
            :table-actions="true"
          >
            <template #col:operation="{row}">
              <td>
                <BadgeState
                  :label="row.operation"
                  :color="color(row.operation)"
                />
              </td>
            </template>
          </ResourceTable>
        </template>
      </Tab>
      <Tab v-if="metricsService" name="policy-metrics" label="Metrics" :weight="2">
        <template #default="props">
          <DashboardMetrics
            v-if="props.active"
            :detail-url="metricsProxy"
            :summary-url="metricsProxy"
            graph-height="825px"
          />
        </template>
      </Tab>
      <Tab v-if="traces" name="policy-tracing" label="Tracing">
        <template>
          <TraceTable
            :rows="tracesRows"
          />
        </template>
      </Tab>
    </ResourceTabs>
  </div>
</template>
