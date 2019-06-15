import { get, post } from '@/utils/rest-accessor';


export function findAuditlogs(filterParam) {
  return get('/auth/auditlogs', null, filterParam);
}


export function findOperators(filterParam) {
  return get('/metadata/auth/auditlogs/operators', null, filterParam);
}

export function findResources(filterParam) {
  return get('/metadata/auth/auditlogs/resources', null, filterParam);
}
