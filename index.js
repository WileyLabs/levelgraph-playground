var levelgraph = require('levelgraph');
var leveljs = require('level-js');
var levelup = require('levelup');
var levelgraphJSONLD = require('levelgraph-jsonld');

var factory = function (location) { return new leveljs(location) };

var db = levelgraphJSONLD(
  levelgraph(
    levelup('levelgraph-playgrond', {db: factory})
  )
);
window.db = db;

var $input = document.getElementById('input');

document.getElementById('put-button').addEventListener('click', function() {
  db.jsonld.put(JSON.parse($input.value), function(err, obj) {
    // do something after the obj is inserted
    console.log(err, obj);
  });
});
