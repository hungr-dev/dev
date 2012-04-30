var SearchView = Backbone.View.extend({
	initialize: function(){
		this.wrapper = $('#search-wrapper');
		this.render();
	},
	render: function(){
		// Compile the template using underscore
		var template = _.template($('#search-html').html(), {});

		// Load the compiled HTML into the wrapper
		this.wrapper.html(template);
	}
})