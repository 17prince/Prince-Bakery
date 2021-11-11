/*eslint-disable*/

import '@babel/polyfill';
// const login = require('./login');
import { login, signUp, logout, forgotAndResetPassword } from './login';
import { embeddeProducts, removeAllQueries, embeddeReviews } from './productQuery';
import { addToBuyList, removeFromBuyList, createCart, deleteCart, buyCartItems } from './carts';
import { orderProduct } from './stripe';

// import { sendGoogleToken } from './googleAuth';
// import { getForm, sendForm } from './me';

// DOM Elements
const singUpButton = document.getElementById('signUp');
const singInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const mobileLogin = document.getElementById('mobile-login');
const mobileSignUp = document.getElementById('mobile-signup');
const topCategoryFilter = document.getElementById('topcategory-item');
const priceRangeFilter = document.getElementById('price-range');
const randomPriceFilter = document.getElementById('go');
const logoutBtn = document.getElementById('logout');
const coll = document.getElementsByClassName('collapsible');
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const filterReview = document.getElementById('review-filter');
const mainCartContainer = document.getElementById('main-cart-container');
const addToCart = document.getElementById('add-to-cart');
const forgotPasswordForm = document.getElementById('forget-form');
const resetPasswordForm = document.getElementById('resetpassword-form');
const orderItembtn = document.getElementById('buy-now');
const buyCartbtn = document.getElementById('buy-cart');
// const loginPage = document.getElementById('login-container');
// const basicSetting = document.getElementById('setting');
// const orders = document.getElementById('orders');
// const address = document.getElementById('address');
// const password = document.getElementById('set-password');
// const saveBasicSettings = document.getElementById('save-basic');
// const savePrimaryAddress = document.getElementById('save-p-address');
// const saveSecondaryAddress = document.getElementById('save-s-address');
// const savePassword = document.getElementById('save-password');
// const stickyImg = document.getElementById('sticky-img');
// const reviewFilter = document.getElementById('review-filter');

// Signup form DOMs
const name = document.getElementById('name');
const signUpEmail = document.getElementById('sign-email');
const signUpPassword = document.getElementById('sign-password');
const signUpConfirmPassword = document.getElementById('sign-confirmPassword');

// Login form DOMs
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

// submit buttons of form
const loginAccount = document.getElementById('login');
const createAccount = document.getElementById('create');

// Login Form
if (loginAccount) {
  loginAccount.addEventListener('click', () => {
    if (loginEmail.value && loginPassword.value) {
      login(loginEmail.value, loginPassword.value);
    }
  });
}

// SignUP form
if (createAccount) {
  createAccount.addEventListener('click', () => {
    if (name.value && signUpEmail.value && signUpPassword.value && signUpConfirmPassword.value) {
      signUp(name.value, signUpEmail.value, signUpPassword.value, signUpConfirmPassword.value);
    }
  });
}

// Login page
if (singUpButton) {
  singUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
  });
}

if (singInButton) {
  singInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
  });
}

if (mobileSignUp) {
  mobileSignUp.addEventListener('click', () => {
    container.classList.add('mobile-panel');
  });
}
if (mobileLogin) {
  mobileLogin.addEventListener('click', () => {
    container.classList.remove('mobile-panel');
  });
}

// Login with google-auth
// if (loginPage) {
//   loginPage.addEventListener('load', () => {
//     renderButton();
//   });
// }

// products page : item section
function toggleFilterCheckBox(e) {
  // container is a div box which is the parents elements of checkbox
  const filterCheckbox = e.target.parentElement;

  if (!filterCheckbox.firstElementChild.attributes.checked) {
    if (filterCheckbox.firstElementChild.attributes.type.value === 'checkbox') {
      filterCheckbox.firstElementChild.setAttribute('checked', 'checked');
      const query = filterCheckbox.firstElementChild.attributes.value.value;
      embeddeProducts('products', query, 'add');
    }
  } else {
    filterCheckbox.firstElementChild.removeAttribute('checked');
    const query = filterCheckbox.firstElementChild.attributes.value.value;
    embeddeProducts('products', query, 'remove');
  }
}

if (topCategoryFilter) {
  topCategoryFilter.addEventListener('click', (e) => toggleFilterCheckBox(e));
}
if (priceRangeFilter) {
  priceRangeFilter.addEventListener('click', (e) => toggleFilterCheckBox(e));
}
if (randomPriceFilter) {
  randomPriceFilter.addEventListener('click', (e) => {
    e.preventDefault();
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    if (minPrice && maxPrice) {
      const query = `price[gte]=${minPrice}&price[lt]=${maxPrice}`;
      embeddeProducts('products', query, 'add');
      removeAllQueries();
    }
  });
}

// logging out
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// Collapsible
if (coll) {
  let i;
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener('click', function () {
      this.classList.toggle('active');
      var content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  }
}

// pagination
if (page1) {
  page1.addEventListener('click', (e) => {
    e.preventDefault();
    page2.classList.remove('active');
    page1.classList.add('active');
    embeddeProducts('products', page1.getAttribute('href'), 'add');
    removeAllQueries();
    window.scrollTo(0, 0);
  });
}

if (page2) {
  page2.addEventListener('click', (e) => {
    e.preventDefault();
    page1.classList.remove('active');
    page2.classList.add('active');
    embeddeProducts('products', page2.getAttribute('href'), 'add');
    removeAllQueries();
    window.scrollTo(0, 0);
  });
}

// Review filter
if (filterReview) {
  filterReview.addEventListener('change', (e) => {
    embeddeReviews(e.target.getAttribute('data-productid'), e.target.value);
  });
}

// Cart section
if (mainCartContainer) {
  mainCartContainer.addEventListener('click', (e) => {
    if (e.target.getAttribute('type') === 'checkbox' && !e.target.getAttribute('checked')) {
      e.target.setAttribute('checked', 'checked');
      addToBuyList(e.target.getAttribute('data-productid'), e.target.getAttribute('data-price'));
    } else if (e.target.getAttribute('checked') === 'checked') {
      removeFromBuyList(
        e.target.getAttribute('data-productid'),
        e.target.getAttribute('data-price')
      );
      e.target.removeAttribute('checked');
    }
  });
}

// Adding prodcut to cart
if (addToCart) {
  addToCart.addEventListener('click', (e) => {
    e.preventDefault();
    createCart(e.target.getAttribute('data-userid'), e.target.getAttribute('data-product'));
  });
}

// Deleting a cart
if (mainCartContainer) {
  mainCartContainer.addEventListener('click', (e) => {
    if (e.target.getAttribute('class') === 'delete-cart') {
      e.preventDefault();
      deleteCart(e.target.getAttribute('data-cartid'));
    }
  });
}

// Sending email to reset password
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();

    document.getElementById('send-reset-password').textContent = 'Sending.....';

    forgotAndResetPassword('POST', '/api/v1/users/forgotpassword', {
      email: document.getElementById('forget-email').value,
    });
  });
}

// Resetting Password
if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', (e) => {
    const resetLink = document.getElementById('token-link').getAttribute('data-url');
    e.preventDefault();

    forgotAndResetPassword('PATCH', resetLink, {
      password: document.getElementById('new-password').value,
      confirmPassword: document.getElementById('confirm-pass').value,
    });
  });
}

// Buying an Actual product
if (orderItembtn) {
  orderItembtn.addEventListener('click', (e) => {
    e.preventDefault();
    const ids = [];
    e.target.textContent = 'Processing....';
    ids.push(orderItembtn.getAttribute('data-productId'));
    console.log(ids);
    orderProduct(ids);
  });
}

// Buying Cart products.
if (buyCartbtn) {
  buyCartbtn.addEventListener('click', (e) => {
    e.preventDefault();
    buyCartItems();
  });
}
// Profile Page(/me)
// if (basicSetting) {
//   basicSetting.addEventListener('click', (e) => {
//     e.preventDefault();
//     getForm('me-container');
//   });
// }

// if (address) {
//   address.addEventListener('click', (e) => {
//     e.preventDefault();
//     getForm('address-container');
//   });
// }

// if (password) {
//   password.addEventListener('click', (e) => {
//     e.preventDefault();
//     getForm('password');
//   });
// }

// // sending form data to the sever
// if (saveBasicSettings) {
//   saveBasicSettings.addEventListener('click', (e) => {
//     e.preventDefault();
//     sendForm('/api/v1/users/updateme', 'basic-setting');
//   });
// }
