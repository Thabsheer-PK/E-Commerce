function extraNumericValue(textValue) {
  return parseFloat(textValue.replace(/[^0-9.]/g, ""))
}

function formatINR(amount) {
  return "₹ " + new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);
}

function checkExistingInCartMsg(productID) {
  $.ajax({
    url: '/check-product-in-cart',
    data: {
      productID
    },
    method: 'post',
    success: (response) => {
      if (!response.exists) {
        addToCartBtnAjax(productID);
      }      
        window.location.href = `/place-order-form?productId=${productID}`
    }
  })
}


function addToCartBtnAjax(productID) {
  $.ajax({
    url: '/add-to-cart',
    data: {
      productID
    },
    method: 'post',
    success: (response) => {
      if (response.status) {
        let count = parseInt($(`#cart-count-header`).text()) || 0;
        $(`#cart-count-header`).text(count + 1)
        // showMessage(productID, 'Added to cart', 'success');
        const element = $(`.cart-message[data-product-id="${productID}"]`);
        element.find('.message-text').text('Added to cart');
        element.addClass('show');
        setTimeout(() => {
          element.removeClass('show')
        }, 2000)


      }
    }
  })
}


function changeProductQty(cartId, productId, count) {
  // let isMobile = window.innerWidth < 768;
  // let layoutContainer = isMobile ? '.mobile-cart' : '.desktop-cart'
  let qtySpan = $(`.cart-items .product-qty[data-product-id="${productId}"]`)
  let currentQty = parseInt(qtySpan.text())
  if (currentQty === 1 && count === -1) {
    // remove item instead of updating qty
    removeFromCart(cartId, productId);
    return;
  }


  $.ajax({
    url: '/change-count-qty',
    data: {
      cartId,
      productId,
      count
    },
    method: 'post',
    success: (response) => {
      // If qty = 1 and minus clicked → remove item
      if (response.remove) {
        removeFromCart(cartId, productId);
        return;
      }
      if (response.status) {

        // quantity changing
        let newQty = currentQty + count;
        qtySpan.text(newQty);
        let cartHeaderQty = parseInt($(`#cart-count-header`).text());
        cartHeaderQty = cartHeaderQty + (count);
        $(`#cart-count-header`).text(cartHeaderQty);

        //product price total
        let priceText = $(`.cart-items .product-price[data-product-id="${productId}"]`).text()
        let pricePerUnit = extraNumericValue(priceText);
        let newTotal = pricePerUnit * newQty;
        let formattedTotal = formatINR(newTotal);
        let productTotal = $(`.cart-items .product-total[data-product-id="${productId}"]`)
        productTotal.text(formattedTotal)

        // total cart price
        let totalCartPriceText = $(`.cart-items .total-cart-price`);
        let cartPriceInUnit = extraNumericValue(totalCartPriceText.text());

        let cartTotalPrice = cartPriceInUnit + (pricePerUnit * count);
        let formatCartTotal = formatINR(cartTotalPrice);
        totalCartPriceText.text(formatCartTotal);



      }
    }
  })
}
function removeFromCart(cartId, productId) {
  console.log('in remove from cart funciton');
  if (confirm("Are you sure you want to remove this product from your cart?")) {
    $.ajax({
      url: '/remove-from-cart',
      data: {
        cartId,
        productId
      },
      method: 'post',
      success: (response) => {
        if (response.status) {
          // let isMobile = window.innerWidth < 768;
          // let layoutContainer = isMobile ? '.mobile-cart' : '.desktop-cart'

          //for updating cart header count
          let qtySpan = $(`.cart-items .product-qty[data-product-id="${productId}"]`);
          let currentQty = extraNumericValue(qtySpan.text());
          let cartHeaderQty = parseInt($(`#cart-count-header`).text());
          let newCartQty = cartHeaderQty - currentQty;
          $('#cart-count-header').text(newCartQty);

          //updating current cartTotal
          let productTotal = $(`.cart-items .product-total[data-product-id="${productId}"]`).text()
          let productTotalUnit = extraNumericValue(productTotal);

          let cartTotal = $(`.cart-items .total-cart-price`).text();
          let cartTotalUnit = extraNumericValue(cartTotal);

          let currentCartTotalPrice = cartTotalUnit - productTotalUnit;
          let formattedCartTotal = formatINR(currentCartTotalPrice);

          $('.total-cart-price').text(formattedCartTotal)

          //remove from cart when click
          $(`.cart-items .cart-item[data-product-id="${productId}"]`).remove()

          // Check if any cart items remain
          if ($(`.cart-items .cart-item`).length === 0) {
            $(`.cart-items`).html(`
          <div class="alert alert-info text-center">
            Your cart is empty. <a href="/">Start Shopping</a>
          </div>
          `);
          }
        }
      }
    })
  }
}

$(document).ready(function () {
  handleAjaxForm('#adminLoginForm', '/admin');
  handleAjaxForm('#userLoginForm', '/');
  handleAjaxForm('#userSignupForm', '/');
})
function handleAjaxForm(selector, successRedirect = null) {
  console.log('in handle function');
  $(selector).submit(function (e) {
    e.preventDefault();
    let formData = {};
    $(this).serializeArray().forEach((field) => {
      formData[field.name] = field.value;
    })
    let actionURL = $(this).attr('action') || window.location.pathname;
    let method = $(this).attr('method') || 'post'
    $.ajax({
      url: actionURL,
      method: method,
      data: formData,
      success: (response) => {
        if (response.status && successRedirect) {
          window.location.href = successRedirect;
        } else {
          $(this).find('.form-error').text(response.message)
        }
      }
    })
  })
}


