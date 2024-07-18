import React from 'react';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { makeStyles } from '@mui/styles';
import { useOverlayContext } from '../OverlayContext';

const useStyles = makeStyles({
  root: {
    transition: 'none',
  },
});

export default function ProgressOverlay(props) {
  const classes = useStyles();

  const { overlay, setOverlay } = useOverlayContext();

  const onProgressCancel = () => {
    setOverlay({
      ...overlay,
      download: {
        status: false,
        requested: [],
      },
    });
    //   resetJsPDF(); // Reset jsPDF
    //   setState({
    //     ...state,
    //     downloading: false,
    //     progressValue: 0,
    //     progressMessage: '',
    //   });
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
        {/* {state.progressMessage.replace('<br/>', '\n')} */}
        {/* {props.download.progress.message} */}
        {overlay.progress.message}
      </div>

      {/* <LinearProgressWithLabel value={50} /> */}
      <LinearProgress
        variant="determinate"
        // value={state.progressValue}
        // value={props.download.progress.value}
        value={overlay.progress.value}
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
