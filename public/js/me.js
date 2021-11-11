/*eslint-disable */

import { showAlert } from './alert';

// DOMs
const meContainer = document.getElementById('me-container');
const addressContainer = document.getElementById('address-container');
const passwordContainer = document.getElementById('password');

export async function sendForm(endpoint, formId) {
  const form = document.getElementById(formId);
}

export function getForm(id) {
  meContainer.classList.add('d-none');
  addressContainer.classList.add('d-none');
  passwordContainer.classList.add('d-none');
  document.getElementById(id).classList.remove('d-none');
}
