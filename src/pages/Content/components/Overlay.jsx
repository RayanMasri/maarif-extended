import React, { useEffect, useState, useRef } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import usePdfHook from '../hooks/PdfHook.jsx';
import LinearProgress from '@mui/material/LinearProgress';
import { makeStyles } from '@mui/styles';

import Menu from './Menu.jsx';
import html2canvas from 'html2canvas';

const useStyles = makeStyles({
  root: {
    transition: 'none',
  },
});

function Container(props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

function Label(props) {
  return (
    <div style={{ color: 'black', fontSize: '16px', ...props.style }}>
      {props.children}
    </div>
  );
}

function Overlay(props) {
  const classes = useStyles();
  const {
    examToJSON,
    resetJsPDF,
    addQuestionToPdf,
    savePdf,
    getQuestionHeightEstimate,
    fillPdfWithQuestions,
  } = usePdfHook();
  const [state, _setState] = useState({
    // askLanguage: true,
    // askTeacher: true,
    settings: {
      showIncorrect: false,
      showDetailsSide: false,
      fileType: 'PDF',
      teacher: 'الكل',
      language: 'العربية',
    },
    active: false,
    teachers: [],
    languages: [],
    exams: [],
    downloading: false,
    progressValue: 0,
    progressMessage: '',
  });
  const _state = useRef(state);
  const setState = (data) => {
    _state.current = data;
    _setState(data);
  };

  useEffect(() => {
    document.addEventListener('request-download', onRequestDownload);
    // let hidden = document.querySelector('.hidden-mxd-text');
    let hidden = document.querySelector('.hidden-mxd');
    html2canvas(hidden, {
      width: hidden.offsetWidth,
      height: hidden.offsetHeight,
    }).then((canvas) => {
      console.log(canvas);
      console.log(canvas.toDataURL('image/png'));
    });

    return () => {
      document.removeEventListener('request-download', onRequestDownload);
    };
  }, []);

  const acquireDataFromExamIndex = (index) => {
    let row = document.querySelector(
      `#ctl00_MainContentPlaceHolder_gridData > tbody > tr:nth-child(${
        index + 1
      })`
    );

    // Get language from subject
    let language = row.querySelector('td:nth-child(10)');
    language = language.textContent.includes('الإنجليزية') ? 'EN' : 'AR';

    // Get teacher
    let teacher = row.querySelector('td:nth-child(7)');
    teacher = teacher.textContent.trim();

    return { language: language, teacher: teacher };
  };

  const onRequestDownload = (event) => {
    // let question = {
    //   title: 'غلاف بروتيني يحيط بالفيروس يسمى :',
    //   answers: [
    //     { answer: 'الغشاء البلازمي', checked: false, correct: null },
    //     { answer: 'السيتوبلازم', checked: false, correct: null },
    //     { answer: 'الجدار الخلوي', checked: false, correct: null },
    //     { answer: 'المحفظة', checked: true, correct: true },
    //   ],
    // };

    // addQuestionToPdf(question, false, 'AR', 0).then(() => {
    //   savePdf();
    // });

    // return;

    console.log(`Download request: ${JSON.stringify(state.settings)}`);
    let exams = event.detail.exams;
    if (exams.length == 0) return;

    let datas = exams.map((exam) => acquireDataFromExamIndex(exam));
    let teachers = [...new Set(datas.map((data) => data.teacher))];
    let languages = [...new Set(datas.map((data) => data.language))];

    setState({
      ..._state.current,
      active: true,
      languages: languages,
      teachers: teachers,
      exams: exams,
    });
  };

  const onCancel = () => {
    console.log(`Cancelling: ${JSON.stringify(state.settings)}`);
    setState({
      ...state,
      active: false,
      teachers: [],
      languages: [],
      exams: [],
    });
  };

  // TODO: Put in PDF hook
  const calculateQuestionClusters = (questions) => {
    let clusters = [];
    let current = [];
    let total = 0;
    let page = window.jsPDF.internal.pageSize.getHeight();

    console.log(`Calculating clusters:`);
    console.log(questions);
    for (let question of questions) {
      let height = getQuestionHeightEstimate(question);
      console.log(`Height for ${question.title} is ${height}`);

      if (total + height > page) {
        clusters.push(current);
        console.log(`New cluster`);
        current = [];
        total = 0;
      }

      total += height;
      current.push(question);
    }

    clusters.push(current);

    return clusters;
  };

  const onDownload = async () => {
    setState({
      ...state,
      downloading: true,
      progressValue: 0,
      progressMessage: 'Collecting exam data',
    });
    // Set language to first language from selected exams
    let language = state.languages[0];

    // If there are multiple languages in the selected exams, refer to language setting
    if (state.languages.length > 1)
      language = state.settings.language == 'الإنجليزية' ? 'EN' : 'AR';

    // Only filter exams with same language
    state.exams = state.exams.filter((exam) => {
      let data = acquireDataFromExamIndex(exam);
      return data.language == language;
    });

    // If the selected exams have more than one teachers,
    // and the teacher setting does not include all teachers
    if (state.teachers.length > 1 && state.settings.teacher != 'الكل') {
      // Only filter exams with same teacher
      state.exams = state.exams.filter((exam) => {
        let data = acquireDataFromExamIndex(exam);
        return data.teacher == state.settings.teacher;
      });
    }

    state.exams.map((exam) => {
      let data = acquireDataFromExamIndex(exam);

      console.log(`${data.teacher} -> ${data.language}`);
    });

    // Collect json data from all selected exams
    let json = [];

    // let tokens = [];
    // for (let i = 0; i < state.exams.length; i++) {
    //   tokens[i] = {};
    // }

    // let aa = 0;
    // let promises = state.exams.map((exam, index) => {
    //   return {
    //     promise: examToJSON(
    //       exam,
    //       !state.settings.showIncorrect,
    //       (index) => {
    //         // console.log(`${exam} done`);
    //         aa += 1;
    //         setState({
    //           ..._state.current,
    //           progressValue: Math.round((aa / state.exams.length) * 100),
    //           progressMessage: `Collecting exam data for exam ${aa}/${state.exams.length}`,
    //         });
    //       },
    //       tokens[index]
    //     ),
    //     exam: exam,
    //   };
    // });
    // console.log(promises);
    // await Promise.all(
    //   promises.map(async ({ promise, exam }) => {
    //     // console.log(_state.current.downloading);
    //     // console.log(state.downloading);
    //     if (!_state.current.downloading) {
    //       console.log(`REJECTED ${exam}, CANCELLED`);
    //       return;
    //     }
    //     console.log('BEFORE AWAITING');
    //     await promise;
    //     console.log(_state.current.downloading);
    //     console.log(state.downloading);
    //     if (!_state.current.downloading) {
    //       console.log(`REJECTED ${exam}, CANCELLED AFTER AWAITING`);
    //       console.log(tokens);
    //       return;
    //     }
    //     console.log(`DONE ${exam}`);
    //   })
    // );

    for (let exam of state.exams) {
      if (!_state.current.downloading) {
        console.log(
          `Cancelled downloading at ${json.length}/${state.exams.length}`
        );
        return;
      }

      let promise = examToJSON(exam, !state.settings.showIncorrect, (index) => {
        setState({
          ..._state.current,
          progressValue: Math.round((json.length / state.exams.length) * 100),
          progressMessage: `Collecting exam data for exam ${json.length}/${state.exams.length}`,
        });
      });

      json.push(await promise);
    }

    if (!_state.current.downloading) {
      console.log(
        `Cancelled downloading after finishing all ${state.exams.length} JSONs`
      );
      return;
    }

    console.log(json);
    json = json.flat();
    console.log(json);

    // let total = 0;
    // let jsonData = (
    //   await Promise.allSettled(
    //     state.exams.map((exam) =>
    //       examToJSON(exam, !state.settings.showIncorrect, (index) => {
    //         total += 1;
    //         setState({
    //           ..._state.current,
    //           progressValue: Math.round((total / state.exams.length) * 100),
    //           progressMessage: `Collecting exam data for exam ${total}/${state.exams.length}`,
    //         });
    //       })
    //     )
    //   )
    // ).flat();

    resetJsPDF();

    // 6.45x faster than previous method
    let clusters = calculateQuestionClusters(json);
    console.log(json);
    console.log(clusters);
    // for (let i = 0; i < clusters.length; i++) {
    //   await fillPdfWithQuestions(
    //     clusters[i],
    //     state.settings.showDetailsSide,
    //     language
    //   );
    //   if (i + 1 != clusters.length) {
    //     window.jsPDF.addPage();
    //   }
    // }

    for (let i = 0; i < clusters.length; i++) {
      let cluster = clusters[i];
      if (!_state.current.downloading) {
        console.log(
          `Cancelled downloading at cluster ${i + 1}/${clusters.length}`
        );
        return;
      }

      console.log(
        `running cluster with ${cluster.length} questions\n${JSON.stringify(
          cluster
        )}`
      );

      await fillPdfWithQuestions(
        clusters[i],
        state.settings.showDetailsSide,
        language
      );

      if (i + 1 != clusters.length) {
        window.jsPDF.addPage();
      }

      let images = clusters[i].filter((item) => item.image.source != undefined);

      setState({
        ..._state.current,
        progressValue: Math.round(((i + 1) / clusters.length) * 100),
        progressMessage: `Parsing cluster ${i + 1}/${clusters.length} with ${
          clusters[i].length
        } questions${
          images.length != 0
            ? `\n(fetching ${images.length} image(s) from background script)`
            : ''
        }`,
      });
    }

    if (!_state.current.downloading) {
      console.log(
        `Cancelled downloading after finishing all ${clusters.lenght} clusters`
      );
      return;
    }
    // let origin = 0;
    // let completed = 0;
    // for (let question of json) {
    //   if (!_state.current.downloading) {
    //     console.log(
    //       `Cancelled downloading at question ${completed.length}/${state.exams.length}`
    //     );
    //     return;
    //   }

    //   console.log(`running question: ${JSON.stringify(question)}`);

    //   origin = await addQuestionToPdf(
    //     question,
    //     state.settings.showDetailsSide,
    //     language,
    //     origin
    //   );

    //   completed += 1;
    //   setState({
    //     ..._state.current,
    //     progressValue: Math.round((completed / json.length) * 100),
    //     progressMessage: `Parsing question ${completed}/${json.length}`,
    //   });
    // }

    // if (!_state.current.downloading) {
    //   console.log(
    //     `Cancelled downloading after finishing all ${state.exams.length} questions`
    //   );
    //   return;
    // }

    savePdf();

    // const addQuestionToPdf = async (question, answerOnSide, language, origin) => {

    // Create pdf
    // pdfFromJSON(
    //   json,
    //   state.settings.showDetailsSide,
    //   language,
    //   (completed, total) => {
    //     setState({
    //       ..._state.current,
    //       progressValue: Math.round((completed / total) * 100),
    //       progressMessage: `Parsing question ${completed}/${total}`,
    //     });
    //   }
    // );
  };

  const onProgressCancel = () => {
    resetJsPDF(); // Reset jsPDF
    setState({
      ...state,
      downloading: false,
      progressValue: 0,
      progressMessage: '',
    });
  };

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
        display: state.active ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'ltr',
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
        {!state.downloading ? (
          <div
            style={{
              width: '443px',
              height: 'max-content',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Container style={{ justifyContent: 'center ' }}>
              <Label style={{ fontSize: '18px' }}>
                Downloading {state.exams.length} exam(s)
              </Label>
            </Container>

            <Divider
              sx={{
                marginTop: '10px',
                marginBottom: '10px',
                width: '100%',
                backgroundColor: '#4C4F53',
              }}
            />

            {/* File type */}
            <Container>
              <Label style={{ marginRight: '5px' }}>File type:</Label>
              <Menu
                id="file-type"
                options={['PDF', 'JSON']}
                default={'PDF'}
                value={state.settings.fileType}
                width="265px"
                onChange={(value) => {
                  setState({
                    ...state,
                    settings: {
                      ...state.settings,
                      fileType: value,
                    },
                  });
                }}
              />
              {/* <Select
                id="file-type"
                options={['PDF', 'JSON']}
                default={'PDF'}
                value={state.settings.fileType}
                onChange={(value) => {
                  setState({
                    ...state,
                    settings: {
                      ...state.settings,
                      fileType: value,
                    },
                  });
                }}
              /> */}
            </Container>

            {(state.teachers.length > 1 || state.languages.length > 1) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  width: '100%',
                }}
              >
                <Divider
                  sx={{
                    marginTop: '10px',
                    width: '100%',
                    backgroundColor: '#4C4F53',
                  }}
                />

                {state.teachers.length > 1 && (
                  <Container style={{ marginTop: '10px' }}>
                    <Label style={{ marginRight: '5px ' }}>Teacher:</Label>

                    <Menu
                      id="teacher"
                      options={['الكل', ...state.teachers]}
                      default={'الكل'}
                      value={state.settings.teacher}
                      width="265px"
                      onChange={(value) => {
                        setState({
                          ...state,
                          settings: {
                            ...state.settings,
                            teacher: value,
                          },
                        });
                      }}
                    />
                  </Container>
                )}

                {state.languages.length > 1 && (
                  <Container style={{ marginTop: '10px' }}>
                    <Label style={{ marginRight: '5px ' }}>
                      Exam Language:
                    </Label>
                    <Menu
                      id="language"
                      options={['العربية', 'الإنجليزية']}
                      default={'العربية'}
                      value={state.settings.language}
                      onChange={(value) => {
                        setState({
                          ...state,
                          settings: {
                            ...state.settings,
                            language: value,
                          },
                        });
                      }}
                      width="265px"
                    />
                  </Container>
                )}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <Divider
                sx={{
                  marginTop: '10px',
                  width: '100%',
                  backgroundColor: '#4C4F53',
                }}
              />

              {/* Show incorrect */}
              <Container
                style={{
                  marginTop: '10px',
                }}
              >
                <Checkbox
                  sx={{
                    width: 24,
                    height: 24,
                  }}
                  checked={state.showIncorrect}
                  onChange={(event, value) => {
                    setState({
                      ...state,
                      settings: {
                        ...state.settings,
                        showIncorrect: value,
                      },
                    });
                  }}
                />
                <Label
                  style={{
                    marginLeft: '5px',
                  }}
                >
                  Show incorrect answers from initial exam entry
                </Label>
              </Container>

              {/* Show details on side */}
              <Container
                style={{
                  marginTop: '10px',
                }}
              >
                <Checkbox
                  sx={{
                    width: 24,
                    height: 24,
                  }}
                  checked={state.showDetailsSide}
                  onChange={(event, value) => {
                    setState({
                      ...state,
                      settings: {
                        ...state.settings,
                        showDetailsSide: value,
                      },
                    });
                  }}
                />
                <Label
                  style={{
                    marginLeft: '5px',
                  }}
                >
                  Show answer details on the side for effective studying
                </Label>
              </Container>

              <Divider
                sx={{
                  marginTop: '10px',
                  width: '100%',
                  backgroundColor: '#4C4F53',
                }}
              />

              {/* Download button */}
              <Container
                style={{
                  justifyContent: 'center',
                }}
              >
                <Button
                  className="overlay-btn"
                  sx={{
                    width: '150px',
                    fontSize: '14px',
                    borderRadius: '0px',
                    marginTop: '10px',
                    marginRight: '5px',
                  }}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  className="overlay-btn"
                  sx={{
                    width: '150px',
                    fontSize: '14px',
                    borderRadius: '0px',
                    marginTop: '10px',
                  }}
                  onClick={onDownload}
                >
                  Download
                </Button>
              </Container>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '443px',
              height: 'max-content',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'black',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                textOverflow: 'ellipsis',
                width: '100%',
              }}
            >
              {state.progressMessage.replace('<br/>', '\n')}
            </div>

            {/* <LinearProgressWithLabel value={50} /> */}
            <LinearProgress
              variant="determinate"
              value={state.progressValue}
              sx={{
                width: '100%',
                height: '10px',
                marginTop: '10px',
                transition: 'none',
              }}
              className={classes.root}
            />

            <Button
              className="overlay-btn"
              sx={{
                width: '150px',
                fontSize: '14px',
                borderRadius: '0px',
                marginTop: '15px',
              }}
              onClick={onProgressCancel}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Overlay;
