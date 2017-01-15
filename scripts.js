$(function() {

    $('#connect').click(function(e) {
        if ( $('#nick').val().length === 0 ) 
        {
        	alert('Please enter a nickname!!');
        } 
        else if ( $('#chan').val().length === 0 )
    	{
    		alert('Please enter a channel');
    	}
        else
        {
        	connect();
	        $(this).hide();
	        $('#nick').fadeOut().addClass('hide');
	        $('#chan').fadeOut().addClass('hide');
        	$('.ircoutput').fadeIn().removeClass('hide');
        }
    });

    $("#input").on('keyup', function (e) {
        var privmsg = $(this).val();
        if (e.keyCode == 13) {
            sendMessage(privmsg);
            $(this).val('');
        }
    });

    function connect() {
        websocket = new WebSocket('ws://aurora.irc.arloria.net:8081/');
        console.log('connection established');

        websocket.onopen =  function(event) { open(event); }
        websocket.onmessage = function(event) { message(event); }
        websocket.onclose = function(event) { close(event); }
        websocket.onerror = function(event) { error(event); }
    }

    function open(event) {
        console.log('onopen called');
        $('#title').append('<p><strong style="color: #00CD00">CONNECTED</strong>: aurora.irc.arloria.net '+ $('#chan').val() +'</p>');
        $('#output ul').append('<li class="list-group-item">You have connected to aurora.irc.arloria.net</li>');
        $('#output ul').append('<li class="list-group-item">You are connected as [fn]_' + $('#nick').val() + '</li>');
        $('#output ul').append('<li class="list-group-item">You are speaking on '+$('#chan').val()+'</li>');
        websocket.send('USER iamdevloper * * :WebSocket User\n');
        websocket.send('NICK [fn]_'+$('#nick').val()+'\n');
    }

    function close(event) {
        console.log('onclose called');
        $('#title').append('<p><strong style="color: #fca000">DISCONNECTED</strong></p>');
        console.log('connection closed');
    }

    function error(event) {
        console.log('onerror called');
        $('#title').append('<p><strong style="color: #CD0000">ERROR!!!</strong></p>');

        console.log(event); 
    }

    function message(event) {
        console.log('onmessage called');
        rawData = event.data;
        if (rawData instanceof Blob)
        {
            var fileReader = new FileReader();
            fileReader.addEventListener("loadend",handleBinaryInput);
            fileReader.readAsText(rawData);
        }
        else
        {
            process(rawData);
        }
    }

    function process(message) {
        console.log(message);
        msgsplit = message.split(":");
        msgsplit2 = msgsplit[1].split(" ");
        cmd = msgsplit2[1];
        target = msgsplit2[2];
        srcnick = msgsplit2[0].split("!")[0];
        rest = message.slice(message.indexOf(':',1)+1,-1);
        if (message.indexOf('PING') == 0)
        {
            pongResponse = message.replace('PING','PONG');
            console.log('sending PONG');
            websocket.send(pongResponse);
        }
        else if ((cmd == '376') || (cmd == '422'))
        {
            websocket.send('JOIN '+$('#chan').val()+'\n'); // @todo var chan
        }
        else if ( cmd == '433' )
        {
            websocket.send('NICK [fn]_'+$('#nick').val()+'_'+Math.floor((Math.random() * 1000) + 1).toString()+'\n' );
        }
        else if ( (cmd == 'PRIVMSG') && (target == $('#chan').val() ) )
        {
            $('#output ul').append('<li class="list-group-item">&lt;'+srcnick+'&gt;: '+rest+'</li>');
        }
        
        if ( msgsplit[0] == 'ERROR ')
        {
            $('#output').append('<p><strong style="color: #CD0000">'+msgsplit+'</strong></p>');
        }
    }

    function sendMessage(privmsg) {
        websocket.send('PRIVMSG '+ $('#chan').val() +' '+ privmsg + '\n'); 
        $('#output ul').append('<li class="list-group-item">&lt;[fn]_'+$('#nick').val()+'&gt;: '+privmsg+'</li>');
    }

    function handleBinaryInput(event) {
        var fileReader = event.target;
        var raw = fileReader.result;
        process(raw);
    }
});