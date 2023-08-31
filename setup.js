/* import {
  // DataTable,
  exportJSON,
  //exportCSV,
  //exportTXT,
  //exportSQL,
} from 'https://cdn.jsdelivr.net/npm/simple-datatables@latest'; //'simple-datatables';
 */

document.addEventListener('DOMContentLoaded', function () {
  console.log('loaded');
  document
    .getElementById('btnCancel')
    .addEventListener('click', CancelTopic, false);
  document
    .getElementById('btnAddUpdate')
    .addEventListener('click', SaveTopic, false);
  document
    .getElementById('btnSaveAll')
    .addEventListener('click', SaveAllSettings, false);
  //   document
  //     .getElementById('txtOrder')
  //     .addEventListener('keyup', CheckGroups, false);
  document
    .getElementById('txtGroup')
    .addEventListener('keyup', SearchGroups, false);
  //new window.simpleDatatables.DataTable("#myTable")
  let table;
  //https://github.com/fiduswriter/simple-datatables/issues/254
  //data[0].data
  const renderFunction = function (data, cell, row) {
    //console.log(`${data} : ${cell}  : ${row}`);
    if (data === undefined) return '';
    return (
      (' ' + data[0].data).slice(-2) +
      " <button class='clsDelete addclick' type='button' data-row='" +
      row +
      "'>Delete</button>"
    );
  };
  //onclick='return ConfirmDelete(this);'
  table = new window.simpleDatatables.DataTable('.table', {
    data: {
      headings: ['Topic', 'Query', 'Label', 'Group', 'Order'],
      //headings: Object.keys(data[0]),
      //data: data.topic.map((item) => Object.values(item)),
    },
    rowRender: (row, tr, _index) => {
      if (!row.selected) {
        return;
      }
      if (!tr.attributes) {
        tr.attributes = {};
      }
      if (!tr.attributes.class) {
        tr.attributes.class = 'selected';
      } else {
        tr.attributes.class += ' selected';
      }
      return tr;
    },
    perPage: 25,
    columns: [
      {
        select: 4,
        render: renderFunction, //(value, _td, _rowIndex, _cellIndex) =>
        //`${value}<span class="checkbox">${value ? '☑' : '☐'}</span>`,
        // render: function (data, td, rowIndex, cellIndex) {
        //   console.log('------------');
        //   console.log(data);
        //   console.log(td.childNodes[0].data);
        //   console.log(rowIndex);
        //   console.log(cellIndex);
        //   console.log('------------');
        //   return `${data[0].data}<button type='button' data-row='${rowIndex}'>Select</button>`;
        // },
      },
    ],
  });
  table.on('datatable.sort', function (column, direction) {
    CancelTopic();
  });
  table.on('datatable.selectrow', (rowIndex, event) => {
    event.preventDefault();
    if (isNaN(rowIndex)) return;
    console.log(rowIndex);
    const row = table.data.data[rowIndex];
    //console.log(event.srcElement);
    if (event.srcElement.classList.contains('clsDelete')) {
      // console.log(event);
      //CancelTopic();
      return;
    }
    UpdateTopic(rowIndex);
    if (row.selected) {
      row.selected = false;
      CancelTopic();
    } else {
      table.data.data.forEach((data) => {
        data.selected = false;
      });
      row.selected = true;
    }

    table.update();
    // console.log(row[1].text);
    // document.getElementById('txtTopic').value = row[0].text;
    // document.getElementById('txtQuery').value = row[1].text;
    // document.getElementById('txtLabel').value = row[2].text;
    // document.getElementById('txtGroup').value = row[3].text;
    // document.getElementById('txtOrder').value = row[4].text;
    // document.getElementById('ri').value = rowIndex;
    // console.log(row.length);
    // console.log(row);
    // Array.from(row.children).forEach(function (col, index) {
    //   var value = col.innerHTML.trim().toLowerCase();
    //   console.log(value);
    //   console.log(col);
    //   console.log(index);
    // });
    // let sch = table.search('Temperature');
    // const trs = document.getElementById('myTable').querySelectorAll('tr');
    // console.log(trs);
    // let search = row[3].text; //.toLowerCase();
    // trs.forEach((tr) => {
    //   // Get all cells in a row
    //   let tds = tr.querySelectorAll('td');
    //   console.log(tds);
    //   var index = [].indexOf.call(tds, search);
    //   console.log(index);
    //   console.log(tr.children);
    //   Array.from(tr.children).forEach(function (col, index) {
    //     var value = col.innerHTML.trim().toLowerCase();
    //     console.log(value);
    //     console.log(col);
    //     console.log(index);
    //   });
    //   // String that contains all td textContent from a row
    //   //   let str = Array.from(tds)
    //   //     .map((td) => {
    //   //       return td.textContent.toLowerCase();
    //   //     })
    //   //     .join('');
    //   //   console.log(str);
    //   //   tr.style.display = str.indexOf(search) > -1 ? 'table-row' : 'none';
    // });
    // for (let tr in trs) {
    //   console.log(tr.getElementsByTagName('td')[0]);
    // }

    /*         document.getElementById('search').onkeyup = (e) => {
      for (const tr of trs)
        tr.style.display = tr.innerText
          .toLowerCase()
          .includes(e.target.value.toLowerCase())
          ? ''
          : 'none';
    }; */

    //const data = [].slice.call(row).map(cell => cell.data);
    // console.log(data);
    //message = message.join("")
    //message = `${message}\n\nThe row data is:\n${JSON.stringify(data)}`
    //alert(message)
    // rows.updateRow(index, cols)
    // let rows = table.rows;
    // console.log(rows);
    // works table.rows.remove(rowIndex);

    //table.insert({id: 1, name: 'Edward K.', country: 'UK', city: 'London'});
    //let newRow = ["column1", "column2", "column3", "column4","c5"];
    //table.rows.add(newRow);
    //table.rows.updateRow(rowIndex,newRow);
    //rows.remove(rowIndex);  //works
  });
  //   table.on('datatable.init', () => {
  //     document.querySelectorAll('.clsDelete addclick').forEach((el) => {
  //       //console.log(el);
  //       el.addEventListener(
  //         'click',
  //         function (event) {
  //           if (confirm('Delete row?')) {
  //             var rowIndex = event.target.getAttribute('data-row');
  //             console.log(`delete: ${rowIndex}`);
  //             table.rows.remove(parseInt(rowIndex));
  //             //table.update();
  //             CancelTopic();
  //           }
  //         },
  //         false
  //       );
  //     });
  //   });
  table.on('datatable.search', function (query, matched) {
    console.log('matched');
    console.log(matched);
    // console.log(table.rows);
    // matched.forEach((m) => {
    //   console.log('matched');
    //   console.log(table.data.data[m]);
    // });
    //
  });
  table.on('datatable.update', () => {
    // console.log('update called');
    document.querySelectorAll('.addclick').forEach((el) => {
      //console.log(el);
      el.classList.remove('addclick');
      el.addEventListener(
        'click',
        function (event) {
          if (confirm('Delete row?')) {
            var rowIndex = event.target.getAttribute('data-row');
            console.log(`delete: ${rowIndex}`);
            table.rows.remove(parseInt(rowIndex));
            //table.update();
            CancelTopic();
          }
        },
        false
      );
    });
  });
  fetch('/data?setup.json')
    .then((response) => response.json())
    .then((data) => {
      if (!data.topic.length) {
        return;
      }
      // console.log(data);
      // console.log(data.topic.length);
      document.getElementById('txtMqttip').value = data.setting.mqtt_ip;
      document.getElementById('txtMqttid').value = data.setting.mqtt_id;
      document.getElementById('txtMqttpw').value = data.setting.mqtt_pw;

      //  console.log('there');
      //  console.log(data.setting);
      //  console.log(Object.keys(data.topic[0]));
      // data.topic.map((item) => Object.values(item));
      let newdata = data.topic.map((item) => Object.values(item));
      // console.log(newdata);
      let sh = [];
      let wtjson = JSON.stringify(data.topic);
      // console.log(wtjson);
      let myjson = JSON.parse(wtjson);
      //console.log(myjson);
      //   myjson.foreach((r) => {
      //     sh.push(r);
      //   });
      for (let i = 0; i < myjson.length; i++) {
        let topic = myjson[i];
        let newRow = [
          topic.topic,
          topic.query,
          topic.label,
          topic.group,
          topic.order,
        ];
        table.rows.add(newRow);
        //  console.log(topic.topic);
      }
    });
  function ConfirmDelete(event) {
    if (confirm('Delete row?')) {
      var rowIndex = event.target.getAttribute('data-row');

      console.log(`delete: ${rowIndex}`);
      table.rows.remove(parseInt(rowIndex));
      //table.update();
      CancelTopic();
    }
  }
  function SaveTopic() {
    console.log('SaveTopic');
    let rowIndex = parseInt(document.getElementById('ri').value);
    console.log(`SaveTopic: ${rowIndex}`);
    if (document.getElementById('txtTopic').value === '') {
      console.log('NO DATA');
      return;
    }
    let newRow = [
      document.getElementById('txtTopic').value,
      document.getElementById('txtQuery').value,
      document.getElementById('txtLabel').value,
      document.getElementById('txtGroup').value,
      document.getElementById('txtOrder').value,
    ];
    console.log(newRow);

    //table.rows.add(newRow);

    if (isNaN(rowIndex)) {
      table.rows.add(newRow);
    } else {
      table.rows.updateRow(rowIndex, newRow);
    }
    table.update();
    CancelTopic();
    document.querySelectorAll('.addclick').forEach((el) => {
      //console.log(el);
      el.classList.remove('addclick');
      el.addEventListener(
        'click',
        function (event) {
          if (confirm('Delete row?')) {
            var rowIndex = event.target.getAttribute('data-row');

            console.log(`delete: ${rowIndex}`);
            table.rows.remove(parseInt(rowIndex));
            //table.update();
            CancelTopic();
          }
        },
        false
      );
    });
    //document.getElementById('ri').value = rowIndex;
  }
  function UpdateTopic(rowIndex) {
    console.log('UpdateTopic');
    if (isNaN(rowIndex)) return;
    const row = table.data.data[rowIndex];
    console.log(row[1].text);
    document.getElementById('txtTopic').value = row[0].text;
    document.getElementById('txtQuery').value = row[1].text;
    document.getElementById('txtLabel').value = row[2].text;
    document.getElementById('txtGroup').value = row[3].text;
    document.getElementById('txtOrder').value = row[4].text;
    document.getElementById('ri').value = rowIndex;
    table.search(document.getElementById('txtGroup').value, [3]);
    // console.log(row.length);
    // console.log(row);
    // console.log('UpdateTopic');
    document.getElementById('btnAddUpdate').textContent = 'Update';
    // let columns = table.columns;
    // console.log(columns);
    // columns.hide([1]);
    // columns.settings[0].sortable = false;
    // table.update();
    let settings = table.columns.settings;
    settings.forEach((s) => {
      s.sortable = false;
    });
    table.update();
  }
  function showMessage(message, color) {
    //document.getElementById('pnlMessage').
    document.getElementById('txtMessage').textContent =
      'You cannot do that dave.';
  }
  function CancelTopic() {
    document.getElementById('txtTopic').value = '';
    document.getElementById('txtQuery').value = '';
    document.getElementById('txtLabel').value = '';
    document.getElementById('txtGroup').value = '';
    document.getElementById('txtOrder').value = '';
    document.getElementById('ri').value = '';
    document.getElementById('btnAddUpdate').textContent = 'Add';
    table.search('', [3]);
    table.data.data.forEach((data) => {
      data.selected = false;
    });
    let settings = table.columns.settings;
    settings.forEach((s) => {
      s.sortable = true;
    });
    table.update();
  }
  function SaveAllSettings() {
    showMessage('no data', 'blue');
    // if (!table.hasRows) {
    //   console.log('No saving without data.');
    // }
    console.log(table.data.headings[0].data);

    const row = table.data.data;
    console.log(row);
    var myjson = [];
    var objarr = {};
    table.data.data.forEach((r) => {
      var i = 0;
      objarr = {};
      r.forEach((c) => {
        objarr[table.data.headings[i].data.toLowerCase()] = c.text;
        i += 1;
        //console.log(c.text);
      });
      myjson.push(objarr);
    });
    console.log('jparse');
    console.log(myjson);
    // var wtf = JSON.stringify(myjson);
    // console.log(wtf);
    // console.log(JSON.parse(wtf));
    //    document.getElementById('txtMqttip').value
    //  document.getElementById('txtMqttid').value
    //document.getElementById('txtMqttpw').value
    var settings = {
      mqtt_ip: document.getElementById('txtMqttip').value,
      mqtt_id: document.getElementById('txtMqttid').value,
      mqtt_pw: document.getElementById('txtMqttpw').value,
    };

    //console.log(table);

    // console.log(
    //   exportJSON(table, {
    //     download: true,
    //     space: 3,
    //   })
    // );

    var mtdata = { setting: settings, topic: myjson };
    fetch('/mtsettings', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mtdata),
    })
      .then((res) => res.json())
      .then((res) => console.log(res));
    console.log(mtdata);
  }
  /*
const rows = dataTable.rows()

// find row with string in first td
const {index, cols} = rows.findRow(0, '144')
// index = 1
// cols = ['144', 'Mary', '21']

// change td
cols[1] = 'Susan'

// update row in data table
rows.updateRow(index, cols)
*/
  function CheckGroups() {
    let data = [
      { FirstName: 'John', LastName: 'Doe', DOB: '1980-01-01', ORDERBY: 1 },
      { FirstName: 'Jane', LastName: 'Doe', DOB: '1982-03-15', ORDERBY: 2 },
      { FirstName: 'Jim', LastName: 'Smith', DOB: '1979-11-30', ORDERBY: 3 },
      { FirstName: 'Jill', LastName: 'Jones', DOB: '1981-05-23', ORDERBY: 4 },
    ];
    console.log(data);
    // Insert new item at index 2
    data.splice(2, 0, {
      FirstName: 'Jack',
      LastName: 'Johnson',
      DOB: '1984-07-08',
      ORDERBY: 3,
    });
    console.log(data);

    // Update ORDERBY property of items after inserted item
    for (let i = 3; i < data.length; i++) {
      data[i].ORDERBY++;
    }
    // console.log(data);
    // // Remove item at index 1
    // let removed = data.splice(1, 1)[0];
    // console.log(data);
    // // Update ORDERBY after removed item
    // for (let i = 1; i < data.length; i++) {
    //   data[i].ORDERBY--;
    // }
    console.log(data);
    console.log('QUESTION THE REORDER!!!');
    var Group = document.getElementById('txtGroup').value;
    var Order = document.getElementById('txtOrder').value;
    console.log(Group);
    const row = table.data.data;
    const dtrows = table.rows;
    console.log(dtrows);
    console.log('dtrows');
    console.log(dtrows.findRow(3, Group));
    // const allRows = table.data.data.slice();
    // console.log('allRows');
    // console.log(allRows);
    // table.search('Temperature', [3]);
    var myjson = [];
    var objarr = {};
    const { index, cols } = dtrows.findRow(3, Group);
    console.log(index);
    console.log(cols);

    table.data.data.forEach((r) => {
      var i = 0;
      objarr = {};
      //console.log(r[3]);
      if (r[3].text === Group) {
        // console.log(r[3]);
        if (r[4].text === Order) {
          console.log(r[3]);
          var newOrder = parseInt(Order);
          newOrder += 1;
          r[4] = newOrder.toString();
          console.log(r);
          //probably have to load the row ito memory with rowIndex and move it down?
          // table.update();
        }
      }
      //   r.forEach((c) => {
      //     objarr[table.data.headings[i].data.toLowerCase()] = c.text;
      //     i += 1;
      //     //console.log(c.text);
      //   });
      myjson.push(objarr);
    });
    console.log('jparse');
    console.log(myjson);
  }
  function SearchGroups() {
    var Group = document.getElementById('txtGroup').value;
    table.search(Group, [3]);
  }
});
