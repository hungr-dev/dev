// This global object holds our application's settings, etc.
var hungr = {};

// Initialize the variables our application will need on startup:
hungr.init = function(){
	// Initialize BB views, models, and a router:
	hungr.deliveryView = new DeliveryView();
	hungr.searchModel = new SearchModel({deliveryView: hungr.deliveryView})
	hungr.searchView = new SearchView({model: hungr.searchModel});
	hungr.appRouter = new AppRouter();

	// Fetch information about the current member:
	// TODO: make this asynchronous somehow?
	$.ajax('current_member', {
	  success: function (data) {
	    hungr.currentMember = new MemberModel();
	    hungr.currentMember.id = data.id;
	    hungr.currentMember.fetch();
	  },
	  async: false,
	  type: 'GET',
	  dataType: 'json'
	});
};

// Define the application's router and routes:
var AppRouter = Backbone.Router.extend({
	routes: {
		'search/:query': 'search',
		'delivery/:code': 'delivery'
	},
	// Super simple functionality for both:
	search: function(query) {
		hungr.searchView.search(query);
		hungr.searchView.updateSearchDisplay(query);
		return;
	},
	delivery: function(code) {
		hungr.deliveryView.joinDelivery(codeToId(code));
		return;
	}
});

// ...and, finally, on document ready:
$(document).ready(function(){
	// Start the app up!
	hungr.init();
	Backbone.history.start();
});
