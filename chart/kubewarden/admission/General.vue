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
    let policy = null;

    if ( this.value.policy ) {
      policy = this.value.policy;
    } else {
      policy = this.value;
    }

    return { policyServers: [], policy };
  },

  computed: {
    isCreate() {
      return this.mode === _CREATE;
    },

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
          :value="policy"
          :description-hidden="true"
          :namespaced="!isGlobal"
          name-key="metadata.name"
          namespace-key="metadata.namespace"
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="policy.spec.policyServer"
          :value="value"
          :mode="mode"
          :options="policyServerOptions"
          label="Policy Server"
          tooltip="The PolicyServer that will receive the requests to be validated."
        />
      </div>
      <div class="col span-6">
        <LabeledInput
          v-model="policy.spec.module"
          :mode="mode"
          label="Module"
          tooltip="This is the WebAssembly module that holds the validation or mutation logic."
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <RadioGroup
          v-model="policy.spec.mutating"
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
