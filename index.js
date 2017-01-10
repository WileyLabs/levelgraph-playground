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


function loadSPOTable(list) {
  function addTd(tr, value) {
    var td = document.createElement('td');
    td.textContent = value;
    tr.appendChild(td);
  }

  var $tbody = document.querySelector('#spo-table tbody');

  // empty tbody...
  while ($tbody.hasChildNodes()) {
    $tbody.removeChild($tbody.lastChild);
  }

  list.forEach(function(obj) {
    var tr = document.createElement('tr');
    addTd(tr, obj.subject);
    addTd(tr, obj.predicate);
    addTd(tr, obj.object);

    $tbody.appendChild(tr);
  });
}

function displayAllTriples() {
  db.get({}, function(err, list) {
    loadSPOTable(list);
  });
}

var $input = document.getElementById('input');

document.getElementById('put-button').addEventListener('click', function() {
  db.jsonld.put(JSON.parse($input.value), function(err, obj) {
    // do something after the obj is inserted
    console.log(err, obj);
    displayAllTriples();
  });
});

displayAllTriples();
