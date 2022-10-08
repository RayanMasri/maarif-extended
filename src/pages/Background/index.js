console.log('adda');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  // sendResponse({ response: 'hi' });

  // setTimeout(function () {
  //   console.log('timeout');
  //   sendResponse({ response: 'hi ' });
  // }, 2000);

  let promises = request.questions.map((question) => {
    return new Promise((resolve, reject) => {
      fetch(question.image.source).then(async (result) => {
        let blob = await result.blob();

        let reader = new FileReader();
        reader.onload = function () {
          resolve({
            index: question.index,
            base64: reader.result,
          });
        };
        reader.readAsDataURL(blob);
      });
    });
  });

  console.log(promises);

  Promise.all(promises).then((results) => {
    console.log(results);
    sendResponse(results);
    // sendResponse({ response: 'hi ' });
  });

  return true;

  // request.questions.map((question) => {
  //   fetch(question.image.source).then(async (result) => {
  //     let blob = await result.blob();

  //     let reader = new FileReader();
  //     reader.onload = function () {
  //       console.log(`Sent response: ${question.index}`);
  //       sendResponse({
  //         index: question.index,
  //         base64: reader.result,
  //       });
  //     };
  //     reader.readAsDataURL(blob);
  //   });
  // });

  // if (request.type == "worktimer-notification")
  // chrome.notifications.create('worktimer-notification', request.options, function() { });

  // sendResponse();
});
