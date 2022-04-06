<script>
import jsyaml from 'js-yaml';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import { _CREATE } from '@/config/query-params';
import CreateEditView from '@/mixins/create-edit-view';
import { saferDump } from '@/utils/create-yaml';

import Loading from '@/components/Loading';
import Wizard from '@/components/Wizard';
import Values from '@/edit/policies.kubewarden.io.policyserver/Values';

import defaultPolicyServer from '@/.questions/defaultPolicyServer.json';

export default {
  name: 'Edit',

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
    Loading, Values, Wizard
  },

  mixins: [CreateEditView],

  fetch() {
    this.errors = [];

    const _defaultJson = cloneDeep(JSON.parse(JSON.stringify(defaultPolicyServer)));

    this.chartValues = { questions: _defaultJson };
    this.yamlValues = saferDump(defaultPolicyServer);

    this.value.apiVersion = `${ this.schema?.attributes?.group }.${ this.schema?.attributes?.version }`;
    this.value.kind = this.schema?.attributes?.kind;
  },

  data() {
    return {
      errors:      null,
      chartValues: null,
      yamlValues:  null,

      stepValues:    {
        name:   'values',
        label:  'Values',
        ready:  true,
        weight: 99
      },
    };
  },

  computed: {
    steps() {
      const steps = [];

      steps.push(
        this.stepValues
      );

      return steps.sort((a, b) => b.weight - a.weight);
    },
  },

  methods: {
    cancel() {
      this.done();
    },

    async finish() {
      try {
        if ( this.chartValues?.questions?.spec?.sourceAuthorities ) {
          const s = this.chartValues.questions.spec.sourceAuthorities.split();

          this.chartValues.questions.spec.sourceAuthorities = s;
        }
        const out = this.chartValues?.questions ? this.chartValues.questions : jsyaml.load(this.yamlValues);

        merge(this.value, out);

        await this.save();
      } catch (e) {
        console.error(`Error when saving: ${ e }`); // eslint-disable-line no-console
        this.errors.push(e);
      }
    },
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" mode="relative" />
  <Wizard
    v-else
    ref="wizard"
    v-model="value"
    :errors="errors"
    :show-banner="false"
    :steps="steps"
    :edit-first-step="true"
    class="wizard"
    @cancel="cancel"
    @finish="finish"
  >
    <template #values>
      <Values :value="value" :chart-values="chartValues" :yaml-values="yamlValues" :mode="mode" />
    </template>
  </Wizard>
</template>
