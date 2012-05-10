// ==UserScript==
// @name          quans scraper
// @description   scraping quans for stuff
// @include       http://www.seamless.com/*
// @include       https://www.seamless.com/*
// ==/UserScript==


// a function that loads jQuery and calls a callback function when jQuery has finished loading 
// credit goes to random ppl on Stackoverflow for this

// we'll have to refactor this, since we have to bundle it all into one Chrome extension. I think we can load jquery w/ 
// the extension so we'll be okay, performance times should get better
function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
};

// the guts of this userscript
function main() {
   $(".menuItem").each(function(index,value){
	var foodName = $($($(value).children()[0]).children()[0]).html();
	//var hasperiod = foodName.indexOf(".");
	//if (hasperiod != -1){
	//	foodName  = foodName.substring(hasperiod+2);
	// };
	var price = $($(value).children()[1]).html();
	var parsedPrice = price.replace("$","");
	//restaurantid hardcoded on server side
	$.post('http://18.216.1.75:5000/quans_scraper', {'food': foodName, 'price': parsedPrice});
	
});
	
};

// load jQuery and execute the main function
addJQuery(main);
