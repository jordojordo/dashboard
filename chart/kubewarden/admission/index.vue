<script>
import { _CREATE } from '@/config/query-params';

import General from '@/chart/kubewarden/admission/General';
import Rules from '@/chart/kubewarden/admission/Rules';

import Questions from '@/components/Questions';
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
    General, Rules, Questions, Tab
  },

  data() {
    return { chartValues: this.value };
  },

  computed: {
    hasSettings() {
      return !!this.value.policy?.spec?.settings;
    },

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
      <General v-model="chartValues" :mode="mode" :target-namespace="targetNamespace" />
    </Tab>
    <Tab name="rules" label="Rules" :weight="98">
      <Rules v-model="chartValues" :mode="mode" />
    </Tab>
    <!-- Values as questions -->
    <template v-if="hasSettings">
      <Tab name="Settings" label="Settings" :weight="97">
        <Questions
          v-model="chartValues.policy.spec.settings"
          :mode="mode"
          :source="chartValues"
          tabbed="never"
          :target-namespace="targetNamespace"
        />
      </Tab>
    </template>
  </div>
</template>
