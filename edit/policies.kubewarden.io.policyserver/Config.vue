<script>
import { _VIEW } from '@/config/query-params';
import { saferDump } from '@/utils/create-yaml';

import Loading from '@/components/Loading';
import Values from '@/edit/policies.kubewarden.io.policyserver/Values';

export default {
  name: 'Config',

  props: {
    mode: {
      type:    String,
      default: _VIEW
    },
    value: {
      type:     Object,
      required: true
    }
  },

  components: { Loading, Values },

  fetch() {
    if ( this.value ) {
      this.chartValues = { questions: this.value };
      this.yamlValues = saferDump(this.value);
    }
  },

  data() {
    return {
      chartValues: null,
      yamlValues:  null
    };
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" mode="relative" />
  <Values v-else :value="value" :chart-values="chartValues" :yaml-values="yamlValues" :mode="mode" />
</template>
