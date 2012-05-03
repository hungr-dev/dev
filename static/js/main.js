$(document).ready(function(){
  var deliveryView = new DeliveryView();

  var searchModel = new SearchModel({deliveryView: deliveryView})
  var searchView = new SearchView({model: searchModel});

});
