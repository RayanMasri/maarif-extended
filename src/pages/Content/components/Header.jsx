import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
// import IconButton from './IconButton.jsx';
import QuizIcon from '@mui/icons-material/Quiz';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useMainContext } from '../MainContext';
import useRequestHook from '../hooks/RequestHook';

function Header(props) {
  const { main, setMain } = useMainContext();
  // const [state, setState] = useState({
  //   checked: false,
  //   indeterminate: false,
  // });

  const { requestDownload } = useRequestHook();

  // const onRequest = (event) => {
  //   // Check if all exams are selected
  //   if (!state.indeterminate && state.checked) {
  //     let exams = [];

  //     for (let i = 0; i < document.querySelectorAll('.bar-at').length; i++) {
  //       exams.push(i);
  //     }

  //     document.dispatchEvent(
  //       new CustomEvent(event, {
  //         detail: { exams: exams },
  //       })
  //     );

  //     return;
  //   }

  //   // Get all checked checkboxes and get their parent's indices
  //   let indices = [];

  //   for (let element of Array.from(
  //     document.querySelectorAll('.bar-at > span.Mui-checked')
  //   )) {
  //     indices.push(parseInt(element.parentElement.getAttribute('index')));
  //   }

  //   document.dispatchEvent(
  //     new CustomEvent(event, {
  //       detail: { exams: indices },
  //     })
  //   );
  // };

  // const onRequestChange = (event) => {
  //   let { every, some } = event.detail;

  //   setState({
  //     checked: every, // If all the exams are selected, show a check, otherwise show nothing
  //     indeterminate: !every && some, // If not all exams are selected, then show indeterminate if a few are selected
  //   });
  // };

  // useEffect(() => {
  //   document.addEventListener('header-change', onRequestChange);

  //   return () => {
  //     document.removeEventListener('header-change', onRequestChange);
  //   };
  // });

  // start: inclusive, end: exclusive
  const createRange = (start, end) => {
    let result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  const onChange = (event, value) => {
    if (isIndeterminate()) {
      setMain({
        ...main,
        selected: [],
      });
      return;
    }

    setMain({
      ...main,
      selected: isChecked() ? [] : createRange(0, main.maximum),
    });
  };

  const isIndeterminate = () => {
    let result =
      main.selected.length != main.maximum && main.selected.length != 0;
    console.log(
      `Checking if indeterminate based on ${main.selected.length} (max: ${main.maximum}), result: ${result}`
    );

    return result;
  };

  const isChecked = () => {
    let result = !isIndeterminate()
      ? main.selected.length == main.maximum
      : false;
    console.log(
      `Checking if checked based on ${main.selected.length} (max: ${main.maximum}), result: ${result}`
    );
    return result;
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
        checked={isChecked()}
        indeterminate={isIndeterminate()}
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
        // onClick={() => onRequest('request-download')}
        onClick={() => {
          requestDownload(main.selected);
          // setMain({
          //   ...main,
          // });
          // console.log('Want to downloade');
          // console.log(
          //   `Main selected (${main.selected.length}): ${JSON.stringify(
          //     main.selected
          //   )}`
          // );
          // setState({
          //   ...state,
          //   john: main.selected.length,
          // });
        }}
      >
        <DownloadRoundedIcon sx={{ width: 24, height: 24 }} />
      </IconButton>
      <IconButton
        sx={{
          width: 30,
          height: 30,
        }}
        // onClick={() => onRequest('request-retake')}
      >
        <QuizIcon sx={{ width: 24, height: 24 }} />
      </IconButton>
    </div>
  );
}

export default Header;
