<script>
import { _CREATE } from '@/config/query-params';

import General from '@/chart/kubewarden/policy-server/General';
import Labels from '@/chart/kubewarden/policy-server/Labels';
import Verification from '@/chart/kubewarden/policy-server/Verification';
import Tab from '@/components/Tabbed/Tab';

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

  components: {
    General, Labels, Tab, Verification
  },

  data() {
    return { chartValues: this.value.questions };
  },

  computed: {
    targetNamespace() {
      if ( this.forceNamespace ) {
        return this.forceNamespace;
      } else if ( this.value?.metadata?.namespace ) {
        return this.value.metadata.namespace;
      }

      return 'default';
    },
  }
};
</script>

<template>
  <div>
    <Tab name="general" label="General" :weight="99">
      <General v-model="chartValues" :mode="mode" />
    </Tab>
    <Tab name="labels" label="Labels & Annotations" :weight="98">
      <Labels v-model="chartValues.metadata" :mode="mode" />
    </Tab>
    <Tab name="verification" label="Verification" :weight="97">
      <Verification :value="chartValues.spec" :mode="mode" />
    </Tab>
  </div>
</template>
