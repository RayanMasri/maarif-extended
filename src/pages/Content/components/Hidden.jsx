import React from 'react';

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
        width: 'max-content',
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
          width: 'max-content',
        }}
      >
        السلام عليكم
      </div>
      <canvas className="hidden-mxd-canvas"></canvas>
    </div>
  );
}

export default Hidden;
