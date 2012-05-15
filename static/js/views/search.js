// The search view handles the functionality for the search box:
var searchTimeout; // used to detect typing
var SearchView = Backbone.View.extend({
  // Tell Backbone which element to use:
  id: 'search-wrapper',

  // Initialize the element and render it:
  initialize: function () {
    this.$el = $('#search-wrapper');
    this.render();
  },

  // Renderer:
  render: function () {
    // Compile the template using underscore
    var template = _.template($('#search-html').html(), {});

    // Load the compiled HTML into the wrapper
    this.$el.html(template);
    return this;
  },

  // Only one event handler: keypress:
  events: {
    'keypress #search-box' : 'searchEnter'
  },

  // Callback for keypress event handler:
  searchEnter: function (e) {
    // If that timer is already set, then clear it:
    if (searchTimeout != undefined) clearTimeout(searchTimeout);
    var that = this;

    // Set a timer to detect if the user has stopped typing
    // (no keypress in 250ms):
    searchTimeout = setTimeout(function () {
      // If they have stopped...
      var q = $('#search-box').val();

      // ...call the search method:
      that.search(q);
      hungr.appRouter.navigate('search/' + q);
    }, 250);
  },

  // Search handler, performs a search:
  search: function (searchTerm) {
    // Clean search term
    var q = $.trim(searchTerm.toLowerCase());
    var that = this;

    // Call search controller
    $.get('search', {'query': q}, function(data){
      if (data.results.length > 0) {
        var results_list = [];

        // Empty current results list
        $('#results-wrapper').html('');

        // Render the new results:
        for (each in data.results){
          var restaurantModelData = data.results[each];
          restaurantModelData.deliveryView = that.model.get('deliveryView');

          var result_model = new ResultModel(restaurantModelData);
          var result_view = new ResultView({model: result_model});
          results_list.push(result_model);
        }

        // Create the result collection
        var result_collection = new ResultCollection(results_list);
      }
    });
  },

  // Update the searchbox (used in event handlers):
  updateSearchDisplay: function (searchTerm) {
    this.$el.find($('#search-box')).val(searchTerm);
  }
});
