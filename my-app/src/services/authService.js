import { api } from './api';

export async function authenticateUser(emailOrCode, password) {
  return api.login(emailOrCode, password);
}