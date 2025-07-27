function extraNumericValue(textValue) {
  return parseFloat(textValue.replace(/[^0-9.]/g, ""))
}

function formatINR(amount) {
  return "₹ " + new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);
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

        let timeoutID;
        setTimeout(() => {
          $(`.cart-message[data-product-id="${response.productID}"]`).addClass('cart-added-message')
        }, 0)

        clearTimeout(timeoutID)
        timeoutID = setTimeout(() => {
          $(`.cart-message[data-product-id="${response.productID}"]`).removeClass('cart-added-message')
        }, 2000);



      }
    }
  })
}

function changeProductQty(cartId, productId, count) {
  // let isMobile = window.innerWidth < 768;
  // let layoutContainer = isMobile ? '.mobile-cart' : '.desktop-cart'
  let qtySpan = $(`.cart-items .product-qty[data-product-id="${productId}"]`)
  let currentQty = parseInt(qtySpan.text())
  if (currentQty <= 1 && count == -1) {
    return removeFromCart(cartId, productId)
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
