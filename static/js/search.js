var SearchView = Backbone.View.extend({
	initialize: function(){
		this.wrapper = $('#search-wrapper');
		this.render();
		var _this = this;

		$('#search-box').keypress(function(e){
			if (e.which === 13){
				_this.search($('#search-box').val());
			}
		});

	},
	render: function(){
		// Compile the template using underscore
		var template = _.template($('#search-html').html(), {});

		// Load the compiled HTML into the wrapper
		this.wrapper.html(template);
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
	initialize: function() {
		this.wrapper = $('#results-wrapper');
		this.render();
	},
	render: function() {
		var restaurant = this.model;
		var viewData = {
			result_name: restaurant.get('name'), 
			result_cuisine: restaurant.get('cuisine')
		}
		var template = _.template($('#result-html').html(), viewData);

		this.wrapper.append(template);
		this.wrapper.find('div.result:last-child .create-button-wrapper').click(function () {
			console.log(restaurant);
			var delivery = new DeliveryModel({restaurant: restaurant});
			var view = new DeliveryView({model: delivery});
			view.render();
		});
	}
});
