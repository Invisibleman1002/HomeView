var gateway = `ws://${window.location.hostname}`;
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
  var GROUPS = JSON.parse(document.getElementById('arrGroups').innerHTML);
  GROUPS.forEach((e) => {
    // console.log(e) ;
    websocket.send(e.value);
  });
}

function onClose(event) {
  console.log('Connection closed');
  //if (attempts < 10)
  setTimeout(initWebSocket, 2000);
}
function onMessage(event) {
  var state;
  //console.log(event.data);
  //if (!websocket ||!event.data){return;}
  if (event.data === '{"refresh":true}') {
    location.reload();
  }
  //   if (event.data === '{"getgroups":true}') {
  //     setTimeout(() => {
  //       fetch('/gp')
  //         .then((response) => response.json())
  //         .then((column) => {
  //           datatable.columns.add(column);
  //         });
  //     }, 60000);
  //   }
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
  if (websocket.readyState !== WebSocket.OPEN) {
    //console.log('OPEN');
    //var GROUPS = JSON.parse(document.getElementById('arrGroups').innerHTML);
    // GROUPS.forEach((e) => {
    //   console.log(e);
    //   // websocket.send(e.value);
    // });
  }
});
