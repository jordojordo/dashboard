<script>
import { _CREATE } from '@/config/query-params';
import CreateEditView from '@/mixins/create-edit-view';
import { RELATED_HEADERS } from '@/models/policies.kubewarden.io.policyserver';

import ResourceTabs from '@/components/form/ResourceTabs';
import ResourceTable from '@/components/ResourceTable';
import Tab from '@/components/Tabbed/Tab';

export default {
  name: 'PolicyServer',

  components: {
    ResourceTabs, ResourceTable, Tab
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
    this.relatedPolicies = await this.value.allRelatedPolicies();
  },

  data() {
    return {
      RELATED_HEADERS,
      relatedPolicies: null
    };
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
    </ResourceTabs>
  </div>
</template>
