/**
 * The delivery view handles the front-end behavior of the delivery pane.
 * It's more akin to a controller in the traditional sense, but in Backbone's
 * MVC pattern, this functionality belongs in a view as such:
 */
var DeliveryView = Backbone.View.extend({
  // The delivery view has no inherent model at first,
  // but it is given a Delivery object when one it to
  // be loaded:
  model: null,

  // Update the delivery information on blur:
  // TODO: use this event handling for all events
  events: {
    'blur #delivery-time': 'updateDeliveryTime',
    'blur #delivery-location': 'updateDeliveryLocation',
  },

  // Initialize the view and tie it to the DOM:
  initialize: function() {
    this.setElement($('#delivery'));
    this.$el.hide();
  },

  // Rendering a given delivery:
  render: function() {
    var html, viewData, foodItemNames, foodItemNameIDMap;
    foodItemNames = [];
    foodItemNameIDMap = {};

    // Compile the template using underscore:
    if (this.model === null) {
      // No delivery chosen yet...
      html = _.template($('#delivery-initial-html').html());;

    } else if (this.model.get('restaurant') === null) {
      // Delivery chosen, but its data isn't here...
      html = _.template($('#delivery-loading-html').html());

    } else {
      // We've got a delivery and its data!
      
      // Find or initialize the current user's order in the delivery:
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

      // Set the data we'll need in the view:
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

      // Render the template with the data:
      html = _.template($('#delivery-html').html(), viewData);

      // Generate the "menu" for the delivery's restaurant:
      foodItemNames = [];
      foodItemNameMap = {};
      for (var i = 0; i < this.model.get('restaurant').get('food_items').length; i++) {
        var foodItem = this.model.get('restaurant').get('food_items').at(i);
        
        // foodItemNames is used in the autocomplete menu:
        foodItemNames.push({
          value: foodItem.get('name'), 
          label: foodItem.get('name') + ' (' + formatPrice(foodItem.get('price')) + ')'
        });

        // foodItemNameMap is used to map from the (unique) food item names back to the model:
        foodItemNameMap[foodItem.get('name')] = foodItem;
      }
    }

    // Load the compiled HTML into the wrapper
    this.$el.html(html);

    // Update order handler, called whenever the user's order is to be updated:
    // TODO: instead of using the DOM like this, use Backbone.sync.
    var updateMyOrder = function () {
      var data = [];

      // Pull in the data from the DOM:
      // TODO: refactor this; we shouldn't be storing data in the DOM like this!
      $('#my-order .food-item').each(function () {
        if ($(this).data('food-item-id') !== undefined) {
          data.push({
            id: $(this).data('food-item-id'),
            quantity: $(this).find('.food-item-quantity').val(),
          });
        }
      });

      // Call the Flask server to update the current user's order:
      $.ajax('order/' + myOrder.id, {
        data: JSON.stringify({fooditemsAndQuantities: data}),
        dataType: 'json',
        type: 'PUT',
        contentType: 'application/json',
      });
    }

    // Add food item button handler
    $('#add-food-item').click(function (e) {
      // Don't want the event to bubble/default:
      e.stopPropagation();
      e.preventDefault();

      // Clone the template into a new row and show it:
      var newRow = $(this).siblings('ul.food-items').find('.template').clone();
      newRow.removeClass('template').hide();
      $(this).siblings('ul.food-items').append(newRow);
      newRow.slideDown(250);

      // Event handlers for the new row:
      // TODO: refactor this; these are the same handlers initially defined! Use .live()?
      
      // Autocomplete for the menu items
      newRow.find('input.food-item-name').autocomplete({
        source: foodItemNames,
        select: function (event, ui) {
          // On select, update the metadata stored in the DOM:
          var foodItem = foodItemNameMap[ui.item.value];
          $(this).parents('li.food-item').data('food-item-id', foodItem.id);
          $(this).parents('li.food-item').find('input.food-item-price').val(formatPrice(foodItem.get('price')));
          
          // ...and then push to the server:
          updateMyOrder();
        }
      });

      // When the user changes the quantity...
      newRow.find('input.food-item-quantity').change(function () {
        // ...push it to the server:
        updateMyOrder();
      });

      // When the user deletes a row from their order...
      newRow.find('a.delete-food-item').click(function (e) {
        // Don't want the event to bubble/default:
        e.stopPropagation();
        e.preventDefault();

        // Animate the row away...
        $(this).parents('li.food-item').slideUp(250, function () {
          // ...remove it from the DOM...
          $(this).remove();

          // ...and push the changes to the server:
          updateMyOrder();
        });

        return false;
      });

      return false;
    });
    
    // TODO: again, reconcile the following handlers with those above:

    // Autocomplete handler for the menu:
    $('input.food-item-name').autocomplete({
      source: foodItemNames, // defined in the initialization
      select: function (event, ui) {
        // On select, update the metadata stored in the DOM:
        var foodItem = foodItemNameMap[ui.item.value];
        $(this).parents('li.food-item').data('food-item-id', foodItem.id);
        $(this).siblings('span.food-item-price').text(formatPrice(foodItem.get('price')));
        
        // ...and then push it to the server:
        updateMyOrder();
      }
    });

    // When the user changes the quantity...
    $('input.food-item-quantity').change(function () {
      // ...push it to the server:
      updateMyOrder();
    });

    // When the user deletes a row from their order...
    $('a.delete-food-item').click(function (e) {
      e.stopPropagation();
      e.preventDefault();

      // Animate the row away...
      $(this).parents('li.food-item').slideUp(250, function () {
        // ...remove it from the DOM...
        $(this).remove();

        // ...and push the changes to the server:
        updateMyOrder();
      });

      return false
    });

    return this; // for method chaining
  },

  // Creating a new delivery, event handler:
  createDelivery: function (restaurantID) {
    // Used in the animation callback:
    var that = this;

    this.$el.fadeOut(250, function () {
      // When that's done fading out, create the new one:
      that.model = new DeliveryModel();

      // Save the new delivery and render it:
      that.model.save({restaurantID: restaurantID}, {
        success: function () {
          that.render();
        },
      });

      // In the meantime, render the loader:
      that.render();
      that.$el.fadeIn();

      // Move the search pane over:
      $('#search-pane').animate({width: '35%', left: 0}, 500);
    });
  },

  // Viewing an existing delivery, event handler:
  joinDelivery: function (deliveryID) {
    // Used in the animation callback:
    var that = this;

    this.$el.fadeOut(250, function () {
      // When that's done fading out, load the new one:
      that.model = new DeliveryModel({id: deliveryID});

      // Fetch the data for that model and render it when it's ready:
      that.model.fetch({
        success: function () {
          that.render();
        },
      });

      // In the meantime, render the loader:
      that.render();
      that.$el.fadeIn();
      $('#search-pane').animate({width: '35%', left: 0}, 500);
    });
  },

  // Update the time from the DOM:
  updateDeliveryTime: function () {
    this.model.save({order_time: this.$el.find('#delivery-time').val()});
  },

  // Update the location from the DOM:
  updateDeliveryLocation: function () {
    this.model.save({delivery_location: this.$el.find('#delivery-location').val()});
  }
});
