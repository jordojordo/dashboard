<script>
import { _CREATE } from '@/config/query-params';

import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';

export default {
  name: 'Rules',

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
    LabeledInput,
    LabeledSelect,
  },

  async fetch() {
    this.apiGroups = await this.$store.dispatch('cluster/findAll', { type: 'apigroup' });

    if ( !!this.value.policy ) {
      this.rules = this.value.policy.spec.rules[0];
    }

    if ( this.rules.resources ) {
      this.resourceOptions = this.rules.resources;
    }
  },

  data() {
    const operationOptions = [
      'CREATE',
      'UPDATE',
      'DELETE'
    ];

    return {
      apiGroups: [],
      rules:     null,

      resourceOptions: [],
      operationOptions
    };
  },

  computed: {
    apiGroupOptions() {
      if ( this.apiGroups.length > 0 ) {
        const out = [];

        this.apiGroups.map(g => out.push(g.id));

        return out;
      }

      return this.apiGroups;
    }
  }
};
</script>

<template>
  <div v-if="rules">
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="rules.apiGroups"
          label="API Groups"
          :mode="mode"
          :multiple="true"
          :options="apiGroupOptions"
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput
          v-model="rules.apiVersions"
          label="API Versions"
          :mode="mode"
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="rules.resources"
          label="Resources"
          :mode="mode"
          :multiple="true"
          :options="resourceOptions"
          tooltip="The targeted resources for the policy. A resource that is supported by the policy is determined in the `metadata.yml` of the selected policy."
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="rules.operations"
          label="Operations"
          :mode="mode"
          :multiple="true"
          :options="operationOptions"
          tooltip="The type of operation to be validated."
        />
      </div>
    </div>
  </div>
</template>
