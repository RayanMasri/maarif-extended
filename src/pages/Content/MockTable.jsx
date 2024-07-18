import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Columns from './components/Columns';
import { useMainContext } from './MainContext';

// const ColumnsMemo = React.memo(Columns);

export default function MockTable(props) {
  const { main, setMain } = useMainContext();

  useEffect(() => {
    console.log(
      `Initialized MockTable and set main.maximum to ${props.data.length}`
    );
    setMain({
      ...main,
      maximum: props.data.length,
      // maximum: 10,
      data: props.data,
    });
  }, []);

  return (
    <div>
      <Header onChange={() => {}} />
      <table
        className="GridviewStyle GridviewSorter GridviewDetails tablesorter"
        cellSpacing="0"
        rules="all"
        border="1"
        id="ctl00_MainContentPlaceHolder_gridData"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr className="headerstyle">
            {/* Extra header */}
            <th scope="col" className="header tool-header">
              الأدوات
            </th>
            <th scope="col" className="header">
              اسم الواجب
            </th>
            <th scope="col" className="header">
              حالة الواجب
            </th>
            <th scope="col" className="header">
              تاريخ الإجابة
            </th>
            <th scope="col" className="header">
              تاريخ بداية الواجب
            </th>
            <th scope="col" className="header">
              تاريخ نهاية الواجب
            </th>
            <th scope="col" className="header">
              اسم المعلم
            </th>
            <th scope="col" className="header">
              درجة الواجب
            </th>
            <th scope="col" className="header">
              درجة الطالب
            </th>
            <th scope="col" className="header">
              المادة
            </th>
            <th scope="col" className="header">
              التعليقات
            </th>
          </tr>
        </thead>

        <Columns data={props.data}></Columns>
      </table>
    </div>
  );
}
