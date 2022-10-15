import React from 'react';

let defaultPageWidth = 210.0015555555555;
let ratio = 4;

function Hidden() {
  return (
    // <div
    //   className="hidden-mxd"
    //   style={{
    //     overflow: 'hidden',
    //     position: 'relative',
    //     lineHeight: '1.5',
    //   }}
    // >
    //      <div
    //   className="hidden-mxd-text"
    //   style={{
    //     // position: 'fixed',
    //     // overflow: 'hidden',
    //     position: 'absolute',
    //     height: 'max-content',
    //     width: 'max-content',
    //     right: '-100%',
    //     fontFamily: 'Arabic',
    //     color: 'black',
    //   }}
    // >
    //   السلام عليكم
    // </div>
    <div
      className="hidden-mxd"
      style={{
        // position: 'fixed',
        // overflow: 'hidden',
        height: 'max-content',
        width: `${
          (localStorage.getItem('js-pdf-page-width') || defaultPageWidth) *
          ratio
        }px`,
        // width: 'max-content',
        // right: '-100%',
        fontFamily: 'Arabic',
        color: 'black',
        lineHeight: '1.5',
      }}
    >
      <div
        className="hidden-mxd-content"
        style={{
          height: 'max-content',
          width: '100%',
        }}
      >
        السلام عليكم
      </div>
      <canvas className="hidden-mxd-canvas"></canvas>
    </div>
  );
}

export default Hidden;
