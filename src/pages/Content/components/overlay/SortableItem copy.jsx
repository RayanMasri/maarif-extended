import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const [state, setState] = useState({
    heldPosition: null,
    john: false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: `background-color 0.2s, ${transition}`,
    userSelect: 'none',
    position: attributes['aria-pressed'] ? 'fixed' : 'static',
    ...(attributes['aria-pressed']
      ? { top: state.heldPosition.y, left: state.heldPosition.x }
      : {}),
    ...props.style,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={(event) => {
        if (event.button != 0) return;

        let rect = event.target.getBoundingClientRect();
        // console.log(event);
        // console.log(event.target);
        // console.log();

        console.log({ x: event.screenX, y: event.screenY });
        console.log({ x: event.clientX, y: event.clientY });
        setState({
          ...state,
          heldPosition: {
            // x: `${event.screenX}px`,
            // y: `${event.screenY}px`,
            x: `${rect.x}px`,
            y: `${rect.y}px`,
          },
          john: true,
        });
        listeners.onMouseDown(event);
      }}
      // className={props.className}
      className={'john'}
    >
      {props.children}
    </div>
  );
}
