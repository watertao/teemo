import { get, post, del, put } from '@/utils/rest-accessor';


export function findUsers(filterParam) {
  return get('/auth/users', null, filterParam);
}

export function deleteUser(userId) {
  return del('/auth/users/:userId', { userId });
}

export function selectUser(userId) {
  return get('/auth/users/:userId', { userId });
}

export function updateUser(userId, user) {
  return put('/auth/users/:userId', { userId }, null, user);
}

export function createUser(user) {
  return post('/auth/users', null, null, user)
}

export function fetchFullRoles() {
  return get('/auth/roles', null, {
    infinite_count: true,
  });
}
