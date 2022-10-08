global.document = {
  createElement: () => {
    return {};
  },
};
global.navigator = {};
global.btoa = () => {};

// var fs = require('fs');

const { jsPDF } = require('jspdf');
let pdf = new jsPDF();

pdf.html('<div>Hey there</div>', {
  callback: (a) => {
    console.log(a);
  },
});
delete global.window;
delete global.navigator;
delete global.btoa;
