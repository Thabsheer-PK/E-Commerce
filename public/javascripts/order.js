$(document).ready(function () {

  $('#orderForm').submit(function (e) {
    e.preventDefault();

    let formData = $(this).serializeArray();
    console.log("Form data:", formData);

    $.ajax({
      url: '/place-order',
      method: 'post',
      data: formData,
      success: (response) => {
        if (response.codSuccess) {
          window.location.href = '/order-success';
        } else {
          razorpayPayment(response.razorpayOrder);
        }
      },
      error: (xhr, status, err) => {
        console.error(" AJAX error:", status, err);
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
    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
    "helpers": {

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