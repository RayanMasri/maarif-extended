import React from 'react';
import RowTools from './RowTools';

export default function Columns(props) {
  return (
    <tbody>
      {props.data.map((exam, index) => {
        return (
          <tr
            className={index % 2 == 0 ? 'odd' : 'even'}
            key={`rowitem-${index}`}
          >
            <RowTools
              index={index}
              checked={false}
              pdf={{}}
              onChange={() => {}}
            />
            <td align="center" valign="middle">
              <a
                id={`ctl00_MainContentPlaceHolder_gridData_ct${
                  102 + index
                }_HyperLink2`}
                href={exam.url}
                target="_blank"
              >
                {exam.name}
              </a>
            </td>
            <td align="center" valign="middle">
              {exam.status}
            </td>
            <td align="center" valign="middle">
              {exam.answer_date}
            </td>
            <td align="center" valign="middle">
              {exam.creation_date}
            </td>
            <td align="center" valign="middle">
              {exam.expiry_date}
            </td>
            <td align="center" valign="middle">
              {exam.teacher}
            </td>
            <td align="center" valign="middle">
              {exam.exam_grade}
            </td>
            <td align="center" valign="middle">
              {exam.achieved_grade}
            </td>
            <td align="center" valign="middle">
              {exam.subject}
            </td>
            <td
              style={{
                backgroundImage: 'none',
              }}
            >
              <div
                id={`ctl00_MainContentPlaceHolder_gridData_ct${
                  102 + index
                }_dvComments`}
                dangerouslySetInnerHTML={{
                  __html: `
                    <a
                    title=""
                    href="javascript:void(0)"
                    class="CommentsIconUnread"
                    onclick="${exam.comment}"
                    ></a>                    
                  `,
                }}
              ></div>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
