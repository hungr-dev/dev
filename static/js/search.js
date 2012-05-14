var SearchModel = Backbone.Model.extend({
	defaults: {
		model: null,
		deliveryView: null
	}
});

var searchTimeout;
var SearchView = Backbone.View.extend({
	id: 'search-wrapper',
	initialize: function(){
		this.$el = $('#search-wrapper');
		this.render();
	},
	render: function(){
		// Compile the template using underscore
		var template = _.template($('#search-html').html(), {});

		// Load the compiled HTML into the wrapper
		this.$el.html(template);
		return this;
	},
	events: {
		'keypress #search-box' : 'searchEnter'
	},
	searchEnter: function(e){
		if (searchTimeout != undefined) clearTimeout(searchTimeout);
		var that = this;
		searchTimeout = setTimeout(function () {
			var q = $('#search-box').val();
			that.search(q);
			hungr.appRouter.navigate('search/' + q);
		}, 250);
	},
	search: function(searchTerm){
		// Clean search term
		var q = $.trim(searchTerm.toLowerCase());
		var that = this;

		// Call search controller
		$.get('search', {'query': q}, function(data){
			if (data.results.length > 0) {
				var results_list = [];

				// Empty current results list
				$('#results-wrapper').html('');

				for (each in data.results){
					var restaurantModelData = data.results[each];
					restaurantModelData.deliveryView = that.model.get('deliveryView');

					var result_model = new ResultModel(restaurantModelData);

					var result_view = new ResultView({model: result_model});
					results_list.push(result_model);
				}

				var result_collection = new ResultCollection(results_list);
			}
		});
	},
	updateSearchDisplay: function(searchTerm){
		this.$el.find($('#search-box')).val(searchTerm);
	}
});

var ResultCollection = Backbone.Collection.extend({
	model: ResultModel
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

var ResultView = Backbone.View.extend({
	className: 'result',
	events: {
		'click .create-button': 'createDelivery',
		'click .join-delivery-button': 'joinDelivery'
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
