import SteveModel from '@/plugins/steve/steve-class';
import { ADMISSION_POLICY_STATE } from '@/config/product/kubewarden';
import { KUBEWARDEN, POD } from '@/config/types';

export const RELATED_HEADERS = [
  ADMISSION_POLICY_STATE,
  {
    name:   'name',
    value:  'metadata.name',
    label:  'Name',
    sort:   'name:desc'
  },
  {
    name:   'mode',
    value:  'spec.mode',
    label:  'Mode',
    sort:   'mode'
  },
  {
    name:   'module',
    value:  'spec.module',
    label:  'Module',
    sort:   'module'
  },
  {
    name:      'psCreated',
    label:     'Created',
    value:     'metadata.creationTimestamp',
    formatter: 'LiveDate'
  }
];

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

  get allRelatedPolicies() {
    return async() => {
      const types = [KUBEWARDEN.ADMISSION_POLICY, KUBEWARDEN.CLUSTER_ADMISSION_POLICY];
      const promises = types.map(type => this.$dispatch(`cluster/findAll`, { type, opt: { force: true } }, { root: true }));

      try {
        const out = await Promise.all(promises);

        if ( out ) {
          return out.flatMap(o => o).filter(f => f.spec?.policyServer === this.metadata?.name);
        }
      } catch (e) {
        console.error(`Error fetching related policies: ${ e }`); // eslint-disable-line no-console
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
