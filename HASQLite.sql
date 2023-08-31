WITH topics AS
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
WHERE json_extract(value, '$.topic') = 'home/randomroom/temp')
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
 inner join PDAY P on P.topic = T.topic
 inner join PPDAY PP on PP.topic = T.topic
 inner join PPPDAY PPP on PPP.topic = T.topic
order by CAST(T.'order' AS INTEGER)