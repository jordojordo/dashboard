<script>
import { mapGetters } from 'vuex';
import { _CREATE, _EDIT } from '@/config/query-params';
import { KUBEWARDEN } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';

import CruResource from '@/components/CruResource';
import Config from '@/edit/policies.kubewarden.io.policyserver/Config';
import Create from '@/edit/policies.kubewarden.io.policyserver/Create';

export default {
  components: {
    CruResource, Config, Create
  },

  mixins: [CreateEditView],

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
    this.errors = [];

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
    }
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
