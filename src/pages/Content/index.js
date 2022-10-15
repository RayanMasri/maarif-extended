// add button under available exams that directly sends the user to the completed exams subdomain

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Bar from './components/Bar.jsx';
import Table from './components/Table.jsx';
import Overlay from './components/Overlay.jsx';
import Hidden from './components/Hidden.jsx';
import Header from './components/Header.jsx';
import useUtilityHook from './hooks/UtilityHook.jsx';
import usePdfHook from './hooks/PdfHook.jsx';
import '../../assets/fonts/trado.ttf';
import { jsPDF } from 'jspdf';

// make index.js append a script file / react component at the bottom of body
// this might solve a lot of problems, like waiting for fonts to load
// -
// try running html2canvas on the title div itself after cleaning up, instead of cleaning up later on a temporary div
// -
// use local storage instead, and when page just open up reset local storage
// -
// if all the exams have the same teacher, then dont show the language option, since the teacher only uses one language

// todo:
// exam filtering when downloading according to language and teacher ***
// support for english exams in pdf ***
// add support for exam on side option ***
// add support for incorrect option ***
// instantaneous progress bar ***
// session permanent download settings ***
// multiple line support for titles ***
// stop using iframes somehow ***
// add support for underlines ***
// download settings reset to default
// download settings for title & answer font size and color
//     - look for the perfect default for these
// visual page number at page footer or close to page footer, e.g: 5/8 (https://stackoverflow.com/questions/52170355/jspdf-print-current-pagenumber-in-footer-of-all-pages)
// duplicate question removal option in download settings, with three sub-options:
//     1. use fizzy search or use exact string comparison
//     2. adjust accuracy threshold for fizzy search if used
// duplicate question image removal option, with accuracy threshold option
// show estimate in download progress bar ( while including estimates for specific options and languages )
// reject download when filters produce no results
// control over exam order when downloading
// real-time question preview when downloaded on a pdf inside download settings
// specific word styling support for titles
// remove unnecessary punctuation marks from titles (e.g: "Assign 6")
// exam differentiation by turning subject, teacher and date created into hexadecimal strings to use as an ID
// json to pdf refactoring and optimizations
// organize json to pdf data for titles and answers into json objects instead of recurring variable names
// working cancel button when downloading exams
// support for json downloading
// progress info and confirm button after completion, info examples:
//  - time elapsed
//  - exams downloaded
//  - questions downloaded
//  - duplicate questions removed
//  - how many arabic and english questions were downloaded
//  - file size
// add multiple language support in one pdf for JSON & PDF file types
// - add this as an option, and when enabled, think of it as downloading all the english exams and conjoining them with all the arabic exams in the end of the pdf, so there wont be any mixed questions between them
// - and also dont allow english and arabic questions to be in one page
// add subject filter
// hide/disable cancel button when not able to cancel
// when using promise.all to run concurrently, assign each result an index, and sort later accordingly
// when scraping title, don't use a temporary div while keeping <strong> and other stylings
// prevent active exams from being downloading or interacted with, disable their checkbox and download button or something
// only show selection checkboxes and header data when the user prompts selection, e.g on the click of a button somewhere
// option to use the chrome print option to print pages, by opening multiple windows and running window.print()
// make use of .prepend()
// optimize by using one image for multiple questions that fit a page
// ability to switch locale between arabic & english
// when nothing is selected, dont show buttons (maybe including checkbox) in header
// show header buttons inside table column
// change tab title when downloading and show progress message, change back title when done
// make an option to use styles (original, modern, ...) and a final style for custom margins and font sizes which give you more options, the custom default settings come for the previous style
// add loading screen in beggining for homework, and ability to disable it
// exam favoriting
// create new student-made exams by using other exams current questions
// getting started tutorial in popup
// direct link to exams from popup
// increase resolution by increasing font size and increasing ratio to accommodate
// grayscale option
// show filtered exams next to total exams when downloading
// loading circle when downloading pdf with huge exams
// option to show exam name for each question, or exam names grouped in the footer of the page for the questions of that page
// change github readme
// full pdf preview, and specific question editing in that preview (see digital technology exams)
// compression option
// show final file size estimate before downloading and time estimate
// find out how to optimize file size
// use local storage to store data for exams to only fetch once
// fetch exams while user is on the overlay, and show download button as disabled and a loading on it
// custom user questions and answers that can be exported and imported as json files
// - also has the ability to randomize it's own four answers with one being the correct, and three being taken from other questions ( requires a minimum of 4 questions )
// question vertical spacing to differentiate
// strong title detector
// strong title toggler (if detected, or either way an ability to toggle if necessary)
// option to customize spacing between questions, or option to shwo lines between them, or no spacing at all
// advanced section of setting
// make download button called start, and after finishing create a confirm/download button to download it
// show preview after finishing
// fetch and create pdf in background script
// show exam name as header above all the questions in the exam to differentiate between exams
// fix title overflow in irregular no.3
// bugs:
// br is too long
// slow responses (e.g: on cancel button) after finishing downloading for about 5 seconds
// downloading more than 50 exams stops parsing question at the -57th question
// downloading does not progress while window is not focused
//    - progress bar does not move when window is not focused
// merging english alphanumerics or arabic digits with arabic letters breaks the arabic ligatures
// option menus are slow
// option menu shows transparent options sometimes
// option menu disables scrollbar *
// debug to show how much lines a title has

// irregulars:
// https://smartems-dash.maarif.com.sa/ems/admin/exam.correct.answer/31860022/#!#rel (فطريات 3)
// https://smartems-dash.maarif.com.sa/ems/admin/exam.correct.answer/31860020/#!#rel (فطريات 4)
// https://smartems-dash.maarif.com.sa/ems/admin/exam.correct.answer/31431596/#!#rel (Assign 12)

const init = async () => {
  const { append } = useUtilityHook();

  // add custom font
  var style = document.createElement('style');
  style.type = 'text/css';
  style.textContent =
    '@font-face { font-family: Arabic; src: url("' +
    chrome.runtime.getURL('trado.ttf') +
    '"); }';
  document.head.appendChild(style);

  // get rows
  let rows = document.querySelectorAll(
    '#ctl00_MainContentPlaceHolder_gridData > tbody > tr'
  );

  // initialize state with same exam count
  let state = { exams: {} };
  for (let i = 0; i < rows.length; i++) {
    state.exams[i] = false;
  }

  const onExamChange = (value, index) => {
    state.exams[index] = value;

    let exams = Object.values(state.exams);

    document.dispatchEvent(
      new CustomEvent('header-change', {
        detail: {
          every: exams.every((exam) => exam),
          some: exams.some((exam) => exam),
        },
      })
    );
  };

  const onHeaderChange = (value) => {
    // set all exam values to header value
    for (let key of Object.keys(state.exams)) {
      state.exams[key] = value;
      document.dispatchEvent(
        new CustomEvent(`bar-change-${key}`, { detail: { value: value } })
      );
    }
  };

  // add overlay
  ReactDOM.render(
    ReactDOM.createPortal(<Hidden />, document.body),
    document.createElement('div')
  );
  ReactDOM.render(
    ReactDOM.createPortal(<Overlay />, document.body),
    document.createElement('div')
  );

  // add header to the table
  let table = document.querySelector(
    '#ctl00_MainContentPlaceHolder_gridData > thead > tr'
  );
  append(<Table className="tool-header" />, table, 'tool-header', 0);

  // add header component
  let header = document.querySelector(
    '#page-wrapper > div.ExamSchedualContainer'
  );
  append(
    <Header onChange={onHeaderChange} className="main-header" />,
    header,
    'main-header',
    3
  );

  let pdf = new jsPDF();
  fetch(chrome.runtime.getURL('trado.ttf')).then(async (response) => {
    let blob = await response.blob();
    var reader = new FileReader();
    reader.onload = function () {
      pdf.addFileToVFS('trado.ttf', this.result);
      pdf.addFont('trado.ttf', 'trado', 'normal');

      let elements = document.querySelectorAll(
        '#ctl00_MainContentPlaceHolder_gridData > tbody > tr'
      );

      for (let i = 0; i < elements.length; i++) {
        let element = elements[i];

        append(
          <Bar
            className={`bar-at-${i} bar-at`}
            index={i}
            checked={state.exams[i]}
            pdf={pdf}
            onChange={onExamChange}
          />,
          element,
          `bar-at-${i}`,
          0
        );
      }
    }; // <--- `this.result` contains a base64 data URI
    reader.readAsBinaryString(blob);
  });

  console.log(
    `Set local storage jsPDF page width to: ${pdf.internal.pageSize.getWidth()}`
  );
  localStorage.setItem('js-pdf-page-width', pdf.internal.pageSize.getWidth());

  window.jsPDF = pdf;
};

if (window.location.pathname == '/reports/homework.report/') init();
