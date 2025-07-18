function addToCartBtnAjax(productID){
  $.ajax({
    url: '/add-to-cart'+productID,
    method:'get',
    success: (response)=>{
      if(response.status){
        let countHeader = $('#cart-count-header').html();
        count = parseInt(countHeader)+1; // because above count with html is in string format
        $('#cart-count-header').html(count)
      }
      
    }
  })

}