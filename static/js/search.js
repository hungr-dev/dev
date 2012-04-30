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
				for (each in data.results){

					results_list.push( new ResultModel(data.results[each]) );
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
	initialize: function() {
		var viewData = {
			id: this.id,
			name: this.name,
			cuisine: this.cuisine,
			deliveries: this.deliveries
		};
		var result_view = new ResultView(viewData);
	}
});

var ResultView = Backbone.View.extend({
	initialize: function(){
		this.wrapper = $('#results-wrapper');
		this.render();
	},
	render: function() {
		var displayData = {result_title: this.name, result_cuisine: this.cuisine};
		var template = _.template($('#result-html').html(), displayData);
		this.wrapper.html(template);
	}
});