var hungr = {};

hungr.init = function(){
	hungr.deliveryView = new DeliveryView();
	hungr.searchModel = new SearchModel({deliveryView: hungr.deliveryView})
	hungr.searchView = new SearchView({model: hungr.searchModel});
	hungr.appRouter = new AppRouter();
};

$(document).ready(function(){
	hungr.init();
	Backbone.history.start();
});

var AppRouter = Backbone.Router.extend({
	routes: {
		'search/:query': 'search',
		'delivery/:id': 'delivery'
	},
	search: function(query) {
		hungr.searchView.search(query);
		hungr.searchView.updateSearchDisplay(query);
		return;
	},
	delivery: function(id) {
		hungr.deliveryView.joinDelivery(id);
		return;
	}
});
