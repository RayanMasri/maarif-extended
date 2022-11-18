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

export default function DownloadOverlay(props) {
  const {
    examToJSON,
    resetJsPDF,
    addQuestionToPdf,
    savePdf,
    getQuestionHeightEstimate,
    fillPdfWithQuestions,
  } = usePdfHook();

  // TODO: Come back to this later
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

    resetJsPDF();

    // 6.45x faster than previous method
    let clusters = calculateQuestionClusters(json);

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

    savePdf();
  };

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
          props.requested.uniques.subjects.length >=
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
            <Holder name="Filters" id="filters-dropdown" hierarchy={0}>
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
          onChange={(event, value) =>
            props.onSettingChange('settings.showWrong', value)
          }
        >
          Show wrong answers
        </Option>
      </div>
    </div>
  );
}
