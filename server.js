// >npm start
//in terminal to start this site.
//IF new group created, website will need to know!
//Empty resultset.
/*
https://github.com/websockets/ws/tree/master
*/
const http = require('http');
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const mqtt = require('mqtt'); // require mqtt
const { WebSocketServer } = require('ws');
const dayjs = require('dayjs');

var clsSettings = require('./g_settings.js'); //import clsSettings from './g_settings.js';
var Dbase = require('./database.js');
const db = new Dbase('db.sqlite');
var fs = require('fs');
let client;
//console.log(handlebars.create().handlebars.compile);
const app = express();

//app.engine(".hbs", handlebars({ extname: ".hbs" }));
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.static(__dirname));

app.engine(
  'hbs',
  handlebars.engine({
    defaultView: 'default',
    layoutsDir: __dirname + '/views/layouts',
    //partialsDir: __dirname + "/views/partials",
    extname: 'hbs',
  })
);

var WSRunning = true;
var MQTTRunning = true;
app.set('MQTTRunning', MQTTRunning);
const hbs = handlebars.create();

hbs.handlebars.registerHelper('messagenumber', function (msg, dp, options) {
  //msg = the topic message coming in as float.
  //dp = decimal places for use in toFixed(dp)
  var mf = parseFloat(msg);
  //   console.log(mf);
  //   console.log(msg);
  if (isNaN(mf)) return msg;
  else return mf.toFixed(parseInt(dp));
});

hbs.handlebars.registerHelper('dayjs', function (dt, fmt, td, options) {
  //format the date string using dayjs.
  //dt = dateinput
  //fmt is the daysjs formating
  //td = if today is the same as dt, 1=remove date and show time only.  Not 1, dont change.
  //console.log(dayjs().format("MM/DD/YYYY hh:mm:ss A"));
  //console.log(`dayjs ${dt}`);
  if (dt === null) {
    return '';
  }
  var dati = dayjs(dt).format(fmt);
  if (td == '1') {
    //console.log(dayjs().isSame(dayjs(dt).format("MM/DD/YYYY"), "day"));
    if (dayjs().isSame(dayjs(dt).format('MM/DD/YYYY'), 'day')) {
      dati = dayjs(dt).format('hh:mm:ss A');
    }
  }
  return dati; //dayjs(dt).format(fmt);
});

hbs.handlebars.registerHelper('ifdatebetween', function (v1, v2, options) {
  //For sensores and the lastupdated, its possible the difference is a second.  Which means they are not equal.
  //This means the last updated row might not get highlighted since match is not exact.
  //this function checks that the sensor is within 5 seconds +-.
  //   console.log("helper");
  //   console.log(v1);
  //   console.log(v2);
  var strsensordt = Date.parse(v1);
  var strlastupdated = Date.parse(v2);
  var sensordt = new Date(strsensordt);
  var lastupdated = new Date(strlastupdated);
  var dp = new Date(lastupdated.getTime() + 5000);
  var dm = new Date(lastupdated.getTime() - 5000);
  //   console.log(dp);
  //   console.log(dm);
  if (sensordt < dp && sensordt > dm) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

//https://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
hbs.handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case '===':
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case '!=':
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case '!==':
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case '<':
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case '<=':
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case '>':
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case '>=':
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case '&&':
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case '||':
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

const sockserver = new WebSocketServer({ port: 80 });
async function SetupWebSocket() {
  const rows = await db.getSettings();
  console.log('--SetupWebSocket---');
  //console.log(rows);
  if (rows === undefined) {
    //sockserver.close();
    return false;
  }

  sockserver.on('connection', (ws, req) => {
    console.log('New client connected!');
    //var rf = { refresh: true };
    //ws.send(JSON.stringify(rf));
    ws.send('connection established');
    ws.on('close', () => console.log('Client has disconnected!'));
    ws.on('message', (data) => {
      console.log(`Client in setup Count: ${sockserver.clients.size}`);
      sockserver.clients.forEach(async (client) => {
        console.log(`distributing SEND: ${req.socket.remoteAddress}`);
        //client.send(`${data}`);
        //Could user SQL to grab the groups and compare the data is 1 of the groups before proceeding.
        var theirip = req.socket.remoteAddress;
        var cip = client._socket.remoteAddress;
        if (
          theirip.toString().replace('::ffff:', '') !==
          cip.toString().replace('::ffff:', '')
        ) {
          return;
        }

        const result = await db.getBasedonGrouo(data.toString());

        console.log(`data : ${data.toString()}`);
        //console.log(result);
        if (result && result.length > 0) {
          // get group here and add <group.tolower()>.hbs for the file read!
          const filePath = path.join(
            __dirname,
            `/views/templates/${data.toString().toLocaleLowerCase()}.hbs`
          );
          //console.log(filePath);
          if (!fs.existsSync(filePath)) {
            return;
          }
          const source = fs.readFileSync(filePath, 'utf-8').toString();
          //console.log(source);
          const hbs = handlebars.create();
          const template = hbs.handlebars.compile(source); //NO handlebars.engine.compile(source);

          const now = new Date();
          var mm = '0' + now.getMonth() + 1;
          mm = mm.slice(-2);
          var s = '0' + now.getSeconds();
          s = s.slice(-2);

          var datetime = '';
          datetime = datetime.concat(
            ('0' + (now.getMonth() + 1)).slice(-2),
            '/',
            ('0' + now.getDate()).slice(-2),
            '/',
            now.getFullYear().toString(),
            ' ',
            ('0' + now.getHours()).slice(-2),
            ':',
            ('0' + now.getMinutes()).slice(-2),
            ':',
            ('0' + now.getSeconds()).slice(-2)
          );
          const replacements = {
            group: result[0].group,
            updateddate: datetime,
            topics: result,
          };
          const htmlToSend = template(replacements);
          client.send(htmlToSend);
          //console.log(`distributing message: ${client._socket.remoteAddress} `);
          // console.log(htmlToSend);
          // sockserver.clients.forEach((client) => {
          //   console.log(`distributing message: ${client._socket.remoteAddress} `);
          //   // client.send(JSON.stringify(result));
          //   client.send(htmlToSend);
          // });
          //ws.send("MQTT:New message");
        }
      });
    });
    ws.onerror = function () {
      console.log('websocket error');
    };
  });
}

async function SetupMQTT() {
  //const client = mqtt.connect(`mqtt://${cSettings.mip}`,{username:`${cSettings.mid}`,password:`${cSettings.mpw}`})  // create a client
  //Get settings.  mqtt.connect using settings, then when mqtt is connected, subscrivbe to topics.  All in one pass.

  const rows = await db.getSettings();
  if (rows === undefined || WSRunning == false) {
    return false;
  }

  // console.log('-----');
  // console.log(rows);
  if (rows !== undefined) {
    // console.log(row);
    //console.log(rows[0].topics_json);
    var topics_json = JSON.parse(rows.topics_json);
    cSettings = new clsSettings(
      rows.mqtt_ip,
      rows.mqtt_id,
      rows.mqtt_pw,
      topics_json
    );
    console.log('inside');
    console.log(cSettings.mip);
    client = mqtt
      .connect(`mqtt://${cSettings.mip}`, {
        username: `${cSettings.mid}`,
        password: `${cSettings.mpw}`,
        reconnectPeriod: 1000,
      })
      .on('connect', () => {
        console.log('CONNECTED TO MQTT');
        for (var i in topics_json) {
          const tpc = topics_json[i];
          //console.log(tpc.topic);
          client.subscribe(tpc.topic, (err, granted) => {
            if (err) {
              console.log(err);
            }
            console.log(granted);
          });
        }
      })
      .on('message', async (topic, message) => {
        // message is Buffer
        dataupdated = true;
        console.log(
          `topic=> ${topic.toString()} < message=> ${message.toString()} <`
        );
        var data = {
          topic: topic.toString(),
          message: message.toString(),
        };
        db.Add_Topic(data.topic, data.message);
        const result = await db.getBasedonTopic(data.topic);

        //console.log(result);
        // get group here and add <group.tolower()>.hbs for the file read!
        const filePath = path.join(
          __dirname,
          `/views/templates/${result[0].group
            .toString()
            .toLocaleLowerCase()}.hbs`
        );
        if (!fs.existsSync(filePath)) {
          return;
        }
        //C:\Users\treya\Documents\Dev\HAExpress\views\templates
        //C:\Users\treya\Documents\Dev\HAExpress\templates\temperature.hbs
        //console.log(filePath);
        const source = fs.readFileSync(filePath, 'utf-8').toString();
        //console.log(source);
        const hbs = handlebars.create();
        //const template = hbs.compile(source);
        const template = hbs.handlebars.compile(source); //NO handlebars.engine.compile(source);
        const now = new Date();
        var mm = '0' + now.getMonth() + 1;
        mm = mm.slice(-2);
        var s = '0' + now.getSeconds();
        s = s.slice(-2);

        var datetime = '';
        datetime = datetime.concat(
          ('0' + (now.getMonth() + 1)).slice(-2),
          '/',
          ('0' + now.getDate()).slice(-2),
          '/',
          now.getFullYear().toString(),
          ' ',
          ('0' + now.getHours()).slice(-2),
          ':',
          ('0' + now.getMinutes()).slice(-2),
          ':',
          ('0' + now.getSeconds()).slice(-2)
        );
        const replacements = {
          group: result[0].group,
          updateddate: datetime,
          topics: result,
        };
        const htmlToSend = template(replacements);

        // console.log(htmlToSend);
        sockserver.clients.forEach((client) => {
          //console.log(`distributing message: ${JSON.stringify(client)} `);
          // client.send(JSON.stringify(result));

          client.send(htmlToSend);
        });
      });
    return true;
  }
}

app.get('/', async (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  const settings = await db.getSettings();
  if (settings == undefined) {
    res.redirect('/setup');
    return;
  }
  const result = await db.getGroups();
  console.log('app.get(/');
  //console.log(result);
  // result.forEach((result) => {
  //   console.log(result.value);
  // });
  //How to send a dynamic array of TestArray?
  res.render('main', {
    layout: 'index',
    Groups: JSON.stringify(result),
  });
});

//USE THIS FOR A HEALTH CHECK.  AJAX/FETCH check to refresh the site.
//is response is NOT OK.  set global var const doRefresh = false;   to true.
//THen when hc responds, reload the screen.
// app.get('/hc', (req, res) => {
//   return res.send('OK');
// });

app.get('/setup/', (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  //console.log(req);
  //console.dir(req.originalUrl); // '/admin/new?a=b' (WARNING: beware query string)
  //console.dir(req.baseUrl); // '/admin'
  //console.log(req.path); // '/new'
  //console.dir(req.baseUrl + req.path); // '/admin/new' (full path without query string)
  //console.log(req.app.get('web3'));
  var mRunning = req.app.get('MQTTRunning');
  console.log(`mqtt running: ${mRunning}`);
  res.render('setmain', {
    layout: 'setup',
    //setter: 'this is the setup page',
    mqttstatus: `mqtt active status = ${mRunning.toString()}`,
  });
});

/* //not being used
 app.get('/setup/AT', (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  var sql = datalayer.SQL_Get_All_Topics;
  var params = [];
  console.log('GO');
  datalayer.db.all(sql, params, function (err, result) {
    if (err) {
      console.log('error' + err.message);
      return;
    }
    //console.log(result);
    // result.forEach((result) => {
    //   console.log(result);
    // });
    //How to send a dynamic array of TestArray?
    res.send(JSON.stringify(result));
  });
}); */
//The Setup Page pulls the data from here.
app.get('/data', async (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  //console.log(req.url);
  // console.dir(req.originalUrl); // '/admin/new?a=b' (WARNING: beware query string)
  // console.dir(req.baseUrl); // '/admin'
  // console.log(req.path); // '/new'
  // console.dir(req.baseUrl + req.path); // '/admin/new' (full path without query string)
  const settings = await db.getSettings();
  const result = await db.getAllTopics();
  console.log('app.get(/data');
  var mtdata = { setting: settings, topic: result };
  // console.log('---mtdata----');
  // console.log(mtdata);
  // console.log('----mtdata---');
  // result.forEach((result) => {
  //   console.log(result.topic);
  // });
  //How to send a dynamic array of TestArray?
  res.send(JSON.stringify(mtdata));
});
//the setup posts the settings and  topics data here
app.post('/mtsettings', async (req, res) => {
  console.log('-----------');
  //console.log(req.body);
  var jsonsetting = req.body;

  // console.log(jsonsetting.setting.mqtt_ip);
  db.setSettings(
    jsonsetting.setting.mqtt_ip.toString(),
    jsonsetting.setting.mqtt_id.toString(),
    jsonsetting.setting.mqtt_pw.toString(),
    JSON.stringify(jsonsetting.topic)
  );
  console.log('-----------');
  res.send(req.body);
  //sockserver.terminate();//close();
  if (client !== undefined) {
    console.log(`Clien Count: ${sockserver.clients.size}`);
    sockserver.clients.forEach((client) => {
      client.terminate();
      client.close();
    });
    client.end(false, async () => {
      //StartWSMQTT();
      MQTTRunning = await SetupMQTT();
      //console.log(`mqtt I running: ${MQTTRunning}`);
      app.set('MQTTRunning', MQTTRunning);
    });
  }
  // sockserver.clients.forEach((client) => {
  //   //console.log(`distributing message: ${JSON.stringify(client)} `);
  //   // client.send(JSON.stringify(result));
  //   var rf = { refresh: true };
  //   client.send(JSON.stringify(rf));
  // });
});

/* app.get('/door', (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  //res.render("main", { layout: "index", doors: "DOOORABLE" });
  //console.log(req);
  if (dataupdated == true) {
    res.send(dataupdated);
    dataupdated = false;
  } else {
    res.send(dataupdated);
  }
}); */
/////////////
// When the topic group is sent, set a timer on the JS page to request groups.
//When the groups come in from a Fetch.  Compare with the array in dooring.  If they dont match.  location.reload.
app.get('/gp', (req, res) => {
  let groups = db.getGroups();
  res.send(JSON.stringify(groups));
});
/* app.get('/users', (req, res) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'myapp'
    });
  
    connection.query('SELECT * FROM users', (error, results, fields) => {
      if (error) throw error;
      res.render('users', { users: results });
    });
  }); */
// app.use("/", function (req, res) {
//   res.sendFile(path.join(__dirname + "/express/index.html"));
//   //__dirname : It will resolve to your project folder.
// });

//app.set("view engine", "hbs"); //instead of app.engine('handlebars', handlebars({

//console.log(`mqtt root running: ${MQTTRunning}`);
const StartWSMQTT = async function () {
  WSRunning = await SetupWebSocket();
  MQTTRunning = await SetupMQTT();
  //console.log(`mqtt I running: ${MQTTRunning}`);
  app.set('MQTTRunning', MQTTRunning);
};

StartWSMQTT();

const server = http.createServer(app);
const port = 3000;
server.listen(port);
console.debug('Server listening on port ' + port);
