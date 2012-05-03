var SearchView = Backbone.View.extend({
	el: $('#search-wrapper'),
	initialize: function(){
		this.render();
	},
	render: function(){
		// Compile the template using underscore
		var template = _.template($('#search-html').html(), {});

		// Load the compiled HTML into the wrapper
		this.el.html(template);
	},
	events: {
		'keypress #search-box' : 'searchEnter'
	},
	searchEnter: function(e){
			if (e.which === 13){
				this.search(this.el.find('#search-box').val());
			}
	},
	search: function(searchTerm){
		// Clean search term
		var q = $.trim(searchTerm.toLowerCase());

		// Call search controller
		$.get('search', {query: q}, function(data){
			if (data.results.length > 0){
				var results_list = [];

				// Empty current results list
				$('#results-wrapper').html('');

				for (each in data.results){
					var restaurant = data.results[each];
					var result_model = new ResultModel(restaurant);
					var result_view = new ResultView({model: result_model});

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
		name: "Not specified",
		cuisine: "Not specified",
		deliveries: []
	},
});

var ResultView = Backbone.View.extend({
	el: $('results-wrapper'),
	events: {
		"dblclick": "",
		"click .create-button": "createOrder"
	},
	initialize: function() {
		this.render();
	},
	render: function() {
		var restaurant = this.model;
		var viewData = {
			result_name : this.model.get('name'), 
			result_cuisine : this.model.get('cuisine'),
			result_address: this.model.get('address')
		}
		this.el
		var template = _.template($('#result-html').html(), viewData);

		this.wrapper.append(template);
		this.wrapper.find('div.result:last-child .create-button-wrapper').click(function () {
			console.log(restaurant);
			var delivery = new DeliveryModel({restaurant: restaurant});
			var view = new DeliveryView({model: delivery});
			view.render();
		});
	},
	createOrder: function () {
		var order = new OrderModel({})
	}
});
