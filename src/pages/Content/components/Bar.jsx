import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import QuizIcon from '@mui/icons-material/Quiz';

// import IconButton from './IconButton.jsx';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
// import jsPDF from '../jspdf.umd.js';
import useUtilityHook from '../hooks/UtilityHook.jsx';

// const jsPDF = require(chrome.runtime.getURL)

// window.jsPDF = window.jspdf.jsPDF;

// const pageDimensions = {
//   width: 1920,
//   height: 929,
// };
// const questionDimensions = {
//   width: 500,
//   height: 200,
// };

// 300 / 100 * 36.4583333333
// let newHeight = (pdf.internal.pageSize.height / 100) * ratio.height;
// let newWidth = width / (((height / newHeight) * 100) / 100);

// switch right to left in arabic

// make actual html page the samee size as pdf, see actual question size
// compare superficial size in pdf to real size, try sacling down

// make text same size as text in canvas, just squash it dont care not visible just searchable

// put question answers in the left so when wanting to study just put piece of paper there, remove/keep radio buttons

// options:
// json
// pdf with relative correct/wrong answers
// pdf with true answers
// pdf with hidden answers

// show pdf examples like snippets of the pdf or just one question

// const fontToSpacingRatio = -26.66;
// const titleFontSize = 10;
// const answerHeightSpacing = 0;
// const answerWidthMargin = 5;

// const widthToFontSize = 6.41511230469; // divide width by this value, returns corresponding font size
// const lineHeightRatio = -6.14073716055;

function Bar(props) {
  let [state, setState] = useState({
    checked: false,
    indeterminate: false,
  });

  // let pdf = new jsPDF('p', 'mm', [612, 792]);

  // useEffect(() => {
  //   console.log(
  //     `${props.index} changed to ${window.extension.exams[props.index]}`
  //   );
  // }, [JSON.stringify(window.extension.exams)]);

  const onChange = (event, value) => {
    props.onChange(value, props.index);
    setState({
      checked: value,
      indeterminate: false,
    });
  };

  const onRequest = (event) => {
    document.dispatchEvent(
      new CustomEvent(event, { detail: { exams: [props.index] } })
    );
  };

  const setValue = (event) => {
    setState({
      checked: event.detail.value,
      indeterminate: false,
    });
  };

  useEffect(() => {
    document.addEventListener(`bar-change-${props.index}`, setValue);

    return () => {
      document.removeEventListener(`bar-change-${props.index}`, setValue);
    };
  }, []);

  return (
    <td
      className={props.className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      index={props.index}
    >
      {/* <Checkbox onChange={props.onChange} /> */}
      <Checkbox
        // onChange={(event, value) => props.onChange(value, props.index)}
        // checked={props.checked}
        checked={state.checked}
        onMouseEnter={(event) => {
          if (event.buttons == 1) {
            onChange(event, !state.checked);
          }
        }}
        onMouseDown={(event) => onChange(event, !state.checked)}
      />

      <IconButton onClick={() => onRequest('request-retake')}>
        <QuizIcon sx={{ width: 24, height: 24 }} />
      </IconButton>

      {/* <IconButton onClick={onRequestDownload}> */}
      <IconButton onClick={() => onRequest('request-download')}>
        <DownloadRoundedIcon sx={{ width: 24, height: 24 }} />
      </IconButton>
    </td>
  );
}

export default Bar;
