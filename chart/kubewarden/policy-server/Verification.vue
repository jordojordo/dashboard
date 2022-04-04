<script>
import { _CREATE } from '@/config/query-params';

import KeyValue from '@/components/form/KeyValue';

export default {
  props: {
    mode: {
      type:    String,
      default: _CREATE
    },
    value: {
      type:     Object,
      required: true
    }
  },

  components: { KeyValue },

  data() {
    return { verificationConfig: [] };
  },

  methods: {
    updateConfig(e) {
      if ( e.length > 0 && e[0].value ) {
        this.value.verificationConfig = e[0].value;
      }
    }
  }
};
</script>

<template>
  <div class="row span-12">
    <KeyValue
      key="verificationConfig"
      v-model="verificationConfig"
      :mode="mode"
      :add-allowed="false"
      :as-map="false"
      :key-editable="false"
      :value-can-be-empty="true"
      :read-multiple="false"
      :read-accept="'*'"
      title="Verification Config"
      @input="(e) => updateConfig(e)"
    />
  </div>
</template>
