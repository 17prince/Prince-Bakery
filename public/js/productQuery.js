// Function for API call to get filter products
import { data } from 'jquery';
import { showAlert } from './alert';

let filterQuery = [];
const productCard = document.getElementById('product-card');
const results = document.getElementById('product-count');
const userReviews = document.getElementById('user-review');
export function removeAllQueries() {
  filterQuery = [];
}

export const getFilterProducts = async (endpoint, query, addOrRemove) => {
  // addOrRemove is to find weather the function is called for add query or to remove query
  // values can be 'add' or 'remove'
  let res;
  try {
    if (addOrRemove === 'add') {
      filterQuery.push(query);
    } else if (addOrRemove === 'remove') {
      const index = filterQuery.indexOf(query);
      if (index > -1) {
        filterQuery.splice(index, 1);
      }
    }
    const queries = filterQuery.join('&');
    const url = `/api/v1/${endpoint}?${queries}`;
    res = await axios({
      method: 'GET',
      url,
    });
  } catch (err) {
    showAlert(res.data.status, err.response.data.message, 3);
  }
  return res;
};

export async function embeddeProducts(endpoint, query, addOrRemove) {
  productCard.classList.add('opacity-0');
  try {
    const data = await getFilterProducts(endpoint, query, addOrRemove);
    if (data.data.results === 0) {
      productCard.innerHTML = '<h2 class = "text-center">No Such Products Found</h2>';

      return;
    }
    // results.textContent = `1-${res.data.results} of ${res.data.totDoc} results`;
    let productDom = '';
    data.data.data.alldata.forEach((element) => {
      productDom =
        productDom +
        `
      <div class = "product-card row">
          <div class = "col-sm-4 col-md-4 col-xs-6"
              <a href= "/getproduct/${element.slug}">
                  <img src= "/${element.image}" alt="${element.image.split('.')[0]}">
              </a>
          </div>
    
          <div class = "col-sm-8 col-md-8 col-xs-6">
              <div class = "product-info">
                  <a href="/getproduct/${element.slug}">
                      <h2>${element.name}</h2>
                  </a>
                  <h3 class = "tag"> Prince Bakery </h3>
                  <a class = "visit-shop" href="/location"> Also Visit Our Shop </a>
                  <h5 class = "fw-bold"> Products are freshly prepared for you because your trust is our care. </h5>
                  <h4> Ratings:  
                      <span>${element.averageRatings} (${element.ratingsQuantity}) </span>
                  </h4>
                  <h4 class = "price"> Price: &#8377 
                      <span> ${element.price} </span>
                  </h4>
              </div>
          </div>
      </div>`;
    });
    productCard.innerHTML = productDom;
    setTimeout(() => {
      productCard.classList.remove('opacity-0');
    }, 100);
  } catch (err) {
    showAlert('error', err, 3);
  }
}

export function getJwtCookie() {
  let jwt;
  const cookies = document.cookie.split('; ');
  cookies.forEach((element) => {
    if (element.startsWith('jwt=')) {
      jwt = element;
    }
  });
  const keyToken = `Bearer ${jwt.split('=')[1]}`;
  return keyToken;
}

export async function embeddeReviews(productId, query) {
  userReviews.classList.add('opacity-0');
  let reviewCard = '';
  try {
    const keyToken = getJwtCookie();
    const res = await axios({
      method: 'GET',
      url: `/api/v1/products/${productId}/review?${query}`,
      headers: {
        authorization: keyToken,
      },
    });
    const reviews = res.data.data.alldata;
    reviews.forEach((review) => {
      let star = '';

      for (let i = 1; i < 6; i++) {
        star = star + `<i class="${review.rating >= i ? 'fa fa-star star' : 'fa fa-star-o'} "></i>`;
      }

      reviewCard =
        reviewCard +
        `<div class="review-section">
      <div class="customer-img">
      <img src='/images/users/${review.user.photo}' alt="">
      <h4>
      ${review.user.name}
              <p>Created At: ${new Date(review.createdAt).toLocaleString('en-IN', {
                dateStyle: 'full',
              })}</p>
              </h4>
              </div>
      <div class="star-rating">
          ${star}
          <h4 class="rate"> ${review.rating} out of 5</h4>
          </div>
      <div class="review">
          <h5>${review.review}</h5>
          </div>
          </div>`;
    });
    userReviews.innerHTML = reviewCard;
    userReviews.classList.remove('opacity-0');
  } catch (err) {
    showAlert('error', err);
  }
}
