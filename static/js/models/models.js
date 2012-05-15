/**
 * Backbone models
 */

// The search model stores information about a given search:
var SearchModel = Backbone.Model.extend({
  defaults: {
    model: null,
    deliveryView: null,
  }
});

// The result model stores information about each search result:
var ResultModel = Backbone.Model.extend({
  defaults: {
    id: null,
    address_city: '',
    name: '',
    cuisine: [],
    deliveries: [],
    food_items: [],
    deliveryView: null,
  },
});

// The food item model stores information about a dish:
var FoodItemModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    name: "",
    price: 0.0,
  },
  urlRoot: 'food_item',
});

// Restaurants use a collection of food items as a menu:
var FoodItemCollection = Backbone.Collection.extend({
  model: FoodItemModel,
});

// The restaurant model stores all information about a given restaurant:
var RestaurantModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    name: "",
    cuisine: "",
    address: "",
    phone: "",
    description: "",
    rating: 0,
    food_items: new FoodItemCollection([]), // its "menu"
  },

  // Accessed in Flask at /restaurant/X:
  urlRoot: 'restaurant',
  
  // Defining relations to other models:
  relations: [{
    type: Backbone.HasMany,
    key: 'food_items',
    relatedModel: 'FoodItemModel',
    collectionType: 'FoodItemCollection',
  }]
});

// The order model stores information about a given order:
var OrderModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    delivery_id: null,
    member: null,
    food_items: new FoodItemCollection([]),
  },

  // Accessed in Flask at /order/X:
  urlRoot: 'order',

  // Two relations here: the "owner" of the order and the food being ordered:
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

// A delivery uses a collection of orders to specify the food being ordered:
var OrderCollection = Backbone.Collection.extend({
  model: OrderModel,
});

// The delivery model stores information about a given delivery:
var DeliveryModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    member: null, // the creator
    restaurant: null,
    order_time: null,
    delivery_location: null,
    orders: new OrderCollection([]),
  },

  // Accessed in Flask at /delivery/X:
  urlRoot: 'delivery',

  // A few relations for restaurant, orders, and the creator:
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

// The member model stores information about a user; currently just used for name:
var MemberModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    name: "Anonymous"
  },

  // Used to access the current member in Flask:
  urlRoot: 'member',
});

// This model is a stopgap solution to pairing (food item, quantity) tuples in orders:
var FoodItemAndQuantityModel = Backbone.RelationalModel.extend({
  // Since food items are shared (one for each menu item),
  // if two users add the same food item to their order, we need
  // to keep track of the metadata (quantity) in a separate model.
  defaults: {
    id: null,
    food_item: null,
    quantity: 1,
  },
  relations: [{
    type: Backbone.HasOne,
    key: 'food_item',
    relatedModel: 'FoodItemModel',
  }]
});

// Again, used for orders (read above comments in model definition of FoodItemAndQuantityModel):
var FoodItemAndQuantityCollection = Backbone.Collection.extend({
  model: FoodItemAndQuantityModel
});

// Used in the search results:
var ResultCollection = Backbone.Collection.extend({
  model: ResultModel
});
