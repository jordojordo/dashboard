<script>
import { _EDIT } from '@/config/query-params';
import { saferDump } from '@/utils/create-yaml';

import Values from '@/edit/policies.kubewarden.io.policyserver/Values';

export default {
  name: 'Detail',

  props: {
    mode: {
      type:    String,
      default: _EDIT
    },
    value: {
      type:     Object,
      required: true
    }
  },

  components: { Values },

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
  <div>
    <Values :value="value" :chart-values="chartValues" :yaml-values="yamlValues" :mode="mode" />
  </div>
</template>
