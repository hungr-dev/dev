/**
 * Helper functions
 */

// Format a telephone number given in "xxxxxxxxxx" to "(xxx) xxx-xxxx":
var formatTelephone = function(telephone) {
  return '(' + telephone.substr(0, 3) + ') ' + telephone.substr(3, 3) + '-' + telephone.substr(6, 4);
}

// Format a price given either as an integer or float in a human-readable fashion:
var formatPrice = function(price) {
  var cents = (parseFloat(price) * 100) % 100;
  var dollars = parseInt(price);

  if (cents < 10) {
    cents = '0' + cents;
  }

  return '$' + dollars + '.' + cents;
}

// If the browser doesn't have native JSON support, include a JSON "stringify" function:
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

// Very, very basic obfuscation of delivery IDs in the URL (obviously not secure, for demo):
var magic = 22801765351;
var idToCode = function(id) {
  return (parseInt(id) * magic).toString(36);
}
var codeToId = function (code) {
  return parseInt(code, 36) / magic;
}

// Simple string truncation:
var truncateString = function(str){
  var length = 100;
  return  str.substring(0, 100) + '...';
};
