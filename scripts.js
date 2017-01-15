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
            websocket.send('USER iamdevloper * * :WebSocket User\n');
            websocket.send('NICK [fn]_chupacabra\n'); // @todo var nick
            websocket.onmessage = function(message) {
              console.log('onmessage called');
              rawData = message.data;
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
              function handleBinaryInput(event)
              {
                var fileReader = event.target;
                var raw = fileReader.result;
                process(raw);
              }
            }
            function process(message) {
              console.log(message);
              msgsplit = message.split(":");
              msgsplit2 = msgsplit[1].split(" ");
              cmd = msgsplit2[1];
              target = msgsplit2[2];
              srcnick = msgsplit2[0].split("!")[0];
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
                document.getElementById('output').innerHTML += srcnick+': '+msgsplit[2]+'<br />';
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
