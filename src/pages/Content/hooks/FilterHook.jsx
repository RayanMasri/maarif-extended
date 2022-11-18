import React from 'react';

export default function useFilterHook() {
  const filterExams = (datas, settings) => {
    datas = datas.filter((item) => {
      // Standard Filters
      let subject =
        settings.subject == 'الكل' || item.subject == settings.subject;
      let teacher =
        settings.teacher == 'الكل' || item.teacher == settings.teacher;
      let flipped = item.language == 'AR' ? 'العربية' : 'الإنجليزية';
      let language = flipped == settings.language;
      let standard = subject && teacher && language;

      return standard;
    });

    // console.log('Filter exams:');
    // console.log(datas);
    // console.log(settings);

    return datas;
    // // Only filter exams with same language
    // state.exams.filter(exam => exam.language == settings.language && exam.teacher)

    // // If the selected exams have more than one teachers,
    // // and the teacher setting does not include all teachers
    // if (state.teachers.length > 1 && state.settings.teacher != 'الكل') {
    //   // Only filter exams with same teacher
    //   state.exams = state.exams.filter((exam) => {
    //     let data = acquireDataFromExamIndex(exam);
    //     return data.teacher == state.settings.teacher;
    //   });
    // }

    // state.exams.map((exam) => {
    //   let data = acquireDataFromExamIndex(exam);

    //   console.log(`${data.teacher} -> ${data.language}`);
    // });
  };

  return { filterExams };
}
