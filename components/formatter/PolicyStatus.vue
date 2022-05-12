<script>
import BadgeState from '@/components/BadgeState';

export default {
  components: { BadgeState },

  props:      {
    value: {
      type:     String,
      default: ''
    }
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
      case 'unschedulable':
        return 'text-error';
      case 'pending':
        return 'text-info';
      case 'active':
        return 'text-success';
      default:
        break;
      }

      return 'text-warning'; // 'unscheduled' is the default state
    },
  }
};
</script>

<template>
  <div>
    <BadgeState
      v-if="value"
      :color="stateBackground"
      :label="stateDisplay"
    />
  </div>
</template>
