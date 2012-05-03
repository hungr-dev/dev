$(document).ready(function(){
  var deliveryView = new DeliveryView();
  var searchView = new SearchView();
  searchView.deliveryView = deliveryView;
});
