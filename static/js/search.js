var SearchView = Backbone.View.extend({
	model: SearchModel,

	initialize: function(){
		this.wrapper = $('#search-wrapper');
		this.render();
	},
	render: function(){
		// Compile the template using underscore
		var template = _.template($('#search-html').html(), {});

		// Load the compiled HTML into the wrapper
		this.wrapper.html(template);
	},
	events: {
		'keypress input': 'searchHandler'
	},
	searchHandler: function(e){
		if (e.which === '13'){
			model.search($('#search-box').val());
		}
	}

});

var SearchModel = Backbone.Model.extend({
	search: function(searchTerm){
		// Clean search term
		var q = $.trim(searchTerm.toLowerCase());

		// Call search controller
		$.get('search', {query: q}, function(results){
			if (results.length > 0){
				for (each in results){
					result_collection.push( new ResultModel(results[each]) );
				}
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
		var resultView = new ResultView(viewData);
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