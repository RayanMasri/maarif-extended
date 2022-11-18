import React from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';

export default function useUtilityHook() {
  const append = (component, parent, referral, index) => {
    ReactDOM.render(
      ReactDOM.createPortal(component, parent),
      document.createElement('div')
    );

    let element = parent.querySelector(`.${referral}`);

    parent.insertBefore(
      element,
      Array.from(parent.children).filter(
        (item) => !Array.from(item.classList).includes(referral)
      )[index]
    );
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const getImageDimensions = (base64) => {
    return new Promise((resolve, reject) => {
      console.log(`get-image-dimensions: 1`);
      // console.log(`creating image, source length: ${base64.length}`);
      let image = document.createElement('img');
      console.log(`get-image-dimensions: 2`);
      // console.log('created image');
      image.onload = function () {
        console.log(`get-image-dimensions: 3`);
        // console.log('image loaded');
        resolve({
          width: this.width,
          height: this.height,
        });
      };
      image.src = base64;
    });
  };

  const loadImage = (path) => {
    return new Promise((resolve, reject) => {
      fetch(chrome.runtime.getURL(path))
        .then(async (result) => {
          let blob = await result.blob();
          let base64 = await blobToBase64(blob);
          let { width, height } = getImageDimensions(base64);

          resolve({
            base64: base64,
            width: width,
            height: height,
          });
        })
        .catch(reject);
    });
  };

  const waitForFonts = (fonts) => {
    return new Promise((resolve, reject) => {
      if (fonts.status == 'loaded') {
        // console.log('FONTS: fonts are already loaded');
        return resolve();
      } else {
        // console.log('FONTS: fonts are not loaded, waiting');
        fonts.onloadingdone = () => {
          // console.log('FONTS: fonts have finished loading');
          resolve();
        };
      }
    });
  };

  const generateFontStyleElement = (doc) => {
    var style = doc.createElement('style');
    style.type = 'text/css';
    style.textContent =
      '@font-face { font-family: Arabic; src: url("' +
      chrome.runtime.getURL('trado.ttf') +
      '"); }';
    return style;
  };

  // current problem, font not updating

  // initial text bug:
  // waiting does not affect anything
  const elementToCanvas = (element, rtl = true) => {
    return new Promise(async (resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.width = '1793px';
      document.body.appendChild(iframe);
      iframe.contentWindow.document.open();
      // let root = document.createElement('div');
      let root = iframe.contentWindow.document.createElement('div');
      // root.classList.add = 'root';
      root.style =
        'width: max-content; height: max-content; font-family: Arabic;';
      root.id = 'root';

      root.innerHTML = element.outerHTML;

      iframe.contentWindow.document.write(root.outerHTML);
      // iframe.contentWindow.document.body.style.width = 'max-content';
      // iframe.contentWindow.document.body.style.height = 'max-content';

      // var style = document.createElement('style');
      let style = generateFontStyleElement(iframe.contentWindow.document);

      // var meta = document.createElement('meta');
      var meta = iframe.contentWindow.document.createElement('meta');
      meta.setAttribute('http-equiv', 'content-type');
      meta.setAttribute('content', 'text/html; charset=UTF8');

      // root.appendChild(style);
      iframe.contentWindow.document.head.appendChild(style);
      iframe.contentWindow.document.head.appendChild(meta);
      iframe.contentWindow.document.close();

      iframe.contentDocument.body.style = `margin: 0px; font-family: Arabic; font-size: 16px; text-align: right; display: flex; justify-content: flex-${
        rtl ? 'end' : 'start'
      };`;
      if (rtl) iframe.contentDocument.body.setAttribute('dir', 'rtl');

      // console.log('waiting for fonts');
      await waitForFonts(iframe.contentWindow.document.fonts);
      // console.log(iframe.contentWindow.document.fonts);
      // console.log(iframe.contentWindow.document.fonts.check('14px Arabic'));
      // console.log('finished waiting for fonts');

      // console.log(window.getComputedStyle(iframe.contentWindow.document.body));

      root = iframe.contentDocument.querySelector('#root');

      var image = new Image();
      image.src = chrome.runtime.getURL('trado.ttf');
      image.onerror = function () {
        // console.log('ERROR JOHN');
        // console.log(this);
        html2canvas(iframe.contentWindow.document.body, {
          width: root.offsetWidth,
          height: root.offsetHeight,
        }).then(async (canvas) => {
          resolve(canvas);
          // iframe.remove()
        });
      };

      // root.setAttribute(
      //   'font-family',
      //   window.getComputedStyle(root, null).getPropertyValue('font-family')
      // );
      // root.replaceWith(root);

      // c
    });
  };

  const promisedSendMessage = (message) => {
    return new Promise((resolve) =>
      chrome.runtime.sendMessage(message, resolve)
    );
  };

  const getObjectArrayUnique = (array, property) => {
    return [...new Set(array.map((data) => data[property]))];
  };

  const setObjectPropertyFromString = (obj, path, value) => {
    const [head, ...rest] = path.split('.');

    return {
      ...obj,
      [head]: rest.length
        ? setObjectPropertyFromString(obj[head], rest.join('.'), value)
        : value,
    };
  };

  return {
    append,
    loadImage,
    getImageDimensions,
    elementToCanvas,
    promisedSendMessage,
    getObjectArrayUnique,
    setObjectPropertyFromString,
  };
}
