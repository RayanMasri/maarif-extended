import useUtilityHook from './UtilityHook.jsx';

const checkbox = `
<svg width="13" height="13">
  <circle cx="50%" cy="50%" r="6" stroke="#A5A5A5" fill="#DEDEDE"></circle>
</svg>
`;

const checkboxRight = `<svg width="13" height="13">
<circle cx="50%" cy="50%" r="6" stroke="#A5A5A5" fill="#DEDEDE"></circle>
<circle cx="50%" cy="50%" r="3" fill="#2A2A2A"></circle>
</svg>
`;

const checkboxWrong = `<svg width="13" height="13">
<circle cx="50%" cy="50%" r="6" stroke="#A5A5A5" fill="#DEDEDE"></circle>
<line x1="4" y1="4" x2="9" y2="9" style="stroke: #2a2a2a; stroke-width: 2" />
<line x1="9" y1="4" x2="4" y2="9" style="stroke: #2a2a2a; stroke-width: 2" />
</svg>`;

const ratio = 4; // 4x smaller than usual, try figuring out a way where you can take the ratio for the height, and then divide both the height and width,
const lineSpacing = -0.6;
const fontSize = 20;
const answerFontSize = 18;
const checkboxWidth = 4.1;

let constants = {
  lineSpacing: -0.6,
  fontSize: 20,
  answerFontSize: 18,
  checkboxWidth: 4.1,
  sideMargin: 2,
};

import html2canvas from 'html2canvas';

export default function usePdfHook() {
  const { elementToCanvas, getImageDimensions, promisedSendMessage } =
    useUtilityHook();
  let pdf = window.jsPDF;

  const extractImage = (question) => {
    return new Promise((resolve, reject) => {
      let images = [
        question.querySelector('.QuestionImage > a > img'),
        question.querySelector('p > img'),
      ];
      let image = images.filter((image) => image != null)[0];

      if (!image) resolve({});

      let img = new Image();
      img.onload = function () {
        resolve({
          source: image.src,
          width: this.width,
          height: this.height,
        });
      };
      img.src = image.src;
    });
  };

  const extractData = async (doc, fixIncorrect) => {
    let questions = [];
    let examTitle = doc.querySelector('.Title').innerHTML;

    // Images might be contained in:
    // a div with the class name ".QuestionImage"
    // a paragraph element with an img element inside it

    for (let question of Array.from(
      doc.querySelectorAll(
        '#page-wrapper > div:nth-child(12) > .Questions > div'
      )
    )) {
      let image = await extractImage(question);

      // let title;

      // if (image.source) {
      //   title = `Source: ${image.source.slice(0, 10)}..., Dimensions: ${
      //     image.width
      //   }x${image.height}`;
      // } else {
      // Create a temporary div to tidy the title text
      let div = document.createElement('div');
      div.className = 'extracted-data';
      Array.from(question.children)
        .filter((item) => item.tagName == 'P')
        .map((p) => {
          // If paragraph element inside title container has any text content when trimmed, append to temporary div
          if (p.textContent.trim()) {
            // If this paragraph is not the first
            // if (div.children.length != 0) {
            //   // Add a line break behind it
            //   let lineBreak = document.createElement('br');
            //   // let lineBreak = document.createElement('p');
            //   // lineBreak.textContent = '<br/>';
            //   div.appendChild(lineBreak);
            // }
            p.style = 'margin-bottom: 0px;';
            div.appendChild(p);
          }
        });
      let title = div.outerHTML;
      // let title = div.textContent.replace(/\u00A0/g, '').trim();

      let answers = Array.from(
        Array.from(question.children).find((child) =>
          child.className.includes('RadioButtonList')
        ).children
      );

      let parsed = [];

      for (let answer of answers) {
        let decision = answer.querySelector('.RightSWidth').getAttribute('src');

        parsed.push({
          answer: answer.textContent.trim(),
          checked:
            answer.querySelector('input').getAttribute('checked') == 'checked',
          // If the decision is empty, show empty
          // Otherwise, if the decision is wrong, then show empty if incorrect answers are being fixed, otherwise show false
          // If the decision is right, show true either way
          correct:
            decision == null
              ? null
              : !decision.includes('RightAnswer')
              ? fixIncorrect
                ? null
                : false
              : true,
        });
      }

      questions.push({
        title: title,
        image: image,
        answers: parsed,
        examTitle: examTitle,
      });
      console.log(questions);
    }

    return questions;
  };

  const examToJSON = async (index, fixIncorrect, callback) => {
    // window.jsPDF
    console.log(index);

    document.querySelector(`.bar-at-${index}`);

    let href = Array.from(
      document.querySelectorAll(
        '#ctl00_MainContentPlaceHolder_gridData > tbody > tr'
      )
    )
      .find(
        (item) =>
          parseInt(item.querySelector('.bar-at').getAttribute('index')) == index
      )
      .querySelector('td:nth-child(2) > a')
      .getAttribute('href');

    let url = `https://smartems-dash.maarif.com.sa${href}`;

    let html = await (await fetch(url)).text();

    let doc = new DOMParser().parseFromString(html, 'text/html');
    let data = await extractData(doc, fixIncorrect);

    // callback(index);

    return data;
  };

  // #region PDF utils
  const getFontSizeFromWidth = (text, width) => {
    pdf.setFont('trado', 'normal').setFontSize(16);
    let fontRatio = pdf.getTextDimensions(text).w / 16;
    return width / fontRatio;
  };

  const writeTransparentText = (x, y, text, options = {}) => {
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0 }));
    pdf.text(x, y, text, options);
    pdf.restoreGraphicsState();
  };

  const rawToElement = (data) => {
    // let parent = document.querySelector(selector);
    let element = document.createElement('template');
    element.innerHTML = data;
    return element.content;
    // parent.appendChild(element.content);
  };

  // const getElementImage = async (element, rtl = true) => {
  //   // console.log('get image from element');
  //   // console.log(element);
  //   let canvas = await elementToCanvas(element, rtl);
  //   // console.log('got canvas');
  //   // console.log(canvas);
  //   let base64 = canvas.toDataURL('image/png');
  //   let { width, height } = await getImageDimensions(base64);
  //   // console.log('got dimensions');

  //   width = Math.round(width / ratio);
  //   height = Math.round(height / ratio);

  //   return { image: base64, width: width, height: height };
  // };
  const getElementImage = async (element, rtl = true) => {
    console.log(`get-element-image: 1`);
    let canvas = await html2canvas(element, {
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
    console.log(`get-element-image: 2`);
    // let canvas = await elementToCanvas(element, rtl);
    // console.log('got canvas');
    // console.log(canvas);
    let base64 = canvas.toDataURL('image/png');
    console.log(`get-element-image: 3`);
    let { width, height } = await getImageDimensions(base64);
    console.log(`get-element-image: 4`);
    // console.log('got dimensions');

    // width = Math.round(width / ratio);
    // height = Math.round(height / ratio);
    width /= ratio;
    height /= ratio;

    return { image: base64, width: width, height: height };
  };

  const getRawSvgFromDecision = (decision) => {
    // return loadSvgAsElement(
    // decision == null ? checkbox : decision ? checkboxRight : checkboxWrong
    // );
    return decision == null
      ? checkbox
      : decision
      ? checkboxRight
      : checkboxWrong;
  };

  const resetJsPDF = () => {
    // Iterate over page count
    // We're deleting the first page here, because after each delete, the indices are updated, and the second page becomes the first page, and so on
    let pages = pdf.internal.getNumberOfPages(); // This is crucial for some reason, don't refactor
    for (let i = 0; i < pages; i++) {
      // Delete the first page (not 0 )
      pdf.deletePage(1);
    }
    // Add blank page
    pdf.addPage();
  };

  const savePdf = () => {
    pdf.save();
    var string = pdf.output('datauristring');

    var x = window.open();
    x.document.open();
    x.document.write(`<html>
        <head>
          <title>John</title>
        </head>
        <body>
          <embed style='width: 100%; height: 100%; position: fixed; top: 0; left: 0;' src='${string}'/>
        </body>
      </html>
      `);
    x.document.body.style =
      'width: 100%; height: 100%; position: fixed; top: 0; left: 0;';
    x.document.close();
  };
  // #endregion

  const addQuestionToPdfWithText = async (
    question,
    answerOnSide,
    language,
    origin
  ) => {
    // console.log(`Turning ${json.length} question(s) into a PDF (${language})`);
    // window.jsPDF

    let rtl = language == 'AR';
    let { sideMargin } = constants;

    if (!rtl) sideMargin = -sideMargin;

    // Add temporary div
    let hidden = document.querySelector('.hidden-mxd-text');
    hidden.setAttribute('dir', rtl ? 'rtl' : 'ltr');

    // Add image to pdf
    hidden.innerHTML = question.title;
    hidden.style.fontSize = `${fontSize}px`;

    // Get div image
    let title = await getElementImage(hidden, rtl);

    // <div class="mxd-answers ${answerOnSide ? ' mxd-answers-side-main' : ''}">
    let answersRaw = `
        <div class="mxd-answers">
        ${question.answers
          .map((answer) => {
            return `
            <div class="answer" style="display: flex; justify-content: flex-start; align-items: center; font-family: Arabic; font-size: ${answerFontSize}px;">
              <div class="mxd-checkbox" style="width: max-content; align-items: center; height: ${
                answerFontSize * 1.5
              }px; margin: ${
              rtl ? '0px 0px 0px 5px' : '0px 5px 0px 0px'
              // } display: flex">
            }; display: ${answerOnSide ? 'none' : 'flex'};">
                ${getRawSvgFromDecision(answer.correct)}
              </div>
              <div class="content" style="display: flex;">${answer.answer}</div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;

    hidden.innerHTML = answersRaw;
    let answers = await getElementImage(hidden, rtl);

    // Find maximum width answer
    let maxAnswerWidth = question.answers
      .map((answer) => {
        pdf.setFont('trado', 'normal').setFontSize(16);
        return pdf.getTextDimensions(answer.answer).w;
      })
      .sort((a, b) => b - a)[0];

    if (
      origin + title.height + answers.height >
      pdf.internal.pageSize.getHeight()
    ) {
      pdf.addPage();
      origin = 0;
    }

    // Set font size to fit title image, and get dimensions for text
    pdf
      .setFont('trado', 'normal')
      .setFontSize(getFontSizeFromWidth(question.title, title.width));
    let dimensions = pdf.getTextDimensions(question.title);

    title.x = rtl ? pdf.internal.pageSize.getWidth() - title.width : 0;

    if (answerOnSide) {
      Array.from(hidden.querySelectorAll('.mxd-answers > .answer')).map(
        (element) => {
          element.children[0].style.display = 'flex';
          element.children[0].style.margin = '0px';
          element.children[1].style.display = 'none';
        }
      );

      let checkbox = await getElementImage(hidden, rtl);

      pdf.addImage(
        checkbox.image,
        (rtl ? 0 : pdf.internal.pageSize.getWidth() - checkbox.width) +
          sideMargin,
        origin + title.height,
        checkbox.width,
        checkbox.height
      );
    }

    // Write title text
    writeTransparentText(
      title.x - sideMargin,
      origin + dimensions.h - lineSpacing,
      question.title
    );

    // Add title image
    pdf.addImage(
      title.image,
      title.x - sideMargin,
      origin,
      title.width,
      title.height
    );

    // Find correct font size from font to width ratio
    let answersFontSize =
      (answers.width - (!answerOnSide ? checkboxWidth : 0)) /
      (maxAnswerWidth / 16);
    pdf.setFont('trado', 'normal').setFontSize(answersFontSize);

    // Write answers text
    let traversed = 0;
    let spacing = 8.3;
    let eachSpacing = 2.5;
    question.answers.map((answer) => {
      let dimensions = pdf.getTextDimensions(answer.answer);

      writeTransparentText(
        (rtl ? pdf.internal.pageSize.getWidth() : 0) -
          sideMargin -
          (!answerOnSide ? (rtl ? checkboxWidth : -checkboxWidth) : 0),
        origin + traversed + dimensions.h + spacing,
        answer.answer,
        {
          align: rtl ? 'right' : 'left',
        }
      );
      traversed += dimensions.h + eachSpacing;
    });

    // Add answers image
    pdf.addImage(
      answers.image,
      (rtl ? pdf.internal.pageSize.getWidth() - answers.width : 0) - sideMargin,
      origin + title.height,
      answers.width,
      answers.height
    );

    return origin + title.height + answers.height;
  };

  const getTitleLines = (title) => {
    let brs = title.match(/<br>/g) || [];
    let ps = title.match(/<\/p>/g) || [];

    let lines = 1;
    if (brs.length > 0) {
      lines += brs.length;
    } else {
      lines = ps.length;
    }

    return lines;
  };

  const getTitleHeightEstimate = (title) => {
    let lines = getTitleLines(title);

    // let lines = 1;
    let height = title.trim() ? ((fontSize * 1.5) / ratio) * lines : 0;
    return height;
  };

  const getQuestionHeightEstimate = (question) => {
    let title = getTitleHeightEstimate(question.title);
    let answers = (answerFontSize * 1.5 * question.answers.length) / ratio;
    let image = (question.image.height || 0) / ratio;
    return title + answers + image;
    // return {
    //   estimate: title + answers + image,
    //   title: title,
    //   answers: answers,
    //   image: image,
    // };
  };

  const getMultipleQuestionsHeightEstimate = (questions) => {
    let total = 0;
    for (let question of questions) {
      total += getQuestionHeightEstimate(question);
    }
    return total;
  };

  const fillPdfWithQuestions = async (questions, answerOnSide, language) => {
    console.log(`fill-pdf: 1`);
    let rtl = language == 'AR';
    let { sideMargin } = constants;

    if (!rtl) sideMargin = -sideMargin;

    let hiddenMain = document.querySelector('.hidden-mxd');
    let hidden = hiddenMain.children[0];
    let hiddenCanvas = hiddenMain.children[1];
    hidden.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    console.log(`fill-pdf: 2`);

    // TODO: Create images and wait for them to load before creating them (https://www.seancdavis.com/posts/wait-until-all-images-loaded/)
    hidden.innerHTML = `
    <div>
    ${questions
      .map((question, index) => {
        return `
            <div style="display: flex; flex-direction: row-reverse; justify-content: space-between;">
              <div class="debug" style="display: flex; justify-content: flex-start; flex-direction: column; align-items: ${
                rtl ? 'flex-end' : 'flex-start'
              }; margin: ${
          rtl
            ? `0px 0px 0px ${constants.sideMargin * 2 * ratio}px`
            : `0px ${constants.sideMargin * 2 * ratio}px 0px 0px`
        }; width: max-content;">
                <div style="width: max-content;">Lines: ${getTitleLines(
                  question.title
                )}</div>
                <div style="width: max-content;">Exam title: ${
                  question.examTitle
                }</div>
              </div>
              <div>
                <div class="mxd-title" style="font-size: ${fontSize}px; display: flex; justify-content: space-between; align-items: center; height: max-content;">
                  ${question.title}  
                </div>
                ${
                  question.image.source
                    ? `<div style="background-color: red; width: ${question.image.width}px; height: ${question.image.height}px;">&nbsp;</div>`
                    : ''
                }
                <div class="mxd-answers">
                ${question.answers
                  .map((answer) => {
                    let checkboxRaw = `<div class="mxd-checkbox" style="width: max-content; align-items: center; height: ${
                      answerFontSize * 1.5
                    }px; margin: ${
                      rtl
                        ? `0px 0px 0px ${
                            constants.sideMargin *
                            (answerOnSide ? 2 : 1) *
                            ratio
                          }px`
                        : `0px ${
                            constants.sideMargin *
                            (answerOnSide ? 2 : 1) *
                            ratio
                          }px 0px 0px`
                      // } display: flex">
                      // }; display: ${answerOnSide ? 'none' : 'flex'};">
                    }; display: flex;">
                      ${getRawSvgFromDecision(answer.correct)}
                    </div>`;

                    let contentRaw = `<div class="content" style="display: flex;">${answer.answer}</div>`;

                    return `
                      <div class="answer" style="display: flex; justify-content: ${
                        answerOnSide
                          ? `space-between; width: ${
                              // Multiply side margin by two, one time to even out the side margin on the left and a second to show it
                              pdf.internal.pageSize.getWidth() * ratio
                            }px;`
                          : 'flex-start'
                      } align-items: center; font-family: Arabic; font-size: ${answerFontSize}px;">
                        ${
                          answerOnSide
                            ? `${contentRaw}${checkboxRaw}`
                            : `${checkboxRaw}${contentRaw}`
                        }
                      </div>
                    `;
                  })
                  .join('')}
                </div>
              </div>
            </div>
          `;
      })
      .join('')}
      </div>
    `;

    console.log(`fill-pdf: 3`);

    // TODO: Open a new tab at https://smartqb-dash.maarif.com.sa and pin it to download images in exams

    // Get image of the loaded HTML
    let cluster = await getElementImage(hidden, rtl);

    console.log(`fill-pdf: 4`);

    // Add image
    pdf.addImage(
      cluster.image,
      (rtl ? pdf.internal.pageSize.getWidth() - cluster.width : 0) - sideMargin,
      0,
      cluster.width,
      cluster.height
    );

    // question height debug
    // let total = 0;
    // questions.map((question, index) => {
    //   let height = getQuestionHeightEstimate(question);

    //   pdf.setDrawColor(index % 2 == 0 ? 255 : 0, index % 2 == 0 ? 0 : 255, 0);
    //   console.log(index);
    //   console.log(height);
    //   pdf.line(150, total, 150, total + height);

    //   total += height;
    // });

    console.log(`fill-pdf: 5`);

    // Get image base64 from background script of all questions in cluster with valid image sources

    // TODO: dont send message if there are no images
    let response = await promisedSendMessage({
      questions: questions
        .map((question, index) => {
          return {
            ...question,
            index: index,
          };
        })
        .filter((question) => question.image.source != undefined),
    });

    console.log(`fill-pdf: 6`);

    response.map(({ index, base64 }) => {
      console.log(`fill-pdf: 6.${index + 1}.1`);
      let offset = getMultipleQuestionsHeightEstimate(
        questions.slice(0, index)
      );

      console.log(`fill-pdf: 6.${index + 1}.2`);

      pdf.addImage(
        base64,
        (rtl
          ? pdf.internal.pageSize.getWidth() -
            questions[index].image.width / ratio
          : 0) - sideMargin,
        offset + getTitleHeightEstimate(questions[index].title),
        questions[index].image.width / ratio,
        questions[index].image.height / ratio
      );

      console.log(`fill-pdf: 6.${index + 1}.3`);
    });

    console.log(`fill-pdf: 7`);
  };

  const addQuestionToPdf = async (question, answerOnSide, language, origin) => {
    let rtl = language == 'AR';
    let { sideMargin } = constants;

    if (!rtl) sideMargin = -sideMargin;

    // Add temporary div
    let hidden = document.querySelector('.hidden-mxd-text');
    hidden.setAttribute('dir', rtl ? 'rtl' : 'ltr');

    // Add image to pdf
    hidden.innerHTML = question.title;
    hidden.style.fontSize = `${fontSize}px`;

    // Get div image
    let title = await getElementImage(hidden, rtl);

    // <div class="mxd-answers ${answerOnSide ? ' mxd-answers-side-main' : ''}">
    let answersRaw = `
        <div class="mxd-answers">
        ${question.answers
          .map((answer) => {
            return `
            <div class="answer" style="display: flex; justify-content: flex-start; align-items: center; font-family: Arabic; font-size: ${answerFontSize}px;">
              <div class="mxd-checkbox" style="width: max-content; align-items: center; height: ${
                answerFontSize * 1.5
              }px; margin: ${
              rtl ? '0px 0px 0px 5px' : '0px 5px 0px 0px'
              // } display: flex">
            }; display: ${answerOnSide ? 'none' : 'flex'};">
                ${getRawSvgFromDecision(answer.correct)}
              </div>
              <div class="content" style="display: flex;">${answer.answer}</div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;

    hidden.innerHTML = answersRaw;
    let answers = await getElementImage(hidden, rtl);

    console.log(`Total question height: ${title.height + answers.height}`);
    console.log(
      `Total question height estimate: ${getQuestionHeightEstimate(question)}`
    );

    if (
      origin + title.height + answers.height >
      pdf.internal.pageSize.getHeight()
    ) {
      pdf.addPage();
      origin = 0;
    }

    title.x = rtl ? pdf.internal.pageSize.getWidth() - title.width : 0;

    if (answerOnSide) {
      Array.from(hidden.querySelectorAll('.mxd-answers > .answer')).map(
        (element) => {
          element.children[0].style.display = 'flex';
          element.children[0].style.margin = '0px';
          element.children[1].style.display = 'none';
        }
      );

      let checkbox = await getElementImage(hidden, rtl);

      pdf.addImage(
        checkbox.image,
        (rtl ? 0 : pdf.internal.pageSize.getWidth() - checkbox.width) +
          sideMargin,
        origin + title.height,
        checkbox.width,
        checkbox.height
      );
    }

    // Add title image

    pdf.addImage(
      title.image,
      title.x - sideMargin,
      origin,
      title.width,
      title.height
    );

    // Add answers image
    pdf.addImage(
      answers.image,
      (rtl ? pdf.internal.pageSize.getWidth() - answers.width : 0) - sideMargin,
      origin + title.height,
      answers.width,
      answers.height
    );

    return origin + title.height + answers.height;
  };

  const calculateQuestionClusters = (questions) => {
    let clusters = [];
    let current = [];
    let total = 0;
    let page = pdfinternal.pageSize.getHeight();

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

  return {
    examToJSON,
    resetJsPDF,
    addQuestionToPdf,
    savePdf,
    getQuestionHeightEstimate,
    fillPdfWithQuestions,
    calculateQuestionClusters,
  };
}
