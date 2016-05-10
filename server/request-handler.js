var qs = require('querystring');
var fs = require('fs');
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/


var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};



var body = {results: []};

var requestHandler = function(request, response) {
  var statusCode = 200;
  var postCode = 201;
  var errCode = 404;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';


  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // if options 
  if (request.method === 'OPTIONS') {
    response.writeHead(statusCode, headers);
    response.end('Allow: GET, POST, OPTIONS');

    // if standard page 
  } else if (request.url === '/') {
    fs.readFile('./client/index.html', function(err, data){
      if(err) {
        console.log('ERROR ---------------->', err);
        response.writeHead(404);
        response.write("Not Found!");
      } else {
        console.log(qs.parse(data));
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
       }
      response.end();
    });

  } else if (/^\/[a-zA-Z0-9_\/]*.css$/.test(request.url.toString())) {
   
    sendFileContent(response, request.url.toString().substring(1), "text/css");


  } else if (/^\/[a-zA-Z0-9_\/]*.js$/.test(request.url.toString())) {
   
    sendFileContent(response, request.url.toString().substring(1), "text/javascript");


  } else if (/^\/[a-zA-Z0-9_\/]*.gif$/.test(request.url.toString())) {
   
    var img = fs.readFileSync('./client/' + request.url.toString().substring(1));
    response.writeHead(200, {'Content-Type': 'image/gif'});
    response.end(img, 'binary');

    // Case if it's our URL and a POST
  } else if (request.url.toString().indexOf('classes/messages') !== -1 &&  request.method === 'POST') {
    var requestBody = '';

    request.on('data', function(data) {
      requestBody += data;
    });

    request.on('end', function() {
      var messageData = JSON.parse(requestBody);
      console.log(messageData, '<<---------- Message Data | Request Body ---------->>', requestBody);
      body.results.push(messageData);
    });

    response.writeHead(postCode, headers);
    response.end('End get request for now...');

    // Case if it's our URL and a GET
  } else if (request.url.toString().indexOf('classes/messages') !== -1 && request.method === 'GET') {
    console.log('Serving requests on my page---------')
    fs.readFile('messages.txt', 'utf8', function(err, data){
      if(err) {
        console.log('ERROR ---------------->', err);
        response.writeHead(404);
        response.write("Not Found!");
      } else {
        console.log('DATA IS --------------', JSON.stringify(JSON.parse(data)));
        response.writeHead(statusCode, headers);
        response.write(data);
       }
      response.end();
    });

  // Case if url != our url, response 403 
  } else {
    response.writeHead(errCode, headers);
    response.end('Not a valid URL');
  }


  // The outgoing status.

  // See the note below about CORS headers.

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.

  ///// FUNCTIONS ////////

  function sendFileContent(response, fileName, contentType){
    fs.readFile(('./client/' + fileName), function(err, data){
      if(err){
        response.writeHead(404);
        response.write("Not Found!");
      }
      else{
        response.writeHead(200, {'Content-Type': contentType});
        response.write(data);
      }
      response.end();
    });
  }

};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.


exports.requestHandler = requestHandler;

