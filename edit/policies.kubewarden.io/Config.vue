<script>
import { _CREATE, _VIEW } from '@/config/query-params';

import Values from '@/edit/policies.kubewarden.io/Values';

export default {
  name: 'Config',

  props: {
    mode: {
      type:     String,
      default:  _VIEW
    },
    value: {
      type:     Object,
      required: true
    }
  },

  components: { Values },

  fetch() {
    if ( this.value ) {
      this.chartValues = {
        policy:    this.value,
        questions: { questions: this.value.policyQuestions }
      };
    }
  },

  data() {
    return { chartValues: null };
  },

  provide() {
    return { chartType: this.value.type };
  },

  computed: {
    // if coming from the "View Yaml" page `this.mode` will display `create` - this is not legit.
    legitMode() {
      if ( this.mode === _CREATE ) {
        return _VIEW;
      }

      return this.mode;
    }
  }
};
</script>

<template>
  <Values :value="value" :chart-values="chartValues" :mode="legitMode" />
</template>
