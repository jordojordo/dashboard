<script>
import { mapGetters } from 'vuex';
import { _EDIT, _VIEW } from '@/config/query-params';
import { KUBEWARDEN } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';

import Edit from '@/edit/policies.kubewarden.io.policyserver/Edit';
import Detail from '@/edit/policies.kubewarden.io.policyserver/Detail';

export default {
  components: { Edit, Detail },

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
    await this.$store.getters['cluster/schemaFor'](KUBEWARDEN.POLICY_SERVER);
  },

  data() {
    return { errors: null };
  },

  computed: {
    ...mapGetters(['currentCluster']),
    ...mapGetters({ t: 'i18n/t' }),

    isView() {
      return this.realMode === _VIEW;
    }
  }
};
</script>

<template>
  <Edit v-if="!isView" :value="value" :mode="mode" />
  <Detail v-else :value="value" :mode="mode" />
</template>
