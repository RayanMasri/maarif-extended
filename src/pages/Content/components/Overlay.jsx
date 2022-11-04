import React, { useEffect, useState, useRef } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import usePdfHook from '../hooks/PdfHook.jsx';
import LinearProgress from '@mui/material/LinearProgress';
import { makeStyles } from '@mui/styles';

import Holder from './Holder.jsx';
import html2canvas from 'html2canvas';
import { Container } from './overlay/Container';
import { Label } from './overlay/Label';
import { Dropdown } from './overlay/Dropdown';
import { Field } from './overlay/Field';
import { Option } from './overlay/Option';
import { ButtonOverlay } from './overlay/ButtonOverlay';
import { ColorPicker } from './overlay/ColorPicker';
import { SortableGrid } from './overlay/SortableGrid';

const useStyles = makeStyles({
  root: {
    transition: 'none',
  },
});

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
    type: null,
    teachers: [],
    languages: [],
    exams: [],
    datas: [],
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
    document.addEventListener('request-download', onRequest);
    document.addEventListener('request-retake', onRequest);

    let hidden = document.querySelector('.hidden-mxd');
    html2canvas(hidden, {
      width: hidden.offsetWidth,
      height: hidden.offsetHeight,
    }).then((canvas) => {
      console.log(canvas.toDataURL('image/png'));
    });

    return () => {
      document.removeEventListener('request-download', onRequest);
      document.addEventListener('request-retake', onRequest);
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

    let name = row.querySelector('td:nth-child(2)');
    name = name.textContent.trim();

    return { language: language, teacher: teacher, name: name };
  };

  const onRequest = (event) => {
    let exams = event.detail.exams;
    if (exams.length == 0) return;

    let datas = exams.map((exam) => acquireDataFromExamIndex(exam));
    let teachers = [...new Set(datas.map((data) => data.teacher))];
    let languages = [...new Set(datas.map((data) => data.language))];

    setState({
      ..._state.current,
      active: true,
      type: event.type,
      languages: languages,
      teachers: teachers,
      exams: exams,
      datas: datas,
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
      datas: [],
    });
  };

  // TODO: Put in PDF hook
  const calculateQuestionClusters = (questions) => {
    let clusters = [];
    let current = [];
    let total = 0;
    let page = window.jsPDF.internal.pageSize.getHeight();

    for (let question of questions) {
      let height = getQuestionHeightEstimate(question);

      if (total + height > page) {
        clusters.push(current);
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

    json = json.flat();

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

      console.log(`Cluster ${i + 1}: ${cluster.length} questions`);

      await fillPdfWithQuestions(
        clusters[i],
        state.settings.showDetailsSide,
        language
      );

      console.log(`Cluster ${i + 1}: Done`);

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

  const getActive = () => {
    switch (state.type) {
      case 'request-download':
        if (!state.downloading) {
          return (
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
                  width: '100%',
                  backgroundColor: '#4C4F53',
                }}
              />

              <div
                style={{
                  width: '100%',
                  height: 'max-content',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
                className="overlay-options-container"
              >
                {/* File type */}
                <Dropdown
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
                  style={{ marginTop: '10px' }}
                >
                  File type:
                </Dropdown>

                <Divider
                  sx={{
                    marginTop: '10px',
                    width: '100%',
                    backgroundColor: '#4C4F53',
                  }}
                />

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
                    <Holder name="Filters" id="filters-dropdown" hierarchy={0}>
                      {state.teachers.length > 1 && (
                        <Dropdown
                          id="teacher"
                          options={['الكل', ...state.teachers]}
                          default={'الكل'}
                          value={state.settings.teacher}
                          onChange={(value) => {
                            setState({
                              ...state,
                              settings: {
                                ...state.settings,
                                teacher: value,
                              },
                            });
                          }}
                        >
                          Teacher:
                        </Dropdown>
                      )}

                      {state.languages.length > 1 && (
                        <Dropdown
                          style={{ marginTop: '10px' }}
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
                        >
                          Exam Language:
                        </Dropdown>
                      )}
                    </Holder>

                    <Divider
                      sx={{
                        width: '100%',
                        backgroundColor: '#4C4F53',
                      }}
                    />
                  </div>
                )}

                <Option
                  style={{ marginTop: '10px' }}
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
                >
                  Show wrong answers
                </Option>

                <Option
                  style={{ marginTop: '5px' }}
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
                >
                  Show answers on the side
                </Option>

                <Divider
                  sx={{
                    marginTop: '10px',
                    width: '100%',
                    backgroundColor: '#4C4F53',
                  }}
                />

                <Holder
                  name="Advanced Options"
                  id="advanced-dropdown"
                  hierarchy={0}
                  noBottomMargin
                >
                  <Dropdown
                    id="strong-titles"
                    options={['Original titles', 'All titles', 'Disabled']}
                    default={'Original titles'}
                  >
                    Strong titles:
                  </Dropdown>
                  <Divider
                    sx={{
                      marginTop: '10px',
                      width: '100%',
                      backgroundColor: '#4C4F53',
                    }}
                  />
                  <Option style={{ marginTop: '10px' }}>
                    Grayscale images
                  </Option>
                  <Option style={{ marginTop: '5px' }}>
                    Developer debugging
                  </Option>

                  <Divider
                    sx={{
                      marginTop: '10px',
                      width: '100%',
                      backgroundColor: '#4C4F53',
                    }}
                  />

                  <Holder
                    name="Duplicate removal"
                    id="duplicate-dropdown"
                    parent="advanced-dropdown"
                    hierarchy={1}
                    noNameMargin
                  >
                    <Option>Remove duplicates</Option>
                    <Divider
                      sx={{
                        marginTop: '10px',
                        width: '100%',
                        backgroundColor: '#4C4F53',
                      }}
                    />
                    <Option style={{ marginTop: '10px' }}>Images</Option>
                    <Dropdown
                      id="image-comparison"
                      options={['Exact pixels', 'Approximate pixels']}
                      default={'Exact pixels'}
                      style={{ marginTop: '5px' }}
                    >
                      Compare by:
                    </Dropdown>
                    <Field style={{ marginTop: '5px' }} postfix={'%'}>
                      Accuracy threshold:
                    </Field>
                    <Divider
                      sx={{
                        marginTop: '10px',
                        width: '100%',
                        backgroundColor: '#4C4F53',
                      }}
                    />
                    <Option style={{ marginTop: '10px' }}>
                      Titles & answers
                    </Option>
                    <Dropdown
                      id="text-comparison"
                      options={['Exact text', 'Approximate text']}
                      default={'Exact text'}
                      style={{ marginTop: '5px' }}
                    >
                      Compare by:
                    </Dropdown>
                    <Field style={{ marginTop: '5px' }} postfix={'%'}>
                      Accuracy threshold:
                    </Field>
                  </Holder>

                  <Divider
                    sx={{
                      width: '100%',
                      backgroundColor: '#4C4F53',
                    }}
                  />

                  <Holder
                    name="Resolution & Compression"
                    id="resolution-dropdown"
                    parent="advanced-dropdown"
                    hierarchy={1}
                    noNameMargin
                  >
                    <Field postfix={'x'}>Resolution:</Field>
                    <Divider
                      sx={{
                        marginTop: '10px',
                        width: '100%',
                        backgroundColor: '#4C4F53',
                      }}
                    />
                    <Option style={{ marginTop: '10px' }}>Compression</Option>
                    <Field style={{ marginTop: '5px' }} postfix={'%'}>
                      Compression rate:
                    </Field>
                  </Holder>

                  <Divider
                    sx={{
                      width: '100%',
                      backgroundColor: '#4C4F53',
                    }}
                  />

                  <Holder
                    name="Customizability & presets"
                    id="customize-dropdown"
                    parent="advanced-dropdown"
                    hierarchy={1}
                  >
                    <Dropdown
                      id="preset-style"
                      options={['Original', 'Basic', 'Custom']}
                      default={'Original'}
                    >
                      Preset:
                    </Dropdown>
                    <Field postfix={'px'} style={{ marginTop: '5px' }}>
                      Title font size:
                    </Field>
                    <ColorPicker style={{ marginTop: '5px' }}>
                      Title color:
                    </ColorPicker>
                    <Field postfix={'px'} style={{ marginTop: '5px' }}>
                      Checkbox spacing:
                    </Field>
                    <Field postfix={'px'} style={{ marginTop: '5px' }}>
                      Spacing between answers & titles:
                    </Field>
                    <Dropdown
                      id="preset-style"
                      options={['Pixels', 'Lines']}
                      default={'Pixels'}
                      style={{ marginTop: '5px' }}
                    >
                      Spacing between questions:
                    </Dropdown>
                    <Field postfix={'px'} style={{ marginTop: '5px' }}>
                      Value:
                    </Field>
                  </Holder>

                  <Divider
                    sx={{
                      width: '100%',
                      backgroundColor: '#4C4F53',
                    }}
                  />

                  <Holder
                    name="Exam order"
                    id="order-dropdown"
                    parent="advanced-dropdown"
                    hierarchy={1}
                  >
                    <Dropdown
                      id="order-groups"
                      options={['Name', 'Language', 'Teacher', 'Subject']}
                      default={'Name'}
                    >
                      Group by:
                    </Dropdown>

                    <SortableGrid
                      datas={state.datas}
                      style={{ marginTop: '10px' }}
                    />

                    {/* This allows margin-bottom from the grid to push down on the dropdown */}
                    <div>&nbsp;</div>
                  </Holder>
                </Holder>

                <Divider
                  sx={{
                    width: '100%',
                    backgroundColor: '#4C4F53',
                  }}
                />

                <Holder name="Preview" id="preview-dropdown" hierarchy={0}>
                  <div
                    style={{
                      width: '100%',
                      height: '250px',
                      backgroundColor: 'white',
                    }}
                  ></div>
                </Holder>
              </div>

              <Divider
                sx={{
                  width: '100%',
                  backgroundColor: '#4C4F53',
                }}
              />

              {/* Download button */}

              {/* </div> */}

              <Container
                style={{
                  justifyContent: 'center',
                  margin: '0 -5px',
                }}
              >
                <ButtonOverlay onClick={onCancel} sx={{ margin: '10px 5px' }}>
                  Cancel
                </ButtonOverlay>
                <ButtonOverlay onClick={onDownload} sx={{ margin: '10px 5px' }}>
                  Download
                </ButtonOverlay>
              </Container>
            </div>
          );
        } else {
          return (
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
          );
        }
      case 'request-retake':
        break;
    }
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
        {getActive()}
      </div>
    </div>
  );
}

export default Overlay;
