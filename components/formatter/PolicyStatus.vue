<script>
import BadgeState from '@/components/BadgeState';

export default {
  components: { BadgeState },

  props:      {
    value: {
      type:     String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
    },
  },

  data() {
    return {
      stateDisplay:    '',
      stateBackground: ''
    };
  },

  watch: {
    value: {
      handler() {
        const color = this.colorForStatus(this.value);

        this.stateDisplay = this.value;
        this.stateBackground = color.replace('text-', 'bg-');
      },

      immediate: true
    }
  },

  methods: {
    colorForStatus(value) {
      switch (value) {
      case 'unscheduled':
        return 'text-warning';
      case 'active':
        return 'text-success';
      default:
        break;
      }

      return 'text-error';
    },
  }
};
</script>

<template>
  <div>
    <div>
      <BadgeState
        v-if="value"
        :color="stateBackground"
        :label="stateDisplay"
      />
    </div>
  </div>
</template>
