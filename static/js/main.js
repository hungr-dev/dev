var hungr = {};

/**
 * Helper functions
 */
var formatTelephone = function(telephone) {
	return '(' + telephone.substr(0, 3) + ') ' + telephone.substr(3, 3) + '-' + telephone.substr(6, 4);
}
var formatPrice = function(price) {
	if (price === parseInt(price)) {
		return '$' + price + '.00';
	} else {
		return '$' + price;
	}
}
var JSON = JSON || {};
JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {
		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};
var magic = 22801765351;
var idToCode = function(id) {
	return (parseInt(id) * magic).toString(36);
}
var codeToId = function (code) {
	return parseInt(code, 36) / magic;
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
	  type: 'GET',
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
		'delivery/:code': 'delivery'
	},
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

var truncateString = function(str){
	var length = 100;
	return  str.substring(0, 100) + '...';
};
