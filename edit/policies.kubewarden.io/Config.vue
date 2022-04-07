<script>
import { KUBEWARDEN } from '@/config/types';
import { _VIEW } from '@/config/query-params';
import { typeOf } from '@/utils/sort';
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
      this.chartValues = { policy: this.value, questions: { questions: [] } };
      this.policyQuestions();
    }
  },

  data() {
    return { chartValues: null };
  },

  provide() {
    return { chartType: this.value.type };
  },

  methods: {
    policyQuestions() {
      // Add a field from policy chart to the questions object
      if ( this.value?.spec?.settings ) {
        for ( const [key, value] of Object.entries(this.value.spec.settings) ) {
          const out = {
            default:  value,
            group:    'Settings',
            label:    key,
            type:     typeOf(value),
            variable: `policy.spec.settings.${ key }`
          };

          // Why questions.questions you ask? It's because of allQuestions() in `@/components/questions.vue`
          this.chartValues?.questions.questions.push(out);
        }
      }
    }
  }
};
</script>

<template>
  <Values :value="value" :chart-values="chartValues" :mode="realMode" />
</template>
