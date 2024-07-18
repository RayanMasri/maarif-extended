import React from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

  // Convert HTMl string into a manipulatable element
  const solidifyHTML = (html) => {
    let div = document.createElement('div');
    div.innerHTML = html;
    return div;
  };

  // Convert children and sub-children of an HTML element into react components,
  // while also injecting requested children from the "commands" parameter
  const getReactifiedChildren = (element, hierarchy, commands = null) => {
    if (element.children.length == 0) return null;

    const camelCases = {
      colspan: 'colSpan',
      onclick: 'onClick',
      class: 'className',
      cellpadding: 'cellPadding',
      onchange: 'onChange',
      cellspacing: 'cellSpacing',
      onsubmit: 'onSubmit',
    };

    let children = Array.from(element.children).map((child, index) => {
      let TagName = child.tagName.toLowerCase();

      // let obey = null;
      let injected = null;
      if (commands != null) {
        commands.map((command) => {
          if (command.index != undefined) return;

          // if (child.parentElement.querySelector(command.reference) == child) {
          if (element.querySelector(command.reference) == child) {
            injected = command.injected;
            // obey = command;
          }
        });
      }

      let attributes = {};
      if (child.attributes.length != 0) {
        Array.from(child.attributes).map((attribute) => {
          let value = attribute.nodeValue;
          let name = attribute.nodeName;
          switch (name) {
            case 'style':
              // If style is empty, cancel out the whole attribute
              if (value == '') return;
              let style = {};

              value
                .split(';')
                .filter((e) => e)
                .map((styling) => {
                  let [property, assigned] = styling
                    .trim()
                    .split(':')
                    .map((e) => e.trim());

                  property = property.split('-');
                  property = [property[0]]
                    .concat(
                      property
                        .slice(1)
                        .map((e) => e[0].toUpperCase() + e.slice(1))
                    )
                    .join('');

                  style[property] = assigned;
                });

              value = style;
              break;

            case 'onclick':
              // console.log(child);
              // console.log(value);
              break;

            default:
              if (Object.keys(camelCases).includes(name)) {
                name = camelCases[name];
              }
              break;
          }

          attributes[name] = value;
        });
      }

      // if (TagName == 'input') {
      //   console.log(attributes);
      //   console.log(attributes);
      //   console.log(child.children.length);
      //   console.log(child.innerHTML || undefined);
      // }

      const getText = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].nodeType === Node.TEXT_NODE) {
            return nodes[i].textContent.trim();
          }
        }
        return null;
      };

      const getContent = () => {
        if (TagName == 'input') return null;

        let innerHTML = child.innerHTML.trim() || null;

        if (innerHTML) innerHTML = innerHTML.split('&nbsp;').join('\xa0');

        if (innerHTML && innerHTML.includes('<!--')) {
          innerHTML = null;

          // let actual = '';
          // let comments = [];
          // innerHTML.split('<!--').map((item) => {
          //   if (item.includes('-->')) {
          //     let [comment, text] = item.split('-->');
          //     actual += text;
          //     comments.push(comment);
          //   } else {
          //     actual += item;
          //   }
          // });

          // console.log(innerHTML);
          // console.log(actual);
          // console.log(comments);
        }

        // let textContent = '';

        // for (let i = 0; i < child.childNodes.length; i++) {
        //   if (child.childNodes[i].nodeType === Node.TEXT_NODE) {
        //     textContent = child.childNodes[i].textContent.trim();
        //   }
        // }
        // console.log(getReactifiedChildren(child, hierarchy + 1, commands))
        // console.log(textContent)
        // console.log(getReactifiedChildren(child, hierarchy + 1, commands))
        // console.log(textConten)

        return child.children.length == 0
          ? innerHTML
          : getReactifiedChildren(child, hierarchy + 1, commands);
      };

      // if (TagName == 'thead') {
      //   console.log(getContent());
      //   console.log(getText(child.childNodes));
      // }

      // {TagName == 'input'
      //   : child.children.length == 0
      //   ? child.innerHTML || undefined
      //   : getReactifiedChildren(child, hierarchy + 1, commands)}
      // #ctl00_MainContentPlaceHolder_gridData > tbody > tr:nth-child(3) > td:nth-child(1)
      const uninjectables = ['input', 'img', 'br'];
      if (uninjectables.includes(TagName)) {
        return (
          <TagName key={`reactified-h${hierarchy}-i${index}`} {...attributes}>
            {getContent()}
            {/* {getReactifiedChildren(child, hierarchy + 1, commands) || null} */}
            {/* {child.innerHTML || undefined} */}
            {/* {injected && injected} */}
          </TagName>
        );
      } else {
        // console.log(getText(child.childNodes));
        return (
          <TagName key={`reactified-h${hierarchy}-i${index}`} {...attributes}>
            {getContent()}
            {child.children.length != 0 ? getText(child.childNodes) : null}

            {/* {getReactifiedChildren(child, hierarchy + 1, commands) || null} */}
            {/* {child.innerHTML || undefined} */}

            {injected != null ? injected : null}
          </TagName>
        );
      }
    });

    for (let command of commands) {
      if (command.index == undefined || element.parentElement == null) continue;

      if (element.parentElement.querySelector(command.reference) == element) {
        console.log(element);
        console.log(command);

        for (let injection of command.injected) {
          children.splice(command.index, 0, injection);
        }
      }
    }

    // console.log(element);
    // console.log(children);

    return children;
  };

  const createJsPDFObject = () => {
    return new Promise((resolve, reject) => {
      let pdf = new jsPDF();
      fetch(chrome.runtime.getURL('trado.ttf')).then(async (response) => {
        let blob = await response.blob();
        var reader = new FileReader();
        reader.onload = function () {
          pdf.addFileToVFS('trado.ttf', this.result);
          pdf.addFont('trado.ttf', 'trado', 'normal');

          resolve(pdf);
        }; // <--- `this.result` contains a base64 data URI
        reader.readAsBinaryString(blob);
      });
    });
  };

  const onMutationObserverSettle = (page) => {
    return new Promise((resolve, reject) => {
      window.onload = () => {
        let timeout = setTimeout(resolve, 3000);

        let observer = new MutationObserver((record) => {
          // console.log(record);

          // if (
          //   [...new Set(record.map((item) => item.target.className))][0] ==
          //   'pace-progress'
          // )
          //   return;

          if (timeout != null) clearTimeout(timeout);

          timeout = setTimeout(resolve, 1000);

          // console.log([
          //   ...new Set(record.map((item) => item.target.className)),
          // ]);
        });

        observer.observe(page, {
          // observer.observe(document.querySelector('.pace'), {
          childList: true,
          // attributes: true,
          subtree: true,
        });
      };
    });
  };

  return {
    solidifyHTML,
    getReactifiedChildren,
    append,
    loadImage,
    getImageDimensions,
    elementToCanvas,
    promisedSendMessage,
    getObjectArrayUnique,
    setObjectPropertyFromString,
    createJsPDFObject,
    onMutationObserverSettle,
  };
}
