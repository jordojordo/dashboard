<script>
import { TRACE_HEADERS, OPERATION_MAP } from '@/plugins/kubewarden/policy-class';
import { KUBEWARDEN } from '@/config/types';

import BadgeState from '@/components/BadgeState';
import SortableTable from '@/components/SortableTable';

export default {
  props: {
    rows: {
      type:     Array,
      required: true
    }
  },

  components: { BadgeState, SortableTable },

  data() {
    return {
      TRACE_HEADERS,
      OPERATION_MAP
    };
  },

  computed: {
    groupField() {
      if ( !!this.isPolicyServer ) {
        return 'policy_id';
      }

      return null;
    },

    isPolicyServer() {
      return this.$route.params.resource === KUBEWARDEN.POLICY_SERVER;
    },

    rowsPerPage() {
      if ( !!this.isPolicyServer ) {
        return 50;
      }

      return 10;
    }
  },

  methods: {
    color(op) {
      return this.OPERATION_MAP[op];
    },

    capitalizeMessage(m) {
      return m.charAt(0).toUpperCase() + m.slice(1);
    }
  }
};
</script>

<template>
  <SortableTable
    :rows="rows"
    :headers="TRACE_HEADERS"
    :group-by="groupField"
    :table-actions="false"
    :row-actions="false"
    key-field="traceID"
    default-sort-by="startTime"
    :sub-expandable="true"
    :sub-expand-column="true"
    :sub-rows="true"
    :paging="true"
    :rows-per-page="rowsPerPage"
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
              {{ capitalizeMessage(row.response_message) }}
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
