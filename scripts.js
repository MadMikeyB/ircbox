$(function() {

    $('#connect').click(function() {
        connect();
        $(this).hide();
        $('.ircoutput').fadeIn().removeClass('hide');
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
        console.log(event);
        $('#output').append('<p><strong style="color: #00CD00">CONNECTED</strong></p>');
        websocket.send('USER iamdevloper * * :WebSocket User\n');
        websocket.send('NICK [fn]_mikey\n'); // @todo var nick
    }

    function close(event) {
        console.log('onclose called');
        $('#output').append('<p><strong style="color: #fca000">DISCONNECTED</strong></p>');
        console.log('connection closed');
    }

    function error(event) {
        console.log('onerror called');
        $('#output').append('<p><strong style="color: #CD0000">ERROR!!!</strong></p>');

        console.log(event); 
    }

    function message(event) {
        console.log('onmessage called');
        console.log(event);
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
            websocket.send('JOIN #tiramisu\n'); // @todo var chan
        }
        else if ( cmd == '433' )
        {
            websocket.send('NICK [fn]_mikey_'+Math.floor((Math.random() * 1000) + 1).toString()+'\n' );
        }
        else if ( (cmd == 'PRIVMSG') && (target == '#tiramisu') )
        {
            document.getElementById('output').innerHTML += srcnick+': '+rest+'<br />';
        }
    }

    function handleBinaryInput(event) {
        var fileReader = event.target;
        var raw = fileReader.result;
        process(raw);
    }
});