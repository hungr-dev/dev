var SearchView = Backbone.View.extend({
	id: 'search-wrapper',
	deliveryView: null,
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
		if (e.which === 13){
			this.search($('#search-box').val());
		}
	},
	search: function(searchTerm){
		// Clean search term
		var q = $.trim(searchTerm.toLowerCase());
		var that = this;

		// Call search controller
		$.get('search', {'query': q}, function(data){
			if (data.results.length > 0){
				var results_list = [];

				// Empty current results list
				$('#results-wrapper').html('');

				for (each in data.results){
					var restaurant = data.results[each];
					var result_model = new ResultModel(restaurant);
					var result_view = new ResultView({model: result_model});
					result_view.deliveryView = that.deliveryView;

					results_list.push(result_model);
				}

			var result_collection = new ResultCollection(results_list);
			}
		});
	}
});

var ResultCollection = Backbone.Collection.extend({
	model: ResultModel
});

var ResultModel = Backbone.Model.extend({
	defaults: {
		id: null,
		address_city: "",
		name: "",
		cuisine: [],
		deliveries: [],
		food_items: [],
	},
});

var ResultView = Backbone.View.extend({
	className: 'result',
	deliveryView: null,
	events: {
		'click .create-button-wrapper': 'createDelivery'
	},
	initialize: function() {
		this.wrapper = $('#results-wrapper');
		this.render();
	},
	render: function() {
		var restaurant = this.model;
		var viewData = {
			result_name : restaurant.get('name'), 
			result_food_items: restaurant.get('food_items').join(', '),
			result_cuisines : restaurant.get('cuisine').join(', '),
			result_address_city: restaurant.get('address_city')
		}

		var template = _.template($('#result-html').html(), viewData);

		this.$el.html(template);
		this.wrapper.append(this.el);
	},
	createDelivery: function () {
		this.deliveryView.createDelivery(this.model.get('id'));
	},
	joinDelivery: function () {
		//delivery_view.join_delivery
		return;
	}
});
