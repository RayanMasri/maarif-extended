import React, { useEffect, useState, useRef } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import useUtilityHook from '../hooks/UtilityHook.jsx';
import LinearProgress from '@mui/material/LinearProgress';
import { makeStyles } from '@mui/styles';
import { useMainContext } from '../MainContext';
import { useOverlayContext } from '../OverlayContext';

import Holder from './Holder.jsx';
import html2canvas from 'html2canvas';

import DownloadOverlay from './download-overlay/DownloadOverlay.jsx';
import ProgressOverlay from './ProgressOverlay.jsx';

// TODO: Disable exam order option when all sorting options only include one, or hide the exam order option entirely
//  - Also remove sorting options that include one?

const requested = {
  default: {
    datas: [],
    exams: [],
    uniques: {
      teachers: [],
      languages: [],
      subjects: [],
    },
  },
};

const settings = {
  default: {
    file: 'PDF',
    teacher: 'الكل',
    language: 'العربية',
    subject: 'الكل',
    showWrong: false,
    sideDetails: false,
    strongTitles: 'Original titles',
    grayscale: 'None',
    devDebug: false,
    duplicates: {
      removal: false,
      images: {
        removal: false,
        method: 'Exact pixels',
        threshold: 100,
      },
      questions: {
        removal: false,
        method: 'Exact text',
        threshold: 100,
      },
    },
    resolution: 1,
    compression: {
      enabled: false,
      rate: 0,
    },
    customization: {
      preset: 'Original',
      title: {
        size: 24,
        color: '#000000',
      },
      spacing: {
        checkbox: 24,
        titleBottom: 24,
        questions: {
          method: 'Pixels',
          value: 24,
        },
      },
    },
    examOrder: {
      groupBy: 'Name',
      order: undefined,
      datas: undefined,
    },
  },
};

function Overlay(props) {
  const { getObjectArrayUnique, setObjectPropertyFromString } =
    useUtilityHook();

  const { main, setMain } = useMainContext();
  const { overlay, setOverlay } = useOverlayContext();

  const [state, _setState] = useState({
    // settings: {
    //   showIncorrect: false,
    //   showDetailsSide: false,
    //   fileType: 'PDF',
    //   teacher: 'الكل',
    //   language: 'العربية',
    // },

    settings: settings.default,
    requested: requested.default,
    download: {
      downloading: false,
      progress: {
        value: 0,
        message: '',
      },
    },

    active: false,
    type: null,
  });
  const _state = useRef(state);
  const setState = (data) => {
    _state.current = data;
    _setState(data);
  };

  useEffect(() => {
    // document.addEventListener('request-download', onRequest);
    // document.addEventListener('request-retake', onRequest);

    // Necessary to load the arabic font
    // TODO: transfer to hidden component
    let hidden = document.querySelector('.hidden-mxd');
    html2canvas(hidden, {
      width: hidden.offsetWidth,
      height: hidden.offsetHeight,
    }).then((canvas) => {
      console.log(canvas.toDataURL('image/png'));
    });

    // return () => {
    // document.removeEventListener('request-download', onRequest);
    // document.addEventListener('request-retake', onRequest);
    // };
  }, []);

  useEffect(() => {
    // Skip on initialization
    if (main.data == null) return;

    if (overlay.download.requested.length == 0) return;

    console.log(
      `Successfully opened overlay to download ${overlay.download.requested.length} exam(s)`
    );

    // let exams = event.detail.exams;

    // console.log(main.data);
    let datas = overlay.download.requested.map((item) => {
      return {
        ...item,
        // TODO: Change to "direction" later (as in RTL or LTR)
        language: item.subject.includes('الإنجليزية') ? 'EN' : 'AR',
      };
    });
    // console.log(exams);
    // if (exams.length == 0) return;

    // let datas = exams.map((exam) => {
    //   return {
    //     ...acquireDataFromExamIndex(exam),
    //     index: exam,
    //   };
    // });
    let teachers = getObjectArrayUnique(datas, 'teacher');
    let languages = getObjectArrayUnique(datas, 'language');
    let subjects = getObjectArrayUnique(datas, 'subject');

    setState({
      ..._state.current,
      active: true,
      type: 'request-download',
      requested: {
        datas: datas,
        length: overlay.download.requested.length,
        uniques: {
          teachers: teachers,
          languages: languages,
          subjects: subjects,
        },
      },
    });
  }, [JSON.stringify(overlay.download)]);

  const acquireDataFromExamIndex = (index) => {
    let row = document.querySelector(
      `#ctl00_MainContentPlaceHolder_gridData > tbody > tr:nth-child(${
        index + 1
      })`
    );

    // Get subject
    let subject = row.querySelector('td:nth-child(10)');
    subject = subject.textContent.trim();

    // Get language from subject
    let language = subject.includes('الإنجليزية') ? 'EN' : 'AR';

    // Get teacher
    let teacher = row.querySelector('td:nth-child(7)');
    teacher = teacher.textContent.trim();

    let name = row.querySelector('td:nth-child(2)');
    name = name.textContent.trim();

    return {
      language: language,
      teacher: teacher,
      subject: subject,
      name: name,
    };
  };

  // const onRequest = (event) => {
  //   console.log(event);
  //   let exams = event.detail.exams;

  //   console.log(exams);
  //   if (exams.length == 0) return;

  //   let datas = exams.map((exam) => {
  //     return {
  //       ...acquireDataFromExamIndex(exam),
  //       index: exam,
  //     };
  //   });
  //   console.log(datas);
  //   let teachers = getObjectArrayUnique(datas, 'teacher');
  //   let languages = getObjectArrayUnique(datas, 'language');
  //   let subjects = getObjectArrayUnique(datas, 'subject');

  //   setState({
  //     ..._state.current,
  //     active: true,
  //     type: event.type,
  //     requested: {
  //       datas: datas,
  //       exams: exams,
  //       uniques: {
  //         teachers: teachers,
  //         languages: languages,
  //         subjects: subjects,
  //       },
  //     },
  //   });
  // };

  const onCancel = () => {
    setMain({
      ...main,
      download: {
        status: false,
        requested: [],
      },
    });
    // setState({
    //   ...state,
    //   active: false,
    //   requested: requested.default,
    // });
  };

  // const getActive = () => {
  //   switch (state.type) {
  //     case 'request-download':
  //       if (!state.download.downloading) {
  //         return (
  //           <DownloadOverlay
  //             requested={state.requested}
  //             settings={state.settings}
  //             parent={state}
  //             onCancel={onCancel}
  //             onProgress={(value) => {
  //               setState({
  //                 ...state,
  //                 download: value,
  //               });
  //             }}
  //             onSettingChange={(setting, value) => {
  //               setState(setObjectPropertyFromString(state, setting, value));
  //             }}
  //           />
  //         );
  //       } else {
  //         return <ProgressOverlay />;
  //       }
  //     case 'request-retake':
  //       break;
  //   }
  // };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: '0',
        left: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.33)',
        zIndex: '35000',
        display: main.download.status ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'ltr',
        fontWeight: 'normal',
      }}
      direction="ltr"
    >
      <div
        style={{
          backgroundColor: '#ECECEC',
          width: 'max-content',
          height: 'max-content',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* {getActive()} */}

        <DownloadOverlay
          requested={state.requested}
          settings={state.settings}
          parent={state}
          onCancel={onCancel}
          onProgress={(value) => {
            setState({
              ...state,
              download: value,
            });
          }}
          onSettingChange={(setting, value) => {
            setState(setObjectPropertyFromString(state, setting, value));
          }}
          // hidden={state.download.downloading}
          hidden={overlay.download.status}
        />
        <ProgressOverlay
          download={state.download}
          // hidden={!state.download.downloading}
          hidden={!overlay.download.status}
        />
      </div>
    </div>
  );
}

export default Overlay;
