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
    url: '/add-to-cart' + productID,
    method: 'get',
    success: (response) => {
      if (response.status) {
        let countHeader = $('#cart-count-header').html();
        count = parseInt(countHeader) + 1; // because above count with html is in string format
        $('#cart-count-header').html(count)
      }
    }
  })
}

function changeProductQty(cartId, productId, count) {
  $.ajax({
    url: '/change-count-qty',
    data: {
      cartId: cartId,
      productId: productId,
      count: count
    },
    method: 'post',
    success: (response) => {
      if (response.status) {
        let isMobile = window.innerWidth < 768;
        let layoutContainer = isMobile ? '.mobile-cart' : '.desktop-cart'

        // quantity changing
        let qtySpan = $(`${layoutContainer} .product-qty[data-product-id="${productId}"]`)
        let currentQty = parseInt(qtySpan.text())
        let newQty = currentQty + count;
        if (newQty < 1) {
          $(`${layoutContainer} .cart-details[data-product-id=${productId}]`).remove()
          return;
        }
        qtySpan.text(newQty);

        //product price total
        let priceText = $(`${layoutContainer} .product-price[data-product-id="${productId}"]`).text()
        let pricePerUnit = extraNumericValue(priceText);
        let newTotal = pricePerUnit * newQty;
        let formattedTotal = formatINR(newTotal);
        let productTotal = $(`${layoutContainer} .product-total[data-product-id="${productId}"]`)
        productTotal.text(formattedTotal)

        // total cart price
        let totalCartPriceText = $(`${layoutContainer} .total-cart-price`);
        let cartPriceInUnit = extraNumericValue(totalCartPriceText.text());

        let cartTotalPrice = cartPriceInUnit + (pricePerUnit * count);
        let formatCartTotal = formatINR(cartTotalPrice);
        totalCartPriceText.text(formatCartTotal)

      }
    }
  })
}

