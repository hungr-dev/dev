var hungr = {};

/**
 * Helper functions
 */
var formatTelephone = function(telephone) {
	return '(' + telephone.substr(0, 3) + ') ' + telephone.substr(3, 3) + '-' + telephone.substr(6, 4);
}
var formatPrice = function(price) {
	return '$' + price + '.00';
}

hungr.init = function(){
	hungr.deliveryView = new DeliveryView();
	hungr.searchModel = new SearchModel({deliveryView: hungr.deliveryView})
	hungr.searchView = new SearchView({model: hungr.searchModel});
	hungr.appRouter = new AppRouter();
	$.ajax('current_member', {
	  success: function (data) {
	    hungr.currentMember = new MemberModel();
	    hungr.currentMember.id = data.id;
	    hungr.currentMember.fetch();
	  },
	  async: false,
	  method: 'get',
	  dataType: 'json'
	});
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

var truncateString = function(str){
	var length = 100;
	return  str.substring(0, 100) + '...';
};
