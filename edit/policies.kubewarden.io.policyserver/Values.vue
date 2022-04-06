<script>
import { _CREATE } from '@/config/query-params';
import { VALUES_STATE, YAML_OPTIONS } from '@/models/policies.kubewarden.io.policyserver';

import ButtonGroup from '@/components/ButtonGroup';
import ResourceCancelModal from '@/components/ResourceCancelModal';
import Tabbed from '@/components/Tabbed';
import YamlEditor from '@/components/YamlEditor';

export default {
  name: 'Values',

  props: {
    mode: {
      type:    String,
      default: _CREATE
    },
    chartValues: {
      type:     Object,
      required: true
    },
    yamlValues: {
      type:     Object,
      required: true
    },
    value: {
      type:     Object,
      required: true
    }
  },

  components: {
    ButtonGroup, ResourceCancelModal, Tabbed, YamlEditor
  },

  async fetch() {
    try {
      await this.loadValuesComponent();
    } catch (e) {
      console.error(`Error loading values component: ${ e }`); // eslint-disable-line no-console
    }
  },

  data() {
    return {
      YAML_OPTIONS,
      showQuestions:       true,
      showValuesComponent: false,
      valuesComponent:     null,
      yamlOption:          VALUES_STATE.YAML,
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

  methods: {
    async loadValuesComponent() {
      if ( this.$store.getters['catalog/haveComponent']('kubewarden/policy-server') ) {
        this.valuesComponent = this.$store.getters['catalog/importComponent']('kubewarden/policy-server');
        await this.valuesComponent();

        this.showValuesComponent = true;
      }
    },

    tabChanged() {
      window.scrollTop = 0;
    },
  }
};
</script>

<template>
  <div>
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
  </div>
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
