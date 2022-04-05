<script>
import jsyaml from 'js-yaml';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import { _CREATE } from '@/config/query-params';
import CreateEditView from '@/mixins/create-edit-view';
import { VALUES_STATE, YAML_OPTIONS } from '@/models/policies.kubewarden.io.policyserver';
import { saferDump } from '@/utils/create-yaml';

import ButtonGroup from '@/components/ButtonGroup';
import Loading from '@/components/Loading';
import ResourceCancelModal from '@/components/ResourceCancelModal';
import Tabbed from '@/components/Tabbed';
import Wizard from '@/components/Wizard';
import YamlEditor from '@/components/YamlEditor';

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
    ButtonGroup, Loading, ResourceCancelModal, Tabbed, Wizard, YamlEditor
  },

  mixins: [CreateEditView],

  async fetch() {
    this.errors = [];

    try {
      await this.loadValuesComponent();
    } catch (e) {
      console.error(`Error loading values component: ${ e }`); // eslint-disable-line no-console
    }

    const _defaultJson = cloneDeep(JSON.parse(JSON.stringify(defaultPolicyServer)));

    this.chartValues = { questions: _defaultJson };
    this.yamlValues = saferDump(defaultPolicyServer);

    this.value.apiVersion = `${ this.schema?.attributes?.group }.${ this.schema?.attributes?.version }`;
    this.value.kind = this.schema?.attributes?.kind;
  },

  data() {
    return {
      errors:              null,
      showQuestions:       true,
      showValuesComponent: false,
      valuesComponent:     null,
      yamlOption:          VALUES_STATE.YAML,

      chartValues:         null,
      yamlValues:          null,

      YAML_OPTIONS,

      stepValues:    {
        name:   'values',
        label:  'Values',
        ready:  true,
        weight: 99
      },
    };
  },

  watch: {
    yamlOption(neu, old) {
      switch (neu) {
      case VALUES_STATE.FORM:
        this.showQuestions = true;

        break;
      case VALUES_STATE.YAML:
        this.showQuestions = false;

        break;
      }
    },
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
    async loadValuesComponent() {
      if ( this.$store.getters['catalog/haveComponent']('kubewarden/policy-server') ) {
        this.valuesComponent = this.$store.getters['catalog/importComponent']('kubewarden/policy-server');
        await this.valuesComponent();

        this.showValuesComponent = true;
      }
    },

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

    tabChanged() {
      window.scrollTop = 0;
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
      <div class="step__values__controls">
        <ButtonGroup
          v-model="yamlOption"
          :options="YAML_OPTIONS"
          inactive-class="bg-disabled btn-sm"
          active-class="bg-primary btn-sm"
        ></ButtonGroup>
      </div>
      <div class="scroll__container">
        <div class="scroll__content">
          <template v-if="showQuestions">
            <Tabbed
              ref="tabs"
              :side-tabs="true"
              class="step__values__content"
              @changed="tabChanged($event)"
            >
              <component
                :is="valuesComponent"
                v-model="chartValues"
                :mode="mode"
              />
            </Tabbed>
          </template>
          <template v-else>
            <YamlEditor
              ref="yaml"
              v-model="yamlValues"
              class="step__values__content"
              :scrolling="true"
              :initial-yaml-values="originalYamlValues"
              :editor-mode="editorMode"
              :hide-preview-buttons="true"
            />
          </template>

          <ResourceCancelModal
            ref="cancelModal"
            :is-cancel-modal="false"
            :is-form="true"
            @cancel-cancel="preYamlOption = yamlOption"
            @confirm-cancel="yamlOption = preYamlOption"
          />
        </div>
      </div>
    </template>
  </Wizard>
</template>

<style lang="scss" scoped>
  $padding: 5px;
  $height: 110px;
  $side: 15px;
  $margin: 10px;
  $logo: 60px;

  ::v-deep .step-container {
    height: auto;
  }

  .step {
    &__basic {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow-x: hidden;

      .spacer {
        line-height: 2;
      }
    }

    &__values {
      &__controls {
        display: flex;
        margin-bottom: 15px;

        & > *:not(:last-of-type) {
          margin-right: $padding * 2;
        }

        &--spacer {
          flex: 1
        }

      }

      &__content {
        flex: 1;

        ::v-deep .tab-container {
          overflow: auto;
        }
      }
    }
  }
</style>
