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
var RestaurantModel = Backbone.RelationalModel.extend({
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
var DeliveryModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    creator: null,
    restaurant: null,
    order_time: null,
    delivery_location: null,
    orders: new OrderCollection([])
  },
  urlRoot: 'delivery',
  relations: [{
    type: Backbone.HasOne,
    key: 'restaurant',
    relatedModel: 'RestaurantModel',
  }, {
    type: Backbone.HasMany,
    key: 'orders',
    relatedModel: 'OrderModel',
    collectionType: 'OrderCollection',
  }]
});
var OrderModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    member: "",
    food_items: new FoodItemCollection([])
  },
  relations: [{
    type: Backbone.HasMany,
    key: 'food_items',
    relatedModel: 'FoodItemModel',
    collectionType: 'FoodItemCollection',
  }]
});
var MemberModel = Backbone.Model.extend({
  defaults: {
    id: null,
    photoURL: "",
    name: "Anonymous"
  },
});
var FoodItemModel = Backbone.RelationalModel.extend({
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
  model: null,
  events: {
    'blur #delivery-time': 'updateDeliveryTime',
    'blur #delivery-location': 'updateDeliveryLocation',
  },
  initialize: function() {
    this.setElement($('#delivery'));
    this.$el.hide();
  },
  render: function() {
    var html, viewData;

    // Compile the template using underscore
    console.log(this.model);
    if (this.model === null) {
      html = _.template($('#delivery-initial-html').html());;
    } else if (this.model.get('restaurant') === null) {
      console.log(this.model);
      html = _.template($('#delivery-loading-html').html());
    } else {
      var foodItems;
      if (this.model.get('orders').length > 0) {
        foodItems = this.model.get('orders').at(0).get('food_items');
      } else {
        foodItems = [];
      }

      viewData = {
        orderTime: (this.model.get('order_time') === null ? '' : this.model.get('order_time')),
        deliveryLocation: (this.model.get('delivery_location') === null ? '' : this.model.get('delivery_location')),
        restaurantName: this.model.get('restaurant').get('name'),
        restaurantPhone: this.model.get('restaurant').get('phone'),
        restaurantAddress: this.model.get('restaurant').get('address'),
        foodItems: foodItems,
      }
      html = _.template($('#delivery-html').html(), viewData);
    }

    // Load the compiled HTML into the wrapper
    this.$el.html(html);

    return this; // for method chaining
  },
  createDelivery: function (restaurantID) {
    var that = this;
    this.$el.fadeOut(250, function () {
      that.model = new DeliveryModel();

      that.model.save({restaurantID: restaurantID}, {
        success: function () {
          console.log(that.model);
          that.render();
        },
      });

      that.render();
      that.$el.fadeIn();
    });
  },
  joinDelivery: function (deliveryID) {
    var that = this;
    this.$el.fadeOut(250, function () {
      that.model = new DeliveryModel({id: deliveryID});

      that.model.fetch({
        success: function () {
          that.render();
        },
      });

      that.render();
      that.$el.fadeIn();
    });
  },
  updateDeliveryTime: function () {
    this.model.save({order_time: this.$el.find('#delivery-time').val()});
  },
  updateDeliveryLocation: function () {
    this.model.save({delivery_location: this.$el.find('#delivery-location').val()});
  }
});
