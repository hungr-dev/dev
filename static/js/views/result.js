var ResultView = Backbone.View.extend({
  className: 'result',
  events: {
    'click .create-button': 'createDelivery',
    'click .join-button': 'joinDelivery'
  },
  initialize: function() {
    this.wrapper = $('#results-wrapper');
    this.render();
  },
  render: function() {
    var restaurant = this.model;
    var viewData = {
      result_name : restaurant.get('name'), 
      result_food_items: truncateString(restaurant.get('food_items').join(', ')),
      result_cuisines : restaurant.get('cuisine').join(', '),
      result_address_city: restaurant.get('address_city'),
      result_deliveries: restaurant.get('deliveries')
    }

    var template = _.template($('#result-html').html(), viewData);

    this.$el.html(template);
    this.wrapper.append(this.el);
  },
  createDelivery: function () {
    var deliveryId = this.model.get('id');
    this.model.get('deliveryView').createDelivery(deliveryId);
    hungr.appRouter.navigate('delivery/' + idToCode(deliveryId));
  },
  joinDelivery: function(ev) {
    console.log($(ev.target).attr('id'))
    var deliveryId = $(ev.target).attr('id');
    this.model.get('deliveryView').joinDelivery(deliveryId);
    hungr.appRouter.navigate('delivery/' + idToCode(deliveryId)); 
  }
});
