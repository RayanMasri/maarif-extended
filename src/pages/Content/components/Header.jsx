import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
// import IconButton from './IconButton.jsx';
import QuizIcon from '@mui/icons-material/Quiz';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

function Header(props) {
  const [state, setState] = useState({
    checked: false,
    indeterminate: false,
  });

  const onRequest = (event) => {
    // Check if all exams are selected
    if (!state.indeterminate && state.checked) {
      let exams = [];

      for (let i = 0; i < document.querySelectorAll('.bar-at').length; i++) {
        exams.push(i);
      }

      document.dispatchEvent(
        new CustomEvent(event, {
          detail: { exams: exams },
        })
      );

      return;
    }

    // Get all checked checkboxes and get their parent's indices
    let indices = [];

    for (let element of Array.from(
      document.querySelectorAll('.bar-at > span.Mui-checked')
    )) {
      indices.push(parseInt(element.parentElement.getAttribute('index')));
    }

    document.dispatchEvent(
      new CustomEvent(event, {
        detail: { exams: indices },
      })
    );
  };

  const onRequestChange = (event) => {
    let { every, some } = event.detail;

    setState({
      checked: every, // If all the exams are selected, show a check, otherwise show nothing
      indeterminate: !every && some, // If not all exams are selected, then show indeterminate if a few are selected
    });
  };

  useEffect(() => {
    document.addEventListener('header-change', onRequestChange);

    return () => {
      document.removeEventListener('header-change', onRequestChange);
    };
  });

  const onChange = (event, value) => {
    if (state.indeterminate) value = false;

    props.onChange(value);

    setState({
      checked: value,
      indeterminate: false,
    });
  };

  return (
    <div
      className={props.className}
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <Checkbox
        onChange={onChange}
        checked={state.checked}
        indeterminate={state.indeterminate}
      />

      {/* <Button
        style={{
          fontSize: '18px',
        }}
        onClick={selectAll}
      >
        تحديد الكل
      </Button> */}

      <IconButton
        sx={{
          width: 30,
          height: 30,
        }}
        onClick={() => onRequest('request-download')}
      >
        <DownloadRoundedIcon sx={{ width: 24, height: 24 }} />
      </IconButton>
      <IconButton
        sx={{
          width: 30,
          height: 30,
        }}
        onClick={() => onRequest('request-retake')}
      >
        <QuizIcon sx={{ width: 24, height: 24 }} />
      </IconButton>
    </div>
  );
}

export default Header;
