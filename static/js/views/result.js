// The result view provides event handlers for each search result:
var ResultView = Backbone.View.extend({
  // Tell Backbone how to make the DOM element:
  className: 'result',

  // Event handlers for the different buttons:
  events: {
    'click .create-button': 'createDelivery',
    'click .join-button': 'joinDelivery'
  },

  // Set up the wrapper and render the result:
  initialize: function() {
    this.wrapper = $('#results-wrapper');
    this.render();
  },

  // Renderer:
  render: function() {
    // Set up the view data:
    var restaurant = this.model;
    var viewData = {
      result_name : restaurant.get('name'), 
      result_food_items: truncateString(restaurant.get('food_items').join(', ')),
      result_cuisines : restaurant.get('cuisine').join(', '),
      result_address_city: restaurant.get('address_city'),
      result_deliveries: restaurant.get('deliveries')
    }

    // Render the template:
    var template = _.template($('#result-html').html(), viewData);

    // Put the rendered HTML into the DOM:
    this.$el.html(template);
    this.wrapper.append(this.el);
  },

  // Callback for create delivery event handler:
  createDelivery: function () {
    // TODO: shouldn't store the ID in the ID field.
    var deliveryId = this.model.get('id');
    this.model.get('deliveryView').createDelivery(deliveryId);

    // Tell the router where we're going:
    hungr.appRouter.navigate('delivery/' + idToCode(deliveryId));
  },

  // Callback for joining a delivery event handler:
  joinDelivery: function(ev) {
    // TODO: shouldn't store the ID in the ID field.
    var deliveryId = $(ev.target).attr('id');
    this.model.get('deliveryView').joinDelivery(deliveryId);

    // Tell the router where we're going:
    hungr.appRouter.navigate('delivery/' + idToCode(deliveryId)); 
  }
});
