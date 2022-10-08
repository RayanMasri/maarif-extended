import React, { useEffect } from 'react';

function Table(props) {
  useEffect(() => {
    let object = {};

    for (
      let i = 0;
      i <
      document.querySelectorAll(
        '#ctl00_MainContentPlaceHolder_gridData > tbody > tr'
      ).length;
      i++
    ) {
      object[`bar-at-${i}`] = false;
    }
  }, []);

  return (
    <th scope="col" className="header tool-header">
      الأدوات
    </th>
  );
}

export default Table;
