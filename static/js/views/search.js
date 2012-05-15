var searchTimeout;
var SearchView = Backbone.View.extend({
  id: 'search-wrapper',
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
    if (searchTimeout != undefined) clearTimeout(searchTimeout);
    var that = this;
    searchTimeout = setTimeout(function () {
      var q = $('#search-box').val();
      that.search(q);
      hungr.appRouter.navigate('search/' + q);
    }, 250);
  },
  search: function(searchTerm){
    // Clean search term
    var q = $.trim(searchTerm.toLowerCase());
    var that = this;

    // Call search controller
    $.get('search', {'query': q}, function(data){
      if (data.results.length > 0) {
        var results_list = [];

        // Empty current results list
        $('#results-wrapper').html('');

        for (each in data.results){
          var restaurantModelData = data.results[each];
          restaurantModelData.deliveryView = that.model.get('deliveryView');

          var result_model = new ResultModel(restaurantModelData);

          var result_view = new ResultView({model: result_model});
          results_list.push(result_model);
        }

        var result_collection = new ResultCollection(results_list);
      }
    });
  },
  updateSearchDisplay: function(searchTerm){
    this.$el.find($('#search-box')).val(searchTerm);
  }
});
