const Database = require('better-sqlite3');
//const DBSOURCE = 'db.sqlite';
class Dbase {
  constructor(dbFilePath) {
    this.db = new Database(dbFilePath);

    this.createSettings();
    this.createMQTT();
  }

  createSettings() {
    const sql = `CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mqtt_ip VARCHAR(15),
      mqtt_id VARCHAR(50),
      mqtt_pw VARCHAR(50),
      topics_json text
      )`;
    this.db.exec(sql);
  }

  createMQTT() {
    const sql = `CREATE TABLE IF NOT EXISTS mqtt (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic text, 
      message text, 
      date text DATETIME DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')))`;
    this.db.exec(sql);
  }

  Add_Topic(topic, message) {
    var sql = 'INSERT INTO mqtt (topic, message) VALUES (?,?)';
    this.db.prepare(sql).run(topic, message);
  }

  getSettings() {
    const sql = 'select mqtt_ip, mqtt_id, mqtt_pw, topics_json from settings';
    return this.db.prepare(sql).get();
  }

  setSettings(mqttId, mqttPw, mqttIp, topics_json) {
    const sql = `
    REPLACE INTO settings(id, mqtt_ip, mqtt_id, mqtt_pw, topics_json )
      VALUES(?, ?, ?, ?, ?)`;
    this.db.prepare(sql).run(1, mqttId, mqttPw, mqttIp, topics_json);
  }

  getBasedonGrouo(group) {
    const sql = `WITH topics AS
      (
      SELECT
      distinct
      json_extract(value, '$.topic') as topic
      ,json_extract(value, '$.group') as  'group'
      ,json_extract(value, '$.label') as  'label'
      ,json_extract(value, '$.order') as  'order'
      FROM
      settings, 
      json_each(settings.topics_json)
      WHERE json_extract(value, '$.group') = ?
      order by 'order' 
      ),
      ppmxdate as (
      select T.Topic, MAX(mqtt.date) as date from mqtt inner join topics as T on T.topic = mqtt.topic
      inner join pmxdate as MX on MX.topic = mqtt.topic
      where mqtt.date < MX.date
      group by T.topic
      ),
      pmxdate as (
      select T.Topic, MAX(mqtt.date) as date from mqtt inner join topics as T on T.topic = mqtt.topic
      inner join mxdate as MX on MX.topic = mqtt.topic
      where mqtt.date < MX.date
      group by T.topic
      ),
      mxdate as (
      select T.Topic, MAX(date) as date from mqtt inner join topics as T on T.topic = mqtt.topic
      group by T.topic
      ),
      prevprevprevmessages as 
      (
      select T.topic,  MAX(mqtt.date) as date from mqtt  
      inner join topics as T on T.topic = mqtt.topic
      inner join ppmxdate as MX on MX.topic = mqtt.topic
      where mqtt.date < MX.date
      
      group by T.topic
      ),
      prevprevmessages as 
      (
      select T.topic,  MAX(mqtt.date) as date from mqtt  
      inner join topics as T on T.topic = mqtt.topic
      inner join pmxdate as MX on MX.topic = mqtt.topic
      where mqtt.date < MX.date
      
      group by T.topic
      ),
      prevmessages as 
      (
      select T.topic,  MAX(mqtt.date) as date from mqtt  
      inner join topics as T on T.topic = mqtt.topic
      inner join mxdate as MX on MX.topic = mqtt.topic
      where mqtt.date < MX.date
      
      group by T.topic
      )
      ,messages as 
      (
      select T.topic,  MAX(mqtt.date) as date from mqtt  
      inner join topics as T on T.topic = mqtt.topic
      group by T.topic
      ),
      TDAY as
      (
      Select T.topic, M.message,STRFTIME('%m/%d/%Y %H:%M:%S', M2.date,'localtime') as date,T.'group',T.'label',T.'order' from topics as T inner join mqtt as M on M.topic = T.topic
      inner join messages as M2 on M2.date = M.date
      order by CAST(t.'order' AS INTEGER)
      )
      ,
      PDAY as
      (
      -- datetime(M2.date,'localtime') as date,, M2.date as UTCDATE, STRFTIME('%m/%d/%Y %H:%M:%f', M2.date,'localtime') --ms
      Select T.topic, M.message,STRFTIME('%m/%d/%Y %H:%M:%S', M2.date,'localtime') as date,T.'group',T.'label'  from topics as T inner join mqtt as M on M.topic = T.topic
      inner join prevmessages as M2 on M2.date = M.date
      ),
      PPDAY as
      (
      -- datetime(M2.date,'localtime') as date,, M2.date as UTCDATE, STRFTIME('%m/%d/%Y %H:%M:%f', M2.date,'localtime') --ms
      Select T.topic, M.message,STRFTIME('%m/%d/%Y %H:%M:%S', M2.date,'localtime') as date,T.'group',T.'label'  from topics as T inner join mqtt as M on M.topic = T.topic
      inner join prevprevmessages as M2 on M2.date = M.date
      ),
      PPPDAY as
      (
      -- datetime(M2.date,'localtime') as date,, M2.date as UTCDATE, STRFTIME('%m/%d/%Y %H:%M:%f', M2.date,'localtime') --ms
      Select T.topic, M.message,STRFTIME('%m/%d/%Y %H:%M:%S', M2.date,'localtime') as date,T.'group',T.'label'  from topics as T inner join mqtt as M on M.topic = T.topic
      inner join prevprevprevmessages as M2 on M2.date = M.date
      )
      select T.topic, T.message, T.date,P.message as pmessage, P.date as pdate,PP.message as ppmessage, PP.date as ppdate,PPP.message as pppmessage, PPP.date as pppdate,T.'group',T.'label' from  TDAY as T
      left join PDAY P on P.topic = T.topic
      left join PPDAY PP on PP.topic = T.topic
      left join PPPDAY PPP on PPP.topic = T.topic
      order by CAST(T.'order' AS INTEGER)`;
    return this.db.prepare(sql).all(group);
  }

  getBasedonTopic(topic) {
    const sql = `WITH topics AS
    (
    SELECT
    distinct
     json_extract(value, '$.topic') as topic
     ,json_extract(value, '$.group') as  'group'
     ,json_extract(value, '$.label') as  'label'
     ,json_extract(value, '$.order') as  'order'
    FROM
    settings, 
    json_each(settings.topics_json)
    WHERE json_extract(value, '$.group') = (SELECT
    
     json_extract(value, '$.group') as  'group'
    FROM
    settings, 
    json_each(settings.topics_json)
    WHERE json_extract(value, '$.topic') = ?)
    order by 'order' 
    ),
    ppmxdate as (
    select T.Topic, MAX(mqtt.date) as date from mqtt inner join topics as T on T.topic = mqtt.topic
    inner join pmxdate as MX on MX.topic = mqtt.topic
    where mqtt.date < MX.date
    group by T.topic
    ),
    pmxdate as (
    select T.Topic, MAX(mqtt.date) as date from mqtt inner join topics as T on T.topic = mqtt.topic
    inner join mxdate as MX on MX.topic = mqtt.topic
    where mqtt.date < MX.date
    group by T.topic
    ),
    mxdate as (
    select T.Topic, MAX(date) as date from mqtt inner join topics as T on T.topic = mqtt.topic
    group by T.topic
    ),
    prevprevprevmessages as 
    (
    select T.topic,  MAX(mqtt.date) as date from mqtt  
    inner join topics as T on T.topic = mqtt.topic
    inner join ppmxdate as MX on MX.topic = mqtt.topic
    where mqtt.date < MX.date
    
    group by T.topic
    ),
    prevprevmessages as 
    (
    select T.topic,  MAX(mqtt.date) as date from mqtt  
    inner join topics as T on T.topic = mqtt.topic
    inner join pmxdate as MX on MX.topic = mqtt.topic
    where mqtt.date < MX.date
    
    group by T.topic
    ),
    prevmessages as 
    (
    select T.topic,  MAX(mqtt.date) as date from mqtt  
    inner join topics as T on T.topic = mqtt.topic
    inner join mxdate as MX on MX.topic = mqtt.topic
    where mqtt.date < MX.date
    
    group by T.topic
    )
    ,messages as 
    (
    select T.topic,  MAX(mqtt.date) as date from mqtt  
    inner join topics as T on T.topic = mqtt.topic
    group by T.topic
    ),
    TDAY as
    (
    Select T.topic, M.message,STRFTIME('%m/%d/%Y %H:%M:%S', M2.date,'localtime') as date,T.'group',T.'label',T.'order' from topics as T inner join mqtt as M on M.topic = T.topic
    inner join messages as M2 on M2.date = M.date
    order by CAST(t.'order' AS INTEGER)
    )
    ,
    PDAY as
    (
    -- datetime(M2.date,'localtime') as date,, M2.date as UTCDATE, STRFTIME('%m/%d/%Y %H:%M:%f', M2.date,'localtime') --ms
    Select T.topic, M.message,STRFTIME('%m/%d/%Y %H:%M:%S', M2.date,'localtime') as date,T.'group',T.'label'  from topics as T inner join mqtt as M on M.topic = T.topic
    inner join prevmessages as M2 on M2.date = M.date
    ),
    PPDAY as
    (
    -- datetime(M2.date,'localtime') as date,, M2.date as UTCDATE, STRFTIME('%m/%d/%Y %H:%M:%f', M2.date,'localtime') --ms
    Select T.topic, M.message,STRFTIME('%m/%d/%Y %H:%M:%S', M2.date,'localtime') as date,T.'group',T.'label'  from topics as T inner join mqtt as M on M.topic = T.topic
    inner join prevprevmessages as M2 on M2.date = M.date
    ),
    PPPDAY as
    (
    -- datetime(M2.date,'localtime') as date,, M2.date as UTCDATE, STRFTIME('%m/%d/%Y %H:%M:%f', M2.date,'localtime') --ms
    Select T.topic, M.message,STRFTIME('%m/%d/%Y %H:%M:%S', M2.date,'localtime') as date,T.'group',T.'label'  from topics as T inner join mqtt as M on M.topic = T.topic
    inner join prevprevprevmessages as M2 on M2.date = M.date
    )
    select T.topic, T.message, T.date,P.message as pmessage, P.date as pdate,PP.message as ppmessage, PP.date as ppdate,PPP.message as pppmessage, PPP.date as pppdate,T.'group',T.'label' from  TDAY as T
     left join PDAY P on P.topic = T.topic
     left join PPDAY PP on PP.topic = T.topic
     left join PPPDAY PPP on PPP.topic = T.topic
    order by CAST(T.'order' AS INTEGER)`;
    return this.db.prepare(sql).all(topic);
  }
  getGroups() {
    var sql = `select distinct value from settings,json_tree(settings.topics_json, '$')  as Topics where Topics.key = 'group' order by value`;
    return this.db.prepare(sql).all();
  }
  getAllTopics() {
    const sql = `SELECT json_extract(x.value, '$.topic') as 'topic'
    , json_extract(x.value, '$.query') as 'query'
    , json_extract(x.value, '$.label') as 'label'
    , json_extract(x.value, '$.group') as 'group'
    , json_extract(x.value, '$.order') as 'order'
    FROM settings, json_each(topics_json) AS x
    order by json_extract(x.value, '$.group') ,  CAST(json_extract(x.value, '$.order') AS INTEGER)`;
    return this.db.prepare(sql).all();
  }
  getDetailsbyTopic(topic) {
    const sql = `
    WITH tgroup AS
    (
    SELECT
    json_extract(value, '$.topic') as topic,
    json_extract(value, '$.group') as  'group'
    FROM
    settings, 
    json_each(settings.topics_json)
    WHERE json_extract(value, '$.topic') = ?
    )
    select m.id,m.topic, m.message, STRFTIME('%m/%d/%Y %H:%M:%S', m.date,'localtime') as date,g.'group' from mqtt m
    inner join tgroup g on g.topic = m.topic  order by m.date desc LIMIT 100
    `;
    return this.db.prepare(sql).all(topic);
  }
  getGrouplist(group) {
    const sql = `
    SELECT
    distinct
    json_extract(value, '$.topic') as topic
    ,json_extract(value, '$.group') as  'group'
    ,json_extract(value, '$.label') as  'label'
    ,json_extract(value, '$.order') as  'order'
    FROM
    settings, 
    json_each(settings.topics_json)
    WHERE json_extract(value, '$.group') = ?
    order by 'order'`;
    return this.db.prepare(sql).all(group);
  }
}

module.exports = Dbase;
