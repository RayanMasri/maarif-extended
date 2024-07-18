// add button under available exams that directly sends the user to the completed exams subdomain

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import useUtilityHook from './hooks/UtilityHook.jsx';
import { render, createPortal } from 'react-dom';
// import { CounterContextProvider } from './CounterContext';
import { MainContextProvider, useMainContext } from './MainContext.jsx';
import Clicker from './Clicker';
import Hidden from './components/Hidden.jsx';
import Overlay from './components/Overlay.jsx';
import Table from './components/Table.jsx';
import Header from './components/Header.jsx';
import Bar from './components/Bar.jsx';
import MockTable from './MockTable';
import App from './App';

// import App from './App';

const init = async () => {
  const {
    solidifyHTML,
    getReactifiedChildren,
    createJsPDFObject,
    onMutationObserverSettle,
  } = useUtilityHook();

  console.log('Page loading...');
  await onMutationObserverSettle(document.body);
  console.log('Page loaded...');

  let exams = Array.from(
    document.querySelectorAll(
      '#ctl00_MainContentPlaceHolder_gridData > tbody > tr'
    )
  );

  let data = exams.map((exam) => {
    let [
      name,
      status,
      answer_date,
      creation_date,
      expiry_date,
      teacher,
      exam_grade,
      achieved_grade,
      subject,
    ] = Array.from(exam.children)
      .map((child) => child.innerText.trim())
      .slice(0, -1);

    let url = exam.querySelector('td:first-child > a').href;

    let comment = exam
      .querySelector('td:last-child > div > a')
      .getAttribute('onclick');

    return {
      name: name,
      status: status,
      answer_date: answer_date,
      creation_date: creation_date,
      expiry_date: expiry_date,
      teacher: teacher,
      exam_grade: exam_grade,
      achieved_grade: achieved_grade,
      subject: subject,
      url: url,
      comment: comment,
    };
  });

  ReactDOM.render(<App data={data} />, document.querySelector('#AVGResults'));

  let style = document.createElement('style');
  style.type = 'text/css';
  style.textContent =
    '@font-face { font-family: Arabic; src: url("' +
    chrome.runtime.getURL('trado.ttf') +
    '"); }';
  document.head.appendChild(style);

  // let success = count == 230;

  // localStorage.setItem(
  //   'success-attempts',
  //   JSON.stringify(
  //     [
  //       {
  //         date: new Date(Date.now()).toString(),
  //         outcome: success,
  //       },
  //     ].concat(JSON.parse(localStorage.getItem('success-attempts') || '[]'))
  //   )
  // );
  // location.reload();

  // var s = document.createElement('script');
  // // console.log(typeof chrome);
  // // console.log(object.keys(chrome));
  // // console.log(typeof chrome.runtime);
  // s.src = chrome.runtime.getURL('tablesorter.js');
  // s.onload = function () {
  //   console.log('Loaded tablesorter.js');
  //   console.log(this);
  //   // this.remove();
  // };
  // (document.head || document.documentElement).appendChild(s);

  return;

  let root = document.body.outerHTML;
  let commands = [];
  // let rows = document.querySelector(
  //   '#ctl00_MainContentPlaceHolder_gridData > tbody'
  // ).children.length;
  // for (let i = 1; i <= rows; i++) {
  //   commands.push({
  //     reference: `#ctl00_MainContentPlaceHolder_gridData > tbody > tr:nth-child(${i}) > td:nth-child(1)`,
  //     injected: <Clicker />,
  //   });
  // }

  commands.push({ reference: '.pace', injected: [<Hidden />, <Overlay />] });
  commands.push({
    reference: '#ctl00_MainContentPlaceHolder_gridData > thead > tr',
    injected: [<Table />],
    index: 0,
  });
  commands.push({
    reference: '#page-wrapper > div.ExamSchedualContainer',
    injected: [<Header onChange={(foo) => {}} />],
    index: 3,
  });

  let elements = document.querySelectorAll(
    '#ctl00_MainContentPlaceHolder_gridData > tbody > tr'
  );

  for (let i = 1; i <= elements.length; i++) {
    // let element = elements[i];

    commands.push({
      reference: `#ctl00_MainContentPlaceHolder_gridData > tbody > tr:nth-child(${i})`,
      injected: [
        <Bar index={i - 1} checked={false} pdf={{}} onChange={() => {}} />,
      ],
      index: 0,
    });
    // append(
    //   <Bar
    //     className={`bar-at-${i} bar-at`}
    //     index={i}
    //     checked={state.exams[i]}
    //     pdf={pdf}
    //     onChange={onExamChange}
    //   />,
    //   element,
    //   `bar-at-${i}`,
    //   0
    // );
  }

  render(
    <MainContextProvider>
      {getReactifiedChildren(solidifyHTML(root), 0, commands)}
    </MainContextProvider>,
    document.body
  );

  // let style = document.createElement('style');
  // style.type = 'text/css';
  // style.textContent =
  // '@font-face { font-family: Arabic; src: url("' +
  // chrome.runtime.getURL('trado.ttf') +
  // '"); }';
  // document.head.appendChild(style);

  const [main, setMain] = useMainContext();

  let jsPDF = await createJsPDFObject();
  setMain({
    ...main,
    pdf: jsPDF,
  });

  // Possible ideas:
  // Somehow wrap the entire website after successfully loading into a component, and just update its children from the there -
  // and when rendering to root, just render the entire component

  // starts here:

  // // get rows
  // let rows = document.querySelectorAll(
  //   '#ctl00_MainContentPlaceHolder_gridData > tbody > tr'
  // );

  // // initialize state with same exam count
  // let state = { exams: {} };
  // for (let i = 0; i < rows.length; i++) {
  //   state.exams[i] = false;
  // }

  // const onExamChange = (value, index) => {
  //   state.exams[index] = value;

  //   let exams = Object.values(state.exams);

  //   document.dispatchEvent(
  //     new CustomEvent('header-change', {
  //       detail: {
  //         every: exams.every((exam) => exam),
  //         some: exams.some((exam) => exam),
  //       },
  //     })
  //   );
  // };

  // const onHeaderChange = (value) => {
  //   // set all exam values to header value
  //   for (let key of Object.keys(state.exams)) {
  //     state.exams[key] = value;
  //     document.dispatchEvent(
  //       new CustomEvent(`bar-change-${key}`, { detail: { value: value } })
  //     );
  //   }
  // };

  // let pdf = new jsPDF();
  // fetch(chrome.runtime.getURL('trado.ttf')).then(async (response) => {
  //   let blob = await response.blob();
  //   var reader = new FileReader();
  //   reader.onload = function () {
  //     pdf.addFileToVFS('trado.ttf', this.result);
  //     pdf.addFont('trado.ttf', 'trado', 'normal');

  //     let elements = document.querySelectorAll(
  //       '#ctl00_MainContentPlaceHolder_gridData > tbody > tr'
  //     );

  //     for (let i = 0; i < elements.length; i++) {
  //       let element = elements[i];

  //       append(
  //         <Bar
  //           className={`bar-at-${i} bar-at`}
  //           index={i}
  //           checked={state.exams[i]}
  //           pdf={pdf}
  //           onChange={onExamChange}
  //         />,
  //         element,
  //         `bar-at-${i}`,
  //         0
  //       );
  //     }
  //   }; // <--- `this.result` contains a base64 data URI
  //   reader.readAsBinaryString(blob);
  // });

  // console.log(
  //   `Set local storage jsPDF page width to: ${pdf.internal.pageSize.getWidth()}`
  // );
  // localStorage.setItem('js-pdf-page-width', pdf.internal.pageSize.getWidth());

  // window.jsPDF = pdf;
};
// const init = async () => {
//   const { append } = useUtilityHook();

//   // add overlay
//   ReactDOM.render(
//     ReactDOM.createPortal(<Hidden />, document.body),
//     document.createElement('div')
//   );
//   ReactDOM.render(
//     ReactDOM.createPortal(<Overlay />, document.body),
//     document.createElement('div')
//   );
// };

// init();
if (window.location.pathname == '/reports/homework.report/') init();
