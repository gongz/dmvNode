
/**
 * Module dependencies.
 */

 var request = require('request'),
 url = require('url'),
 jsdom = require('jsdom'),
 express = require('express'),
 fs = require('fs'),
 http = require('http');
 ;

 var app = express();
 
 app.use(function(req, res, next){

 	requestedUri = url.parse(req.url).pathname;
 	console.log("Got request for " +requestedUri);
 	requestedUri = requestedUri.substring(1);
 	console.log("Parsed to " +requestedUri);
 	if(requestedUri.length == 0)
 	{
 		console.log("Got request for root");
 		res.render('root', {title: 'Welcome!' });
 	}
 	else if(requestedUri.match('stylesheets/style.css')){
		//handle css file
		var filePath = './public' + req.url;
		console.log("Got request for " +filePath);
		fs.readFile(filePath, function(error, content) {
			res.writeHead(200, { 'Content-Type': 'text/css' });
			res.end(content, 'utf-8');  
		});
	} else if (!requestedUri.match('^http')) {
		//handle invalid url
		res.writeHead(500, {"Content-Type": "text/html"})
		res.write();
		res.end("Invalid url");  	
	} else {

			//handle request to http websites
			request({uri: requestedUri}, function (error, response, body) {
		      	//console.log("Fetched " +someUri+ " OK!");
			var result = this;		
			result.items = new Array();
			try{
				jsdom.env({
					html: body,
					scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
					done:function(err, window){				
						var $ = window.jQuery; 

						// var text = $('.child-timetainer').html();
						var text = new Array();
						var licenseTime = new Array();
						var regTime = new Array();
						
						$( ".current-time-location" ).each(function( index ) {
						  text[index] = $( this ).text();
						});

						$('.current-time-license').each(function( index ) {
						  licenseTime[index] = $( this ).text();
						});

						$('.current-time-registration').each(function( index ) {
						  regTime[index] = $( this ).text();
						});
						
						// //generate result 	
						for ( var i = 0; i < text.length; ++i) {
							result.items[i] = {
								word: result.items[i]= text[i]+"#"+licenseTime[i]+"#"+regTime[i]
							};
						}				
						//console.log(result); //debug	
						
						res.render('simple', {
							title: 'bar',		          
							items: result.items
						});
					} 

				})
			}catch(e)
			{
				console.log("invalid jsdom url"+e);
				res.render('root', {title: 'Error caused by invalid jsdom url!' });
			};   	      
		});
	}

});





// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view option',{layout:false});  
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});



app.listen(process.env.PORT||8080);
console.log("Express server listening on port %s mode", app.settings.env);
