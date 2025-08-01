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
          window.location.href = '/order-result';
        } else {
          razorpayPayment(response.razorpayOrder);
        }
      },
      error: (xhr, status, err) => {
        console.error("AJAX ERROR:");
      }
    });
  });
});


function razorpayPayment(order) {
  var options = {
    "key": "rzp_test_FXNzEBflDxqzt7", // Enter the Key ID generated from the Dashboard
    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "PK Shopping Cart",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response) {
      verifyPayment(response, order)
    },
    "modal":{
      "ondismiss": function () {
        window.location.href='/order-result?status=failed'
      }
    },
    "prefill": {
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9000090000"
    },
    "notes": {
      "address": "Razorpay Corporate Office"
    },
    "theme": {
      "color": "#3399cc"
    }
  };
  let rzp = new Razorpay(options)
  rzp.open()
}

function verifyPayment(payment, order) {
  $.ajax({
    url: 'verify-payment',
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
      }
    },
    error: () => {
      alert('Server error during verification');
    }
  })
}