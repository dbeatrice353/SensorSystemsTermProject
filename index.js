/*
David Beatrice

Sensor Systems Project - the cloud app

The app should handle 3 cases:

1) receive hello messages from sensor nodes (POST)
2) receive alerts from nodes (POST)
3) Respond to requests for the web interface (GET)
4) Respond to data update requests from the web interface (GET)
5) Respond to a request for a browser-based fake node for testing purposes (GET)

*/


var express = require('express');
var bodyParser = require("body-parser");
var pg = require('pg');
var app = express();

app.set('port', (process.env.PORT || 5000));
// static files (js)
app.use(express.static(__dirname + '/public'));
// use body-parser for post data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// Respond to requests for the web interface (GET)
app.get('/', function(request, response) {
  response.render('pages/index');
});

// Respond to a request for a browser-based fake node
// for testing purposes (GET)
app.get('/testnode', function(request, response) {
  response.render('pages/testnode');
});

// Receive "hello" messages from nodes (POST)
app.post('/hello', function (req, res) {
  var node_id = req.body.node_id;
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    // yes, this is a security vulnerability...
    client.query('UPDATE sensor_node SET last_hello = NOW() WHERE id = ' + node_id + ';', function(err, result) {
      done();
      if (err){
        console.error(err); res.send("Error " + err);
      } else {
        res.send('success');
      }
    });
  });
});

// Receive alerts from nodes (POST)
app.post('/alert', function (req, res) {
  var node_id = req.body.node_id;
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    // yes, this is a security vulnerability...
    client.query('INSERT INTO alert (node_id,time) VALUES ('+node_id+',NOW());', function(err, result) {
      done();
      if (err){
        console.error(err); res.send("Error " + err);
      } else {
        res.send('success');
      }
    });
  });
})

// Respond to data update requests from the web interface (GET)
app.get('/data', function (req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM sensor_node', function(err, nodes) {
      done();
      if (err){
        console.error(err); res.send("Error " + err);
      } else {
        // nesting a second query in the callback because that's how this works for whatever reason...
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          client.query('SELECT * FROM alert', function(err, alerts) {
            done();
            if (err){
              console.error(err); res.send("Error " + err);
            } else {
              res.send(JSON.stringify({'nodes':nodes.rows,'alerts':alerts.rows}));
            }
          });
        });
      }
    });
  });
});

// test the db connection
app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM sensor_node', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
})

app.listen(app.get('port'), function() {
  console.log('Listening on port', app.get('port'),'...');
});
