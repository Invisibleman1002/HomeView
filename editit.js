var meditor;
let file = '';
let path = '';

async function loadFile(path, file) {
  const response = await fetch(`/loadt/?file=${file}&path=${path}`);
  const file_Data = await response.text();
  // console.log(file_Data);
  meditor.content.textContent = file_Data;
  //   fetch(`/crud/?edit=${file}&path=${path}`, {
  //     method: 'GET',
  //     headers: {
  //       Accept: 'application/json, text/plain, */*',
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((res) => res.text())
  //     .then((res) => console.log(res));
}

async function saveFile(path, file) {
  if (file === '') {
    return false;
  }
  if (confirm(`Are you sure you want to overwrite ${file}`) == false) {
    return false;
  }
  fetch(`/savet/?file=${file}&path=${path}`, {
    method: 'POST',
    body: JSON.stringify({
      path: path,
      file: file,
      contents: meditor.content.textContent,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      document.getElementById(
        'txtMessage'
      ).textContent = `${path}/${file} has been saved.`;
      // title = document.getElementById('title');
      //body = document.getElementById('bd');
      // title.innerHTML = data.title;
      // body.innerHTML = data.body;
    })
    .catch((error) => console.error('Error:', error));

  //   const response = await fetch(`/crud/?edit=${file}&path=${path}`);
  //   const file_Data = await response.text();
  //   console.log(file_Data);
  //   meditor.content.textContent = file_Data;
  //   fetch(`/crud/?edit=${file}&path=${path}`, {
  //     method: 'GET',
  //     headers: {
  //       Accept: 'application/json, text/plain, */*',
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((res) => res.text())
  //     .then((res) => console.log(res));
}

document.addEventListener('DOMContentLoaded', function () {
  var jf = JSON.parse(document.getElementById('json_files').value);
  //   jf.view.forEach((v) => console.log(v));
  //   jf.templates.forEach((v) => console.log(v));
  //   jf.groups.forEach((v) => console.log(v));

  var table = document.createElement('table');
  table.setAttribute('class', 'w2-bordered w3-small');
  var trV = document.createElement('tr');
  var td1v = document.createElement('td');
  var td2v = document.createElement('td');
  var textv = document.createTextNode('views');
  var text2v = document.createTextNode(' ');
  td1v.appendChild(textv);
  td2v.appendChild(text2v);
  trV.appendChild(td1v);
  trV.appendChild(td2v);

  table.appendChild(trV);
  jf.view.forEach((v) => {
    //  console.log(v);
    var trV = document.createElement('tr');
    var td1v = document.createElement('td');
    var td2v = document.createElement('td');
    var textv = document.createTextNode('');
    var text2v = document.createTextNode(v);
    var a = document.createElement('a');
    // Append the text node to anchor element.
    a.appendChild(text2v);
    a.title = v;
    // a.href = '#'; //'/template/?edit=' + v;
    a.className = 'clsLoad';
    a.setAttribute('data-file', v);
    a.setAttribute('data-path', 'views');
    a.style = 'cursor:pointer;';
    td1v.appendChild(textv);
    td2v.appendChild(a);
    trV.appendChild(td1v);
    trV.appendChild(td2v);
    table.appendChild(trV);
  });

  var trV = document.createElement('tr');
  var td1v = document.createElement('td');
  var td2v = document.createElement('td');
  var x = document.createElement('INPUT');
  x.setAttribute('type', 'text');
  x.setAttribute('id', 'txtEdit');
  x.className = 'clstxtLoad';
  var textv = document.createTextNode('create file=>');
  //var text2v = document.createTextNode(v);
  //   var a = document.createElement('a');
  //   // Append the text node to anchor element.
  //   a.appendChild(text2v);
  //   a.title = v;
  //   // a.href = '#'; //'/template/?edit=' + v;
  //   a.className = 'clsLoad';
  //   a.setAttribute('data-file', v);
  //   a.setAttribute('data-path', 'views');
  //   a.style = 'cursor:pointer;';
  td1v.appendChild(textv);
  td2v.appendChild(x);
  trV.appendChild(td1v);
  trV.appendChild(td2v);
  table.appendChild(trV);

  //templates
  var trV = document.createElement('tr');
  var td1v = document.createElement('td');
  var td2v = document.createElement('td');
  var textv = document.createTextNode('templates');
  var text2v = document.createTextNode(' ');

  td1v.appendChild(textv);
  td2v.appendChild(text2v);
  trV.appendChild(td1v);
  trV.appendChild(td2v);
  table.appendChild(trV);
  //jf.groups.forEach((v) => console.log(v));

  //   const diff =
  //     jf.groups.length > jf.groups.length
  //       ? jf.groups.filter((e) => !jf.groups.includes(e))
  //       : jf.groups.filter((e) => !jf.groups.includes(e));

  const diff =
    jf.groups.length > jf.templates.length
      ? jf.groups.filter((e) => !jf.templates.includes(e))
      : jf.templates.filter((e) => !jf.groups.includes(e));

  // console.log(diff);

  jf.templates.forEach((v) => {
    // console.log(v);
    var trV = document.createElement('tr');
    var td1v = document.createElement('td');
    var td2v = document.createElement('td');
    var textv = document.createTextNode('');
    var text2v = document.createTextNode(v);
    var a = document.createElement('a');
    // Append the text node to anchor element.
    a.appendChild(text2v);
    a.title = v;
    // a.href = '#'; //'/template/?edit=' + v;
    a.style = 'cursor:pointer;';
    a.className = 'clsLoad';
    a.setAttribute('data-file', v);
    a.setAttribute('data-path', 'templates');

    td1v.appendChild(textv);
    td2v.appendChild(a);
    trV.appendChild(td1v);
    trV.appendChild(td2v);
    table.appendChild(trV);
  });

  if (diff.length > 0) {
    diff.forEach((v) => {
      //     console.log(v);
      var trV = document.createElement('tr');
      var td1v = document.createElement('td');
      var td2v = document.createElement('td');
      var textv = document.createTextNode('new=>');
      var text2v = document.createTextNode(v);
      var a = document.createElement('a');
      // Append the text node to anchor element.
      a.appendChild(text2v);
      a.title = v;
      // a.href = '#'; //'/template/?edit=' + v;
      a.style = 'cursor:pointer;';
      a.className = 'clsnoLoad';
      a.setAttribute('data-file', v);
      a.setAttribute('data-path', 'templates');

      td1v.appendChild(textv);
      td2v.appendChild(a);
      trV.appendChild(td1v);
      trV.appendChild(td2v);
      table.appendChild(trV);
    });
  }
  document.getElementById('FileList').appendChild(table);

  document.querySelectorAll('.clsLoad').forEach((element) => {
    element.addEventListener('click', (e) => {
      //   console.log(this);
      file = element.getAttribute('data-file');
      path = element.getAttribute('data-path');
      document
        .querySelectorAll('.clsnoLoad, .clsLoad, .clstxtLoad')
        .forEach((element) => {
          element.style.backgroundColor = 'white';
          element.style.color = 'black';
        });
      e.target.style.backgroundColor = 'green';
      e.target.style.color = 'white';
      document.getElementById('txtMessage').textContent = `Editing: ${file}`;

      loadFile(path, file);
    });
  });

  document.getElementById('txtEdit').addEventListener('click', (e) => {
    document
      .querySelectorAll('.clsnoLoad, .clsLoad, .clstxtLoad')
      .forEach((element) => {
        element.style.backgroundColor = 'white';
        element.style.color = 'black';
      });
    e.target.style.backgroundColor = 'green';
    e.target.style.color = 'white';
    document.getElementById(
      'txtMessage'
    ).textContent = `Type in a file name ending with .hbs`;
    meditor.content.textContent = '';
  });

  document.getElementById('txtEdit').addEventListener('keyup', (e) => {
    console.log(`keypressed ${e.key}`);
    if (e.key === 'Enter') {
      let val = document.getElementById('txtEdit').value;
      if (val.endsWith('.hbs')) {
        file = val;
        path = 'view';
        document.getElementById(
          'txtMessage'
        ).textContent = `Editing new file: ${val}`;
      } else {
        file = '';
        path = '';
        document.getElementById(
          'txtMessage'
        ).textContent = `${val} must end in .hbs`;
      }
      // file = element.getAttribute('data-file');
      // path = element.getAttribute('data-path');
      document
        .querySelectorAll('.clsnoLoad, .clsLoad, .clstxtLoad')
        .forEach((element) => {
          element.style.backgroundColor = 'white';
          element.style.color = 'black';
        });
      e.target.style.backgroundColor = 'green';
      e.target.style.color = 'white';
    }
  });

  document.querySelectorAll('.clsnoLoad').forEach((element) => {
    element.addEventListener('click', (e) => {
      file = element.getAttribute('data-file');
      path = element.getAttribute('data-path');
      document
        .querySelectorAll('.clsnoLoad, .clsLoad, .clstxtLoad')
        .forEach((element) => {
          element.style.backgroundColor = 'white';
          element.style.color = 'black';
        });
      e.target.style.backgroundColor = 'green';
      e.target.style.color = 'white';
      meditor.content.textContent = '';
    });
  });

  //   var editor = new MediumEditor('.editable', {
  //     toolbar: {
  //       /* These are
  //       the default options for the toolbar, if nothing is passed this is what is
  //       used */
  //       allowMultiParagraphSelection: true,
  //       buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'quote'],
  //       diffLeft: 0,
  //       diffTop: -10,
  //       firstButtonClass: 'medium-editor-button-first',
  //       lastButtonClass: 'medium-editor-button-last',
  //       relativeContainer: null,
  //       standardizeSelectionStart: false,
  //       static: false,
  //       /* options which only
  //       apply when static is true */ align: 'center',
  //       sticky: false,
  //       updateOnEmptySelection: false,
  //     },
  //   });
  //   document.getElementById('save_data').addEventListener('click', () => {
  //     var x = editor.getContent();
  //     console.log(x);
  //     var y = document.getElementById('editable').innerText;
  //     console.log(y);
  //   });
  //   var div = document.getElementById('editor');
  //   var editor = new Squire(div, {
  //     blockTag: '',
  //     tagAttributes: {
  //       ul: { class: 'UL' },
  //       ol: { class: 'OL' },
  //       li: { class: 'listItem' },
  //       a: { target: '_blank' },
  //       pre: {
  //         style:
  //           'border-radius:3px;border:1px solid #ccc;padding:7px 10px;background:#f6f6f6;font-family:menlo,consolas,monospace;font-size:90%;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;',
  //       },
  //       code: {
  //         style:
  //           'border-radius:3px;border:1px solid #ccc;padding:1px 3px;background:#f6f6f6;font-family:menlo,consolas,monospace;font-size:90%;',
  //       },
  //     },
  //   });
  // var wysiwyg = '';
  //https://github.com/jaredreich/pell/issues/213  --custom icon
  meditor = window.pell.init({
    element: document.getElementById('editor'),
    defaultParagraphSeparator: '',
    actions: [
      {
        name: 'fe',
        icon: 'FE',
        title: 'handlebar for each',
        result: () =>
          window.pell.exec('insertText', '{{#each topic}} {{/each}}'),
      },
      {
        name: 'dj',
        icon: 'DJ',
        title: 'handlebar dayjs',
        result: () =>
          window.pell.exec(
            'insertText',
            '{{dayjs <datetoformat> "MM/DD/YYYY hh:mm:ss A" "1/0-show date is same day"}}'
          ),
      },
      {
        name: 'dj',
        icon: 'IF',
        title: 'handlebar ifdatebetween',
        result: () =>
          window.pell.exec(
            'insertText',
            '{{#ifdatebetween date  ../updateddate}} {{else}} {{/ifdatebetween}}'
          ),
      },
      {
        name: 'FX',
        icon: 'FX',
        title: 'handlebar if value is float, convert to x decimals.',
        result: () =>
          window.pell.exec('insertText', '{{messagenumber message 1}}'),
      },
      {
        name: 'clear',
        icon: 'CL',
        title: 'Clear',
        result: () => {
          meditor.content.textContent = '';
          file = '';
          path = '';
          document
            .querySelectorAll('.clsnoLoad, .clsLoad')
            .forEach((element) => {
              element.style.backgroundColor = 'white';
              element.style.color = 'black';
            });
        },
      },
      {
        name: 'save',
        icon: 'SAVE',
        title: 'Save file',
        result: () => saveFile(path, file),
      },
    ], //pell-message
    onChange: function (html) {
      console.log('Data changed');
      //document.getElementById('text-output').innerHTML = html;
      //document.getElementById('html-output').textContent = html;
      //   wysiwyg = html;
    },
  });
  var divStatB = document.createElement('div');
  divStatB.setAttribute('class', 'pell-actionbar');
  var divStatM = document.createElement('span');
  divStatM.setAttribute('id', 'txtMessage');
  divStatB.appendChild(divStatM);
  divStatM.textContent = ' ';
  document.getElementById('editor').appendChild(divStatB);

  document
    .querySelectorAll('.pell-content')[0]
    .setAttribute('contenteditable', 'plaintext-only');

  var isChrome =
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  if (!isChrome) {
    alert(
      'Sorry, this browser may not support the contenteditable value of plaintext-only.  You will not be able to edit templates.'
    );
  }

  //   document.getElementById('save_data').addEventListener('click', () => {
  //     // var x = editor.getContent();
  //     // console.log(x);
  //     // var y = document.getElementById('editable').innerText;
  //     // console.log(y);
  //     //console.log(wysiwyg);
  //     console.log(meditor.content.textContent);
  //   });

  document.getElementById('btnHelp').addEventListener(
    'click',
    () => {
      var x = document.getElementById('help');
      if (x.className.indexOf('w3-show') == -1) {
        x.className += ' w3-show';
      } else {
        x.className = x.className.replace(' w3-show', '');
      }
    },
    false
  );
});
