import React, { useEffect, useState, useRef } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import usePdfHook from '../../hooks/PdfHook.jsx';
import LinearProgress from '@mui/material/LinearProgress';
import { makeStyles } from '@mui/styles';

import Holder from '../Holder.jsx';
import html2canvas from 'html2canvas';
import { Container } from './Container';
import { Label } from './Label';
import { Dropdown } from './Dropdown';
import { Field } from './Field';
import { Option } from './Option';
import { ButtonOverlay } from './ButtonOverlay';
import { ColorPicker } from './ColorPicker';
import { SortableGrid } from './SortableGrid';

import useFilterHook from '../../hooks/FilterHook.jsx';

export default function DownloadOverlay(props) {
  const {
    examToJSON,
    resetJsPDF,
    addQuestionToPdf,
    savePdf,
    getQuestionHeightEstimate,
    fillPdfWithQuestions,
  } = usePdfHook();
  const { filterExams } = useFilterHook();

  const [state, setState] = useState({
    inputLength: 0,
  });

  // TODO: Transfer this algorithm to Overlay.jsx
  useEffect(() => {
    if (props.requested.datas.length == 0) return;
    if (state.inputLength == props.requested.datas.length) return;

    setState({
      ...state,
      inputLength: props.requested.datas.length,
    });

    props.onSettingChange('settings.examOrder.datas', undefined);

    console.log('Changed');
  }, [props.requested.datas.length]);

  const filterBoolean = (item) => {
    let subject =
      props.settings.subject == 'الكل' ||
      item.subject == props.settings.subject;
    let teacher =
      props.settings.teacher == 'الكل' ||
      item.teacher == props.settings.teacher;
    let flipped = item.language == 'AR' ? 'العربية' : 'الإنجليزية';
    let language = flipped == props.settings.language;

    return subject && teacher && language;
  };

  // TODO: Come back to this later
  const onDownload = async () => {
    let datas = props.settings.examOrder.datas || props.requested.datas;
    let exams = filterExams(datas, props.settings);
    console.log(exams);
    return;
    props.onProgress({
      downloading: true,
      progress: {
        value: 0,
        message: 'Collecting exam data',
      },
    });

    // Collect json data from all selected exams
    let json = [];

    console.log(exams);
    for (let exam of exams) {
      // let index = getExamIndexByName(exam.name);
      // let promise = examToJSON(exam, !props.settings.showWrong, (index) => {
      //   props.onProgress({
      //     ...props.parent.download,
      //     progress: {
      //       value: Math.round((json.length / exams.length) * 100),
      //       message: `Collecting exam data for exam ${json.length}/${exams.length}`,
      //     },
      //   });
      // });

      console.log(exam);
      console.log(exam.index);
      let promise = examToJSON(exam.index, !props.settings.showWrong);

      json.push(await promise);

      props.onProgress({
        ...props.parent.download,
        progress: {
          value: Math.round((json.length / exams.length) * 100),
          message: `Collecting exam data for exam ${json.length}/${exams.length}`,
        },
      });

      if (!props.parent.download.downloading)
        return console.log(
          `Cancelled ${json.length == exams.length ? 'un' : ''}successfully`
        );
    }

    if (!props.parent.download.downloading)
      return console.log('Cancelled after loading');

    json = json.flat();

    resetJsPDF();

    // 6.45x faster than previous method
    let clusters = calculateQuestionClusters(json);

    for (let i = 0; i < clusters.length; i++) {
      let cluster = clusters[i];
      if (!props.parent.download.downloading)
        return console.log(
          `Cancelled ${i + 1 == clusters.length ? 'un' : ''}successfully`
        );

      console.log(`Cluster ${i + 1}: ${cluster.length} questions`);

      await fillPdfWithQuestions(
        clusters[i],
        props.settings.sideDetails,
        // language
        'AR'
      );

      console.log(`Cluster ${i + 1}: Done`);

      if (i + 1 != clusters.length) {
        window.jsPDF.addPage();
      }

      let images = clusters[i].filter((item) => item.image.source != undefined);

      props.onProgress({
        ...props.parent.download,
        value: Math.round(((i + 1) / clusters.length) * 100),
        message: `Parsing cluster ${i + 1}/${clusters.length} with ${
          clusters[i].length
        } questions${
          images.length != 0
            ? `\n(fetching ${images.length} image(s) from background script)`
            : ''
        }`,
      });
    }

    if (!props.parent.download.downloading)
      return console.log('Cancelled after finishing PDF');

    savePdf();
  };

  const forceUpdateNestedHolder = (holder) => {
    document.dispatchEvent(
      new CustomEvent('force-update-advanced-dropdown', {
        detail: { hierarchyDifference: 1 },
      })
    );
    document.dispatchEvent(
      new CustomEvent(`force-update-${holder}`, {
        detail: { hierarchyDifference: 0 },
      })
    );
  };

  return (
    <div
      style={{
        width: '443px',
        height: 'max-content',
        display: props.hidden ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container style={{ justifyContent: 'center ' }}>
        <Label style={{ fontSize: '18px' }}>
          Downloading {props.requested.exams.length} exam(s)
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
          value={props.settings.file}
          onChange={(value) => props.onSettingChange('settings.file', value)}
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

        {props.requested.uniques.teachers.length +
          props.requested.uniques.languages.length +
          props.requested.uniques.subjects.length >
          3 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <Holder name="Filters" id="filters-dropdown" hierarchy={0} open>
              {props.requested.uniques.teachers.length > 1 && (
                <Dropdown
                  id="teacher"
                  options={['الكل', ...props.requested.uniques.teachers]}
                  default={'الكل'}
                  value={props.settings.teacher}
                  onChange={(value) =>
                    props.onSettingChange('settings.teacher', value)
                  }
                >
                  Teacher:
                </Dropdown>
              )}

              {props.requested.uniques.languages.length > 1 && (
                <Dropdown
                  style={{ marginTop: '10px' }}
                  id="language"
                  options={['العربية', 'الإنجليزية']}
                  default={'العربية'}
                  value={props.settings.language}
                  onChange={(value) =>
                    props.onSettingChange('settings.language', value)
                  }
                >
                  Exam Language:
                </Dropdown>
              )}

              {props.requested.uniques.subjects.length > 1 && (
                <Dropdown
                  style={{ marginTop: '10px' }}
                  id="subject"
                  options={['الكل', ...props.requested.uniques.subjects]}
                  default={'الكل'}
                  value={props.settings.subject}
                  onChange={(value) =>
                    props.onSettingChange('settings.subject', value)
                  }
                >
                  Exam Subject:
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
          checked={props.settings.showWrong}
          onChange={(value) =>
            props.onSettingChange('settings.showWrong', value)
          }
        >
          Show wrong answers
        </Option>

        <Option
          style={{ marginTop: '5px' }}
          checked={props.settings.sideDetails}
          onChange={(value) =>
            props.onSettingChange('settings.sideDetails', value)
          }
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
            value={props.settings.strongTitles}
            onChange={(value) =>
              props.onSettingChange('settings.strongTitles', value)
            }
          >
            Strong titles:
          </Dropdown>

          <Dropdown
            style={{ marginTop: '10px' }}
            id="grayscale"
            options={['None', 'Images', 'Questions', 'All']}
            default={'None'}
            value={props.settings.grayscale}
            onChange={(value) =>
              props.onSettingChange('settings.grayscale', value)
            }
          >
            Grayscale:
          </Dropdown>

          <Option
            style={{ marginTop: '5px' }}
            checked={props.settings.devDebug}
            onChange={(value) =>
              props.onSettingChange('settings.devDebug', value)
            }
          >
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
            <Option
              checked={props.settings.duplicates.removal}
              onChange={(value) => {
                forceUpdateNestedHolder('duplicate-dropdown');
                props.onSettingChange('settings.duplicates.removal', value);
              }}
            >
              Remove duplicates
            </Option>
            <Divider
              sx={{
                marginTop: '10px',
                width: '100%',
                backgroundColor: '#4C4F53',
                display: props.settings.duplicates.removal ? 'block' : 'none',
              }}
            />
            <Option
              style={{ marginTop: '10px' }}
              checked={props.settings.duplicates.images.removal}
              onChange={(value) => {
                forceUpdateNestedHolder('duplicate-dropdown');
                props.onSettingChange(
                  'settings.duplicates.images.removal',
                  value
                );
              }}
              hidden={!props.settings.duplicates.removal}
            >
              Images
            </Option>
            <Dropdown
              id="image-comparison"
              options={['Exact pixels', 'Approximate pixels']}
              default={'Exact pixels'}
              style={{ marginTop: '5px' }}
              value={props.settings.duplicates.images.method}
              onChange={(value) => {
                forceUpdateNestedHolder('duplicate-dropdown');
                props.onSettingChange(
                  'settings.duplicates.images.method',
                  value
                );
              }}
              hidden={
                !props.settings.duplicates.removal ||
                !props.settings.duplicates.images.removal
              }
            >
              Compare by:
            </Dropdown>
            <Field
              style={{ marginTop: '5px' }}
              postfix={'%'}
              value={props.settings.duplicates.images.threshold}
              onChange={(value) => {
                forceUpdateNestedHolder('duplicate-dropdown');
                props.onSettingChange(
                  'settings.duplicates.images.threshold',
                  value
                );
              }}
              hidden={
                !props.settings.duplicates.removal ||
                !props.settings.duplicates.images.removal
              }
            >
              Accuracy threshold:
            </Field>
            <Divider
              sx={{
                marginTop: '10px',
                width: '100%',
                backgroundColor: '#4C4F53',
                display: props.settings.duplicates.removal ? 'block' : 'none',
              }}
            />
            <Option
              style={{ marginTop: '10px' }}
              checked={props.settings.duplicates.questions.removal}
              onChange={(value) => {
                forceUpdateNestedHolder('duplicate-dropdown');
                props.onSettingChange(
                  'settings.duplicates.questions.removal',
                  value
                );
              }}
              hidden={!props.settings.duplicates.removal}
            >
              Questions
            </Option>
            <Dropdown
              id="text-comparison"
              options={['Exact text', 'Approximate text']}
              default={'Exact text'}
              style={{ marginTop: '5px' }}
              value={props.settings.duplicates.questions.method}
              onChange={(value) => {
                forceUpdateNestedHolder('duplicate-dropdown');
                props.onSettingChange(
                  'settings.duplicates.questions.method',
                  value
                );
              }}
              hidden={
                !props.settings.duplicates.removal ||
                !props.settings.duplicates.questions.removal
              }
            >
              Compare by:
            </Dropdown>
            <Field
              style={{ marginTop: '5px' }}
              postfix={'%'}
              value={props.settings.duplicates.questions.threshold}
              onChange={(value) => {
                forceUpdateNestedHolder('duplicate-dropdown');
                props.onSettingChange(
                  'settings.duplicates.questions.threshold',
                  value
                );
              }}
              hidden={
                !props.settings.duplicates.removal ||
                !props.settings.duplicates.questions.removal
              }
            >
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
            <Field
              postfix={'x'}
              value={props.settings.resolution}
              onChange={(value) =>
                props.onSettingChange('settings.resolution', value)
              }
            >
              Resolution:
            </Field>
            <Divider
              sx={{
                marginTop: '10px',
                width: '100%',
                backgroundColor: '#4C4F53',
              }}
            />
            <Option
              style={{ marginTop: '10px' }}
              checked={props.settings.compression.enabled}
              onChange={(value) =>
                props.onSettingChange('settings.compression.enabled', value)
              }
            >
              Compression
            </Option>
            <Field
              style={{ marginTop: '5px' }}
              postfix={'%'}
              value={props.settings.compression.rate}
              onChange={(value) =>
                props.onSettingChange('settings.compression.rate', value)
              }
            >
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
              // options={['Original', 'Basic', 'Custom']}
              options={['Original', 'Basic']}
              default={'Original'}
              value={props.settings.customization.preset}
              onChange={(value) =>
                props.onSettingChange('settings.customization.preset', value)
              }
            >
              Preset:
            </Dropdown>
            {/* <Field
              postfix={'px'}
              style={{ marginTop: '5px' }}
              value={props.settings.customization.title.size}
              onChange={(value) =>
                props.onSettingChange(
                  'settings.customization.title.size',
                  value
                )
              }
            >
              Title font size:
            </Field>
            <ColorPicker
              style={{ marginTop: '5px' }}
              value={props.settings.customization.title.color}
              onChange={(value) =>
                props.onSettingChange(
                  'settings.customization.title.color',
                  value
                )
              }
            >
              Title color:
            </ColorPicker>
            <Field
              postfix={'px'}
              style={{ marginTop: '5px' }}
              value={props.settings.customization.spacing.checkbox}
              onChange={(value) =>
                props.onSettingChange(
                  'settings.customization.spacing.checkbox',
                  value
                )
              }
            >
              Checkbox spacing:
            </Field>
            <Field
              postfix={'px'}
              style={{ marginTop: '5px' }}
              value={props.settings.customization.spacing.titleBottom}
              onChange={(value) =>
                props.onSettingChange(
                  'settings.customization.spacing.titleBottom',
                  value
                )
              }
            >
              Spacing between answers & titles:
            </Field>
            <Dropdown
              id="preset-style"
              options={['Pixels', 'Lines']}
              default={'Pixels'}
              style={{ marginTop: '5px' }}
              value={props.settings.customization.spacing.questions.method}
              onChange={(value) =>
                props.onSettingChange(
                  'settings.customization.spacing.questions.method',
                  value
                )
              }
            >
              Spacing between questions:
            </Dropdown>
            <Field
              postfix={'px'}
              style={{ marginTop: '5px' }}
              value={props.settings.customization.spacing.questions.value}
              onChange={(value) =>
                props.onSettingChange(
                  'settings.customization.spacing.questions.value',
                  value
                )
              }
            >
              Value:
            </Field> */}
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
              value={props.settings.examOrder.groupBy}
              onChange={(value) => {
                props.onSettingChange('settings.examOrder.groupBy', value);
                console.log(props.settings.examOrder.groupBy);

                forceUpdateNestedHolder('order-dropdown');
              }}
            >
              Group by:
            </Dropdown>

            <SortableGrid
              items={(props.settings.examOrder.datas == undefined ||
              props.settings.examOrder.datas.length == 0
                ? props.requested.datas
                : props.settings.examOrder.datas
              ).filter(filterBoolean)}
              filters={{
                teacher: props.settings.teacher,
                subject: props.settings.subject,
                language: props.settings.language,
              }}
              onChange={(value) =>
                props.onSettingChange('settings.examOrder.datas', value)
              }
              access={props.settings.examOrder.groupBy.toLowerCase()}
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
        <ButtonOverlay onClick={props.onCancel} sx={{ margin: '10px 5px' }}>
          Cancel
        </ButtonOverlay>
        <ButtonOverlay onClick={onDownload} sx={{ margin: '10px 5px' }}>
          Download
        </ButtonOverlay>
      </Container>
    </div>
  );
}
