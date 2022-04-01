import SteveModel from '@/plugins/steve/steve-class';
import { KUBEWARDEN, POD } from '@/config/types';

export const VALUES_STATE = {
  FORM: 'FORM',
  YAML: 'YAML',
};

export const YAML_OPTIONS = [
  {
    labelKey: 'catalog.install.section.chartOptions',
    value:    VALUES_STATE.FORM,
  },
  {
    labelKey: 'catalog.install.section.valuesYaml',
    value:    VALUES_STATE.YAML,
  }
];

export default class PolicyServer extends SteveModel {
  get _availableActions() {
    const out = super._availableActions;

    const logs = {
      action:  'openLogs',
      enabled: true,
      icon:    'icon icon-fw icon-chevron-right',
      label:   'View Logs',
    };

    out.unshift(logs);

    return out;
  }

  get allPolicies() {
    return async() => {
      try {
        return await this.$store.dispatch('cluster/findAll', { type: KUBEWARDEN.POLICY_SERVER }, { root: true });
      } catch (e) {
        console.error(`Error fetching policies: ${ e }`); // eslint-disable-line no-console
      }
    };
  }

  async openLogs() {
    try {
      const pod = await this.$dispatch('cluster/findMatching', {
        type:     POD,
        selector: `app=kubewarden-policy-server-${ this.metadata?.name }` // kubewarden-policy-server is hardcoded from the kubewarden-controller
      }, { root: true });

      if ( pod ) {
        this.$dispatch('wm/open', {
          id:        `${ this.id }-logs`,
          label:     this.nameDisplay,
          icon:      'file',
          component: 'ContainerLogs',
          attrs:     { pod: pod[0] }
        }, { root: true });
      }
    } catch (e) {
      console.error('Error dispatching console for pod', e); // eslint-disable-line no-console
    }
  }
}
