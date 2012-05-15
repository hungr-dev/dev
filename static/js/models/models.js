/**
 * Models used in the Delivery section:
 */
var SearchModel = Backbone.Model.extend({
  defaults: {
    model: null,
    deliveryView: null
  }
});
var ResultModel = Backbone.Model.extend({
  defaults: {
    id: null,
    address_city: '',
    name: '',
    cuisine: [],
    deliveries: [],
    food_items: [],
    deliveryView: null
  },
});

var FoodItemCollection = Backbone.Collection.extend({
  model: FoodItemModel
});

var RestaurantModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    name: "",
    cuisine: "",
    address: "",
    phone: "",
    description: "",
    rating: 0,
    food_items: new FoodItemCollection([]),
  },
  urlRoot: 'restaurant',
  relations: [{
    type: Backbone.HasMany,
    key: 'food_items',
    relatedModel: 'FoodItemModel',
    collectionType: 'FoodItemCollection',
  }]
});

var OrderCollection = Backbone.Collection.extend({
  model: OrderModel
});

var DeliveryModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    member: null,
    restaurant: null,
    order_time: null,
    delivery_location: null,
    orders: new OrderCollection([])
  },
  urlRoot: 'delivery',
  relations: [{
    type: Backbone.HasOne,
    key: 'member',
    relatedModel: 'MemberModel',
  }, {
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
    delivery_id: null,
    member: null,
    food_items: new FoodItemCollection([])
  },
  urlRoot: 'order',
  relations: [{
    type: Backbone.HasOne,
    key: 'member',
    relatedModel: 'MemberModel',
  }, {
    type: Backbone.HasMany,
    key: 'food_items',
    relatedModel: 'FoodItemAndQuantityModel',
    collectionType: 'FoodItemAndQuantityCollection',
  }]
});
var MemberModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    name: "Anonymous"
  },
  urlRoot: 'member',
});
var FoodItemModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    name: "",
    price: 0.0,
  },
  urlRoot: 'food_item',
});
var FoodItemAndQuantityModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    food_item: null,
    quantity: 1
  },
  relations: [{
    type: Backbone.HasOne,
    key: 'food_item',
    relatedModel: 'FoodItemModel',
  }]
});
var LocationModel = Backbone.Model.extend({
  defaults: {
    lat: 0.0,
    long: 0.0
  },
});

/**
 * Collections used in the Delivery section:
 */

var FoodItemAndQuantityCollection = Backbone.Collection.extend({
  model: FoodItemAndQuantityModel
});
var ResultCollection = Backbone.Collection.extend({
  model: ResultModel
});
