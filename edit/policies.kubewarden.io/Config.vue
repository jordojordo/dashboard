<script>
import { _VIEW } from '@/config/query-params';
import CreateEditView from '@/mixins/create-edit-view';

import Values from '@/edit/policies.kubewarden.io/Values';

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

  components: { Values },

  mixins: [CreateEditView],

  fetch() {
    if ( this.value ) {
      this.chartValues = { questions: this.value };
    }
  },

  data() {
    return { chartValues: null };
  },

  provide() {
    return { chartType: this.value.type };
  },
};
</script>

<template>
  <Values :value="value" :chart-values="chartValues" :mode="realMode" />
</template>
