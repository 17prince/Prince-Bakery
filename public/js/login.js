/*eslint-disable*/

// import axios from 'axios';
import { showAlert } from './alert';
// login
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert(res.data.status, 'Successfully Logged In', 1);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message, 5);
  }
};

export const signUp = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        confirmPassword,
      },
    });
    if (res.data.status === 'success') {
      showAlert(res.data.status, 'Account Successfully Created', 1);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message, 5);
  }
};

// logout
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') window.location.replace('/');
  } catch (error) {
    showAlert('error', 'Error while logging out ! Please try again', 5);
  }
};

// Forgot Password and reset password
export const forgotAndResetPassword = async (method, endpoint, newData) => {
  try {
    const res = await axios({
      method: method,
      url: endpoint,
      data: newData,
    });

    if (res.data.status === 'success') {
      const message = method === 'PATCH' ? 'Password updated successfully' : res.data.message;
      showAlert('success', message);
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (error) {
    // console.log(error);
    showAlert('error', error.response.data.message);
    window.setTimeout(() => {
      location.assign('/');
    }, 2000);
  }
};
