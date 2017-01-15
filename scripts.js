$(function() {

	$('#connect').click(function() {
		connect();
		$(this).hide();
		$('.ircoutput').fadeIn().removeClass('hide');
	});

	function connect() {
		websocket = new WebSocket('ws://aurora.irc.arloria.net:8081/');
		console.log('connection established');

		websocket.onopen =  function(message) {
			console.log('onopen called');
			console.log(message);
			websocket.send('USER iamdevloper * * :WebSocket User');
			websocket.send('NICK [fn]_mikey'); // @todo var nick
			websocket.onmessage = function(message) {
				console.log('onmessage called');
				console.log(message);
				if (message.indexOf('PING') == 0)
				{
					pongResponse = message.replace('PING','PONG');
					console.log('sending PONG');
					websocket.send(pongResponse);
				}
				else if (message.indexOf('376') > -1)
				{
					websocket.send('JOIN #tiramisu'); // @todo var chan
				}
				else if ( message.indexOf('422') > -1 ) {
					websocket.send('JOIN #tiramisu');
				}
				else if ( message.indexOf('433') > -1 ) {
					websocket.send('NICK [fn]_mikey_'+Math.floor((Math.random() * 1000) + 1).toString() );
				}
			}
			websocket.onclose = function(event) {
				console.log('onclose called');
				console.log('connection closed');
			}
			websocket.onerror = function(event) {
				console.log('onerror called');
				console.log(event.data);
			}
		}
	}
	
});