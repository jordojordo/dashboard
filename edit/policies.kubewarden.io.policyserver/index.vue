<script>
import { mapGetters } from 'vuex';
import { _CREATE, _EDIT } from '@/config/query-params';
import { KUBEWARDEN } from '@/config/types';
import ChartMixin from '@/mixins/chart';
import CreateEditView from '@/mixins/create-edit-view';

import Create from '@/edit/policies.kubewarden.io.policyserver/Create';
import CruResource from '@/components/CruResource';

export default {
  components: { Create, CruResource },

  mixins: [ChartMixin, CreateEditView],

  props: {
    mode: {
      type:    String,
      default: _EDIT
    },
    realMode: {
      type:    String,
      default: _EDIT
    },
    value: {
      type:     Object,
      required: true
    },
  },

  async fetch() {
    await this.$store.getters['cluster/schemaFor'](KUBEWARDEN.POLICY_SERVER);
  },

  data() {
    return { errors: null };
  },

  computed: {
    ...mapGetters(['currentCluster']),
    ...mapGetters({ t: 'i18n/t' }),

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
    :errors="errors"
    @error="e => errors = e"
    @finish="finish"
  >
  </CruResource>
</template>
