<script>
import { _CREATE } from '@/config/query-params';
import { KUBEWARDEN } from '@/config/types';

import NameNsDescription from '@/components/form/NameNsDescription';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import RadioGroup from '@/components/form/RadioGroup.vue';

export default {
  name: 'General',

  inject: ['chartType'],

  props: {
    mode: {
      type:    String,
      default: _CREATE
    },
    targetNamespace: {
      type:     String,
      required: true
    },
    value: {
      type:     Object,
      required: true
    }
  },

  components: {
    NameNsDescription,
    LabeledInput,
    LabeledSelect,
    RadioGroup
  },

  async fetch() {
    this.policyServers = await this.$store.dispatch('cluster/findAll', { type: KUBEWARDEN.POLICY_SERVER });
  },

  data() {
    return { policyServers: [] };
  },

  computed: {
    isGlobal() {
      return this.chartType === KUBEWARDEN.CLUSTER_ADMISSION_POLICY;
    },

    policyServerOptions() {
      if ( this.policyServers.length > 0 ) {
        const out = [];

        this.policyServers.map(p => out.push(p.id));

        return out;
      }

      return this.policyServers;
    }
  }
};
</script>

<template>
  <div>
    <div class="row">
      <div class="col span-12">
        <NameNsDescription
          :mode="mode"
          :value="value"
          :description-hidden="true"
          :namespaced="!isGlobal"
          name-key="policy.metadata.name"
          namespace-key="policy.metadata.namespace"
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="value.policy.spec.policyServer"
          :value="value"
          :mode="mode"
          :options="policyServerOptions"
          label="Policy Server"
          tooltip="The PolicyServer that will receive the requests to be validated."
        />
      </div>
      <div class="col span-6">
        <LabeledInput
          v-model="value.policy.spec.module"
          :mode="mode"
          label="Module"
          tooltip="This is the WebAssembly module that holds the validation or mutation logic."
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <RadioGroup
          v-model="value.policy.spec.mutating"
          name="mutating"
          :options="[false, true]"
          :mode="mode"
          label="Mutating"
          :labels="['No', 'Yes']"
          tooltip="A mutating policy will rebuild the requests with definied values that are conformant with the policy definition."
        />
      </div>
    </div>
  </div>
</template>
