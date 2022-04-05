<script>
import { _CREATE } from '@/config/query-params';

import LabeledInput from '@/components/form/LabeledInput';
import NameNsDescription from '@/components/form/NameNsDescription';
import RadioGroup from '@/components/form/RadioGroup';

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
    LabeledInput, NameNsDescription, RadioGroup
  },

  data() {
    return { defaultImage: true };
  }
};
</script>

<template>
  <div>
    <div class="row mt-10">
      <div class="col span-12">
        <NameNsDescription
          :mode="mode"
          :value="value"
          :namespaced="false"
          :description-hidden="true"
          name-key="metadata.name"
        />
      </div>
    </div>
    <div class="row">
      <div class="col span-6">
        <RadioGroup
          v-model="defaultImage"
          name="defaultImage"
          :options="[false, true]"
          :mode="mode"
          class="mb-10"
          label="Default Image"
          :labels="['No', 'Yes']"
          tooltip="Use the default `policy-server` container image"
        />
        <template v-if="!defaultImage">
          <LabeledInput
            v-model="value.spec.image"
            :mode="mode"
            label="Image URL"
            tooltip="This is the container image the policy server."
          />
        </template>
      </div>
    </div>
    <div class="spacer"></div>
    <div class="row">
      <div class="col span-6">
        <h3>
          Service Account Name
        </h3>
        <LabeledInput
          v-model="value.spec.serviceAccountName"
          :mode="mode"
          label="ServiceAccount Name"
        />
      </div>
      <div class="col span-6">
        <h3>
          Replicas
        </h3>
        <LabeledInput
          v-model.number="value.spec.replicas"
          type="number"
          min="0"
          required
          :mode="mode"
          label="Replicas"
        />
      </div>
    </div>
  </div>
</template>
