/*eslint-disable */

import { getJwtCookie } from './productQuery';
import { showAlert } from './alert';
import { orderProduct } from './stripe';
const subTotal = document.getElementsByClassName('sub-heading')[0];

let buyList = [];
let itemPrice = 0;
export function addToBuyList(productId, price) {
  if (productId) {
    buyList.push(productId);
    itemPrice = itemPrice + parseInt(price);
    subTotal.textContent = `Subtotal (${buyList.length} item): Rs.${itemPrice}`;
  }
}

export function removeFromBuyList(productId, price) {
  if (productId) {
    const eleIndex = buyList.indexOf(productId);
    if (eleIndex > -1) {
      buyList.splice(eleIndex, 1);
      console.log(itemPrice);
      itemPrice = itemPrice - parseInt(price);
    }
    subTotal.textContent =
      buyList.length === 0
        ? 'No Item Selected'
        : `Subtotal (${buyList.length} item): Rs.${itemPrice}`;
  }
}

export async function createCart(userId, productId) {
  try {
    const res = await axios(`/api/v1/cart`, {
      method: 'POST',
      hearders: {
        authorization: getJwtCookie(),
      },
      data: {
        product: productId,
        user: userId,
      },
    });

    if (res.data.status === 'success') {
      showAlert(res.data.status, 'Product added to your cart', 4);
    }
  } catch (error) {
    // console.log(error);
    showAlert('error', error.response.data.message, 4);
  }
}

export async function deleteCart(cartId) {
  try {
    const res = await axios(`/api/v1/cart/${cartId}`, {
      method: 'DELETE',
    });

    if (res.status == 204) {
      showAlert('success', 'Product removed from your cart', 3);
    }
    setTimeout(() => {
      window.location.replace(`${window.location.href}`);
    }, 3000);
  } catch (error) {
    showAlert('error', error.response.data.message, 3);
    setTimeout(() => {
      window.location.replace(`${window.location.href}`);
    }, 3000);
  }
}

export function buyCartItems() {
  if (buyList.length === 0) return showAlert('success', 'Please select itmes of your cart.');
  orderProduct(buyList);
}
