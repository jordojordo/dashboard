<script>
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import { _CREATE } from '@/config/query-params';
import CreateEditView from '@/mixins/create-edit-view';

import Loading from '@/components/Loading';
import CruResource from '@/components/CruResource';
import Values from '@/edit/policies.kubewarden.io.policyserver/Values';

import defaultPolicyServer from '@/.questions/defaultPolicyServer.json';

export default {
  name: 'Create',

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
    Loading, Values, CruResource
  },

  mixins: [CreateEditView],

  fetch() {
    this.errors = [];

    const _defaultJson = cloneDeep(JSON.parse(JSON.stringify(defaultPolicyServer)));

    this.chartValues = { questions: _defaultJson };

    this.value.apiVersion = `${ this.schema?.attributes?.group }.${ this.schema?.attributes?.version }`;
    this.value.kind = this.schema?.attributes?.kind;
  },

  data() {
    return {
      errors:      null,
      chartValues: null,
    };
  },

  methods: {
    async finish() {
      try {
        if ( this.chartValues?.questions?.spec?.sourceAuthorities ) {
          const s = this.chartValues.questions.spec.sourceAuthorities.split();

          this.chartValues.questions.spec.sourceAuthorities = s;
        }

        merge(this.value, this.chartValues?.questions);

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
  <CruResource
    v-else
    :resource="value"
    :mode="realMode"
    @finish="finish"
  >
    <Values :value="value" :chart-values="chartValues" :mode="mode" />
  </CruResource>
</template>
