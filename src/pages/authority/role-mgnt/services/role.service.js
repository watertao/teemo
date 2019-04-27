import { get, post, del, put } from '@/utils/rest-accessor';


export function findRoles(filterParam) {
  return get('/auth/roles', null, filterParam);
}

export function deleteRole(roleId) {
  return del('/auth/roles/:roleId', { roleId });
}

export function selectRole(roleId) {
  return get('/auth/roles/:roleId', { roleId });
}

export function updateRole(roleId, role) {
  return put('/auth/roles/:roleId', { roleId }, null, role);
}

export function createRole(role) {
  return post('/auth/roles', null, null, role)
}
