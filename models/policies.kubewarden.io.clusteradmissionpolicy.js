import PolicyModel from '@/plugins/kubewarden/policy-class';

export const TRACE_HEADERS = [
  {
    name:  'operation',
    value: 'operation',
    label: 'Operation',
    sort:  'operation'
  },
  {
    name:   'kind',
    value:  'kind',
    label:  'Kind',
    sort:   'kind'
  },
  {
    name:  'name',
    value: 'name',
    label: 'Name',
    sort:  'name'
  },
  {
    name:  'namespace',
    value: 'namespace',
    label: 'Namespace',
    sort:  'namespace'
  },
  {
    name:   'startTime',
    value:  'startTime',
    label:  'Start Time',
    sort:   'startTime:desc'
  },
  {
    name:   'duration',
    value:  'duration',
    label:  'Duration (ms)',
    sort:   'duration'
  }
];

export const OPERATION_MAP = {
  CREATE: 'bg-info',
  UPDATE: 'bg-warning',
  DELETE: 'bg-error'
};

export default class ClusterAdmissionPolicy extends PolicyModel {
}
