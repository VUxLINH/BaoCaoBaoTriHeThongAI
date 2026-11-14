import { api } from './api';

export async function authenticateUser(emailOrCode, password, selectedTabRole) {
  return api.login(emailOrCode, password, selectedTabRole);
}