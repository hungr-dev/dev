/**
 * Collections used in the Delivery section:
 */
var OrderCollection = Backbone.Collection.extend({
  model: OrderModel
});
var FoodItemCollection = Backbone.Collection.extend({
  model: FoodItemModel
});
var FoodItemAndQuantityCollection = Backbone.Collection.extend({
  model: FoodItemAndQuantityModel
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
    var html, viewData, foodItemNames, foodItemNameIDMap;
    foodItemNames = [];
    foodItemNameIDMap = {};

    // Compile the template using underscore
    if (this.model === null) {
      html = _.template($('#delivery-initial-html').html());;
    } else if (this.model.get('restaurant') === null) {
      html = _.template($('#delivery-loading-html').html());
    } else {
      
      var myOrder = null;
      for (var i = 0; i < this.model.get('orders').length; i++) {
        if (hungr.currentMember === this.model.get('orders').at(i).get('member')) {
          myOrder = this.model.get('orders').at(i);
        }
      }
      if (myOrder == null) {
        myOrder = new OrderModel();
        myOrder.save({delivery_id: this.model.id});
      }

      viewData = {
        id: this.model.id,
        delivery: this.model,
        orderTime: (this.model.get('order_time') === null ? '' : this.model.get('order_time')),
        deliveryLocation: (this.model.get('delivery_location') === null ? '' : this.model.get('delivery_location')),
        restaurantName: this.model.get('restaurant').get('name'),
        restaurantPhone: this.model.get('restaurant').get('phone'),
        restaurantAddress: this.model.get('restaurant').get('address'),
        orders: this.model.get('orders'),
        myOrder: myOrder,
        me: hungr.currentMember,
      }
      html = _.template($('#delivery-html').html(), viewData);

      foodItemNames = [];
      foodItemNameMap = {};
      for (var i = 0; i < this.model.get('restaurant').get('food_items').length; i++) {
        var foodItem = this.model.get('restaurant').get('food_items').at(i);
        foodItemNames.push({
          value: foodItem.get('name'), 
          label: foodItem.get('name') + ' (' + formatPrice(foodItem.get('price')) + ')'
        });
        foodItemNameMap[foodItem.get('name')] = foodItem;
      }
    }

    // Load the compiled HTML into the wrapper
    this.$el.html(html);

    // Update order handler
    var updateMyOrder = function () {
      var data = [];

      $('#my-order .food-item').each(function () {
        if ($(this).data('food-item-id') !== undefined) {
          console.log($(this).data('food-item-id'));
          data.push({
            id: $(this).data('food-item-id'),
            quantity: $(this).find('.food-item-quantity').val(),
          });
        }
      });

      $.ajax('order/' + myOrder.id, {
        data: JSON.stringify({fooditemsAndQuantities: data}),
        dataType: 'json',
        type: 'PUT',
        contentType: 'application/json',
        success: function () {

        }
      });
    }

    // Add food item button handler
    $('#add-food-item').click(function (e) {
      e.stopPropagation();
      e.preventDefault();

      var newRow = $(this).siblings('ul.food-items').find('.template').clone();
      newRow.removeClass('template');
      $(this).siblings('ul.food-items').append(newRow);

      newRow.find('input.food-item-name').autocomplete({
        source: foodItemNames,
        select: function (event, ui) {
          var foodItem = foodItemNameMap[ui.item.value];
          $(this).parents('li.food-item').data('food-item-id', foodItem.id);
          $(this).siblings('span.food-item-price').text(formatPrice(foodItem.get('price')));
          updateMyOrder();
        }
      });
      newRow.find('input.food-item-quantity').change(function () {
        updateMyOrder();
      });
      newRow.find('a.delete-food-item').click(function (e) {
        e.stopPropagation();
        e.preventDefault();

        $(this).parent().remove();
        updateMyOrder();

        return false
      });

      return false;
    });

    // Autocomplete
    $('input.food-item-name').autocomplete({
      source: foodItemNames,
      select: function (event, ui) {
        var foodItem = foodItemNameMap[ui.item.value];
        $(this).parents('li.food-item').data('food-item-id', foodItem.id);
        $(this).siblings('span.food-item-price').text(formatPrice(foodItem.get('price')));
        updateMyOrder();
      }
    });

    $('input.food-item-quantity').change(function () {
      updateMyOrder();
    });

    $('a.delete-food-item').click(function (e) {
      e.stopPropagation();
      e.preventDefault();

      $(this).parent().remove();
      updateMyOrder();

      return false
    });

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
      $('#search-pane').animate({width: '35%', left: 0}, 500);
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
      $('#search-pane').animate({width: '35%', left: 0}, 500);
    });
  },
  updateDeliveryTime: function () {
    this.model.save({order_time: this.$el.find('#delivery-time').val()});
  },
  updateDeliveryLocation: function () {
    this.model.save({delivery_location: this.$el.find('#delivery-location').val()});
  }
});
