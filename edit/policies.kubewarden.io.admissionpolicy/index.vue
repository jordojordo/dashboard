<script>
import { _CREATE, _EDIT } from '@/config/query-params';
import ChartMixin from '@/mixins/chart';
import CreateEditView from '@/mixins/create-edit-view';

import CruResource from '@/components/CruResource';
import Create from '@/edit/policies.kubewarden.io/Create';
import Config from '@/edit/policies.kubewarden.io/Config';

export default {
  name: 'AdmissionPolicy',

  props: {
    value: {
      type:     Object,
      required: true
    },
    mode: {
      type:    String,
      default: _EDIT
    },
    realMode: {
      type:    String,
      default: _EDIT
    }
  },

  components: {
    CruResource, Config, Create
  },

  mixins: [ChartMixin, CreateEditView],

  async fetch() {
    await this.fetchChart();
  },

  provide() {
    return { chartType: this.value.type };
  },

  computed: {
    isCreate() {
      return this.realMode === _CREATE;
    },
  },

  methods: {
    async finish() {
      try {
        await this.save();
      } catch (e) {
        console.error(`Error when saving: ${ e }`); // eslint-disable-line no-console
        this.errors.push(e);
      }
    },
  }
};
</script>

<template>
  <Create v-if="isCreate" :value="value" :mode="mode" />
  <CruResource
    v-else
    :resource="value"
    :mode="realMode"
    @finish="finish"
  >
    <Config :value="value" :mode="mode" />
  </CruResource>
</template>
