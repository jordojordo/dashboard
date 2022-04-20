<script>
import { _CREATE, _VIEW } from '@/config/query-params';

import ArrayList from '@/components/form/ArrayList';
import ArrayListGrouped from '@/components/form/ArrayListGrouped';
import LabeledInput from '@/components/form/LabeledInput';
import RadioGroup from '@/components/form/RadioGroup';
import YamlEditor from '@/components/YamlEditor';

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
    ArrayList, ArrayListGrouped, LabeledInput, RadioGroup, YamlEditor
  },

  data() {
    return { openYamlEditor: false };
  },

  watch: {
    openYamlEditor() {
      switch (this.openYamlEditor) {
      case false:
        this.value.sourceAuthorities = null;
        break;
      default:
        break;
      }
    }
  },

  computed: {
    isView() {
      return this.mode === _VIEW;
    },

    showInsecureSources() {
      if ( this.isView && !this.value?.insecureSources ) {
        return false;
      }

      return true;
    }
  },
};
</script>

<template>
  <div>
    <div class="row">
      <div class="col span-6">
        <LabeledInput
          v-model="value.verificationConfig"
          :mode="mode"
          label="Verification Config"
          tooltip="Name of VerificationConfig configmap in the same namespace, containing Sigstore verification configuration. The configuration must be under a key named verification-config in the Configmap."
        />
      </div>
    </div>
    <div class="spacer"></div>

    <template v-if="showInsecureSources">
      <div class="row">
        <div class="col span-12">
          <ArrayListGrouped
            :mode="mode"
            add-label="Add Sources"
          >
            <template #default>
              <div class="row">
                <div class="col span-12">
                  <ArrayList
                    key="insecureSources"
                    v-model="value.insecureSources"
                    title="Insecure Sources"
                    value-placeholder="e.g. registry.dev.my-corp.com"
                    add-label="Add Insecure Source"
                    :mode="mode"
                    protip="List of insecure URIs to policy repositories."
                  />
                </div>
              </div>
              <div class="spacer"></div>
              <div class="row">
                <div class="col span-12">
                  <RadioGroup
                    v-model="openYamlEditor"
                    name="openYamlEditor"
                    :options="[false, true]"
                    :mode="mode"
                    class="mb-10"
                    label="Add Source Authorities"
                    :labels="['No', 'Yes']"
                    tooltip="Allows you to provide a specific certificate authority the host can be validated against."
                  />
                  <template v-if="openYamlEditor">
                    <YamlEditor
                      v-model="value.sourceAuthorities"
                    />
                  </template>
                </div>
              </div>
            </template>
          </ArrayListGrouped>
        </div>
      </div>
    </template>
  </div>
</template>
