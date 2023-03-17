
$( document ).ready(function() {
  ajaxGet();
  $("#refresh").click(function(event){
    
    event.preventDefault();
    ajaxGet();
  });

  $("#revForm").submit(function(event){
    
    event.preventDefault();
    ajaxGetRev();
  });

  
// DO GET

function ajaxGet(){

$.ajax({
type : "POST",
contentType: "application/json",
data : JSON.stringify({}),
dataType : 'json',
url : window.location.origin + "/user/restaurant/menu/getCart/"+cartID.value,
success: function(result){
 
  $('#items').empty();
  $.each(result, function(i, order){
   
    var formData = {
      restaurantID : order.restaurantID      
    }
    $.ajax({
      type : "POST",
      contentType: 'application/json',
      data : JSON.stringify(formData),
      dataType: 'json',
      url : window.location.origin + "/user/getName",
      success: function(result){
        var restName=result[0].restaurantName
        $('#items').append("<tr> <th scope='row'>"+restName+ "</th> <td> "+order.menuType+ "</td><td> "+
        order.menuItemName + "</td><td> "+order.configName + "</td><td> "+order.quantity + "</td><td> "
        +order.comment + "</td></tr>")
        
    
  console.log("Success: ", result);
      },
      error : function(e) {
        alert("err")
        console.log("ERROR: ", e);
      }
    })
    
  });
},
error : function(e) {
  
  console.log("ERROR: ", e);
}
}); 

} 

function ajaxGetRev(){
  var formData = {
    revname : $("#revname").val(),
    revrestname: $("#revrestname").val(),
    revcontent :  $("#revcontent").val(),
    cartID : cartID.value
  }
  
  $.ajax({
    
    type : "POST",
    contentType : 'application/json',
    data : JSON.stringify(formData),
    dataType : 'json',
    url : window.location.origin + "/user/restaurant/menu/getCartTotal/",
    success: function(result){
      $('#total').empty();
      $('#total').html("<p>Total: "+ result[0].total+"</p>");
    
     
      console.log("Success: ", result);
      
      $("#revname").val('');
      $("#revrestname").val('');
      $("#revcontent").val('');
    },
    error : function(e) {
      
      console.log("ERROR: ", e);
    }
    });
}

function changeStatusPost(row){
var cartID = row.id.substr(0,row.id.length-3)
var statusName = $("#"+cartID+"_s").val()
var formData = {
  cartID : cartID,
  statusName : statusName
}
$.ajax({
type : "POST",
contentType : "application/json",
data : JSON.stringify(formData),
dataType : 'json',
url : window.location.origin + "/staff/changeOrderStatus",
success: function(result){
      alert("Done!");
},
error : function(e) {
  $("#searchResults").html("<strong>Error</strong>");
  console.log("ERROR: ", e);
}
}); 
} 



});