var gateway = `ws://${window.location.hostname}:3001`;
var websocket;
var attempts = 0;
let ActiveTimer = false;
function initWebSocket() {
  attempts = attempts + 1;
  console.log('Trying to open a WebSocket connection...');
  websocket = new WebSocket(gateway);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage; // <-- add this line
}
function onOpen(event) {
  console.log('Connection opened');
  if (document.getElementById('arrGroups').innerHTML === '') {
    return;
  }
  document.getElementById('popup').style = 'display:none;';
  var GROUPS = JSON.parse(document.getElementById('arrGroups').innerHTML);
  GROUPS.forEach((e) => {
    // console.log(e) ;
    websocket.send(e.value);
  });
}

function onClose(event) {
  console.log('Connection closed');
  //if (attempts < 10)
  document.getElementById('popup').style = 'display:block;';
  setTimeout(initWebSocket, 2000);
}
function onMessage(event) {
  //var state;
  //console.log(event.data);
  //if (!websocket ||!event.data){return;}
  if (event.data === '{"refresh":true}') {
    location.reload();
  }

  if (document.getElementById('arrGroups').innerHTML === '') {
    if (event.data !== 'connection established' && event.data.length > 100) {
      console.log(tst[0].group);
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(event.data, 'text/html');
      var elm = htmlDoc.querySelectorAll('[data-group]')[0];
      //console.log(elm);
      var group = elm.getAttribute('data-group');
      document.getElementById(
        'lblMessage'
      ).textContent = `${group} group just had an update.`;
      document.getElementById('pnlMessage').style = 'block';

      setTimeout(() => {
        document.getElementById('lblMessage').textContent = '';
        document.getElementById('pnlMessage').style.display = 'none';
        document.getElementById('hHome').style.backgroundColor = 'green';
        document.getElementById('hHome').style.color = 'white';
      }, 5000);
      if (group === tst[0].group) {
        location.reload();
      } else {
        return;
      }
    }
  }
  if (event.data !== 'connection established' && event.data.length > 100) {
    // console.log(event.data);
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(event.data, 'text/html');
    var elm = htmlDoc.querySelectorAll('[data-group]')[0];
    //console.log(elm);
    var group = elm.getAttribute('data-group');
    //console.log(group);
    // do whatever you want with htmlDoc.getElementsByTagName('a');
    document.getElementById(group).innerHTML = event.data;
    //console.log(`B AT: ${ActiveTimer}`);
    if (ActiveTimer == false) {
      ActiveTimer = true;
      //console.log(`AT: ${ActiveTimer}`);
      setTimeout(() => {
        fetch('/gp')
          .then((response) => response.json())
          .then((grpjson) => {
            //console.log(grpjson);
            var GROUPS = JSON.parse(
              document.getElementById('arrGroups').innerHTML
            );
            var tst =
              JSON.stringify(grpjson) === JSON.stringify(GROUPS) ? true : false;
            console.log(
              `compare : ${tst} <=If this ends up being false and the groups basically match, then a string compare won't do.`
            );
            if (tst == false) {
              location.reload();
            }
            // GROUPS.forEach((e) => {
            //   console.log(e);
            // });
            ActiveTimer = false;
          });
      }, 10000);
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initWebSocket();
  console.log('loaded');
  //console.log(URL.href);
  //console.log(window.location.search);
  const params = new URLSearchParams(window.location.search);
  //console.log(params.has('template'));
  let rTemplate = params.get('template');
  let lsTemplate = localStorage.getItem('template');

  if (
    rTemplate === 'main' ||
    (!params.has('template') && lsTemplate === null)
  ) {
    //console.log('1');
    localStorage.clear();
  } else {
    // console.log('2');
    localStorage.setItem('template', rTemplate);
  }

  //localStorage.getItem("lastname");
  if (websocket.readyState !== WebSocket.OPEN) {
    //console.log('OPEN');
    //var GROUPS = JSON.parse(document.getElementById('arrGroups').innerHTML);
    // GROUPS.forEach((e) => {
    //   console.log(e);
    //   // websocket.send(e.value);
    // });
  }
});
