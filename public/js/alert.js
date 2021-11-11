/*eslint-disable*/
export const hideAlert = () => {
  const ele = document.querySelector('.alert');
  if (ele) {
    ele.parentElement.removeChild(ele);
  }
};

export const showAlert = (type, message, time = 5) => {
  hideAlert();
  // type can be success or error
  const markup = `<div class = "alert alert--${type} "><h3>${message} </h3></div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  document.getElementsByClassName('alert')[0].style.top = '90px';
  window.setTimeout(hideAlert, time * 1000);
};
