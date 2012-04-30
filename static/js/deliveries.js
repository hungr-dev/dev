/**
 * Collections used in the Delivery section:
 */
var OrderCollection = Backbone.Collection.extend({
  model: OrderModel
});
var FoodItemCollection = Backbone.Collection.extend({
  model: FoodItemModel
});

/**
 * Models used in the Delivery section:
 */
var RestaurantModel = Backbone.Model.extend({
  defaults: {
    id: null,
    name: "",
    cuisine: "",
    address: "",
    phone: "",
    description: "",
    rating: 0
  },
});
var DeliveryModel = Backbone.Model.extend({
  defaults: {
    id: null,
    creator: null,
    restaurant: null,
    orderTime: null,
    deliveryLocation: null,
    orders: new OrderCollection([])
  },
});
var OrderModel = Backbone.Model.extend({
  defaults: {
    id: null,
    member: "",
    foodItems: new FoodItemCollection([])
  },
});
var MemberModel = Backbone.Model.extend({
  defaults: {
    id: null,
    photoURL: "",
    name: "Anonymous"
  },
});
var FoodItemModel = Backbone.Model.extend({
  defaults: {
    id: null,
    name: "",
    price: 0.0,
    quantity: 1
  },
});
var LocationModel = Backbone.Model.extend({
  defaults: {
    lat: 0.0,
    long: 0.0
  },
});

/**
 * Views for the models defined above:
 */
var DeliveryView = Backbone.View.extend({
  initialize: function() {
    this.wrapper = $('#delivery-wrapper');
  },
  render: function() {
    // Compile the template using underscore
    var viewData = {
      restaurantName: this.model.get('restaurant').get('name')
    }
    var template = _.template($('#delivery-html').html(), viewData);

    // Load the compiled HTML into the wrapper
    this.wrapper.html(template);
  }
});
