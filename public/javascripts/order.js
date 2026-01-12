$(document).ready(function () {
  $('#orderForm').submit(function (e) {
    e.preventDefault();

    let formData = $(this).serializeArray();

    $.ajax({
      url: '/place-order',
      method: 'post',
      data: formData,
      success: (response) => {
        if (response.codSuccess) {
          window.location.href = '/order-result?status=success';
        } else {
          razorpayPayment(response); // ✅ pass FULL response
        }
      },
      error: () => {
        alert('Order placement failed');
      }
    });
  });
});

function razorpayPayment(data) {
  if (!data.razorpayKey) {
    alert('Razorpay key missing');
    console.error('razorpayKey missing', data);
    return;
  }

  var options = {
    key: data.razorpayKey,                // ✅ MUST exist
    amount: data.razorpayOrder.amount,
    currency: "INR",
    name: "PK Shopping Cart",
    description: "Order Payment",
    order_id: data.razorpayOrder.id,

    handler: function (response) {
      verifyPayment(response, data.razorpayOrder);
    },

    modal: {
      ondismiss: function () {
        window.location.href = '/order-result?status=failed';
      }
    }
  };

  let rzp = new Razorpay(options);
  rzp.open();
}

function verifyPayment(payment, order) {
  $.ajax({
    url: '/verify-payment',
    method: 'post',
    data: {
      razorpay_order_id: order.id,
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_signature: payment.razorpay_signature,
      order_id: order.receipt
    },
    success: (response) => {
      if (response.status) {
        window.location.href = '/order-result';
      } else {
        window.location.href = '/order-result';
      }
    },
    error: () => {
      alert('Payment verification failed');
    }
  });
}
