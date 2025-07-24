
$(document).ready(function () {
  $('#orderForm').submit(function (e) {
    e.preventDefault();
    let formData = $(this).serializeArray();
    $.ajax({
      url: '/place-order',
      method: 'post',
      data: formData,
      success: (response) => {
        if (response.status) {
          window.location.href = '/order-success';
        } else {
          alert('Order Failed');
        }
      }
    })
  })
})