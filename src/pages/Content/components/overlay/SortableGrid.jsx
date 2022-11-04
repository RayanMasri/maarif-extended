import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy, // <== doesn't break if this is rectSortingStrategy
} from '@dnd-kit/sortable';
import SortableItem from './SortableItem.jsx';
import OpenWithIcon from '@mui/icons-material/OpenWith';

const boxSize = 80;
const gap = 7;
const columns = 5;

export function SortableGrid(props) {
  const [state, setState] = useState({
    items: props.datas.map((item) => {
      return {
        name: item.name,
        held: false,
      };
    }),
  });

  console.log(state);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const makeChunks = (arr, n) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += n) {
      chunks.push(arr.slice(i, i + n));
    }
    return chunks;
  };

  return (
    <div
      style={{
        position: 'relative',
        ...props.style,
      }}
    >
      <div
        style={{
          position: 'absolute',
        }}
      >
        {makeChunks(state.items, columns).map((chunk, index) => {
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: 'max-content',
                marginBottom:
                  Math.ceil(state.items.length / columns) != index + 1
                    ? gap
                    : 0,
              }}
            >
              {chunk.map((item, itemIndex) => {
                return (
                  <div
                    style={{
                      width: boxSize,
                      height: boxSize,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '30px',
                      color: 'gray',
                      border: '3px dashed gray',
                      boxSizing: 'border-box',
                      borderRadius: '20px',
                      marginRight: itemIndex + 1 != chunk.length ? gap : 0,
                    }}
                  >
                    {itemIndex + 1 + index * columns}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        onDragStart={handleDragStart}
      >
        <SortableContext items={state.items.map((item) => item.name)}>
          <div
            style={{
              position: 'relative',
              width: '100%',
            }}
          >
            {makeChunks(state.items, columns).map((chunk, index) => {
              console.log(chunk);
              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 'max-content',
                    marginBottom:
                      Math.ceil(state.items.length / columns) != index + 1
                        ? gap
                        : 0,
                  }}
                >
                  {chunk.map((item, itemIndex) => {
                    return (
                      <SortableItem
                        key={item.name}
                        id={item.name}
                        style={{
                          width: boxSize,
                          height: boxSize,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontSize: '12px',
                          color: 'white',
                          marginRight: itemIndex + 1 != chunk.length ? gap : 0,
                          // backgroundColor: 'purple',
                          backgroundColor: '#333333',
                          boxSizing: 'border-box',
                          border: 'solid 3px #818181',
                          borderRadius: '20px',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            overflowWrap: 'break-word',
                            overflow: 'hidden',
                            textAlign: 'center',
                            height: boxSize,
                            width: boxSize,
                            padding: '5px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            position: 'relative',
                            backgroundColor: '#222222',
                            boxSizing: 'border-box',
                            borderRadius: '20px',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: item.held ? 1 : 0,
                            transition: '0.1s',
                          }}
                        >
                          <OpenWithIcon
                            sx={{
                              width: 48,
                              height: 48,
                              transform: item.held
                                ? `rotate(${
                                    Math.random() < 0.5 ? '-' : ''
                                  }180deg)`
                                : 'rotate(0)',
                              transition: '0.3s',
                            }}
                          />
                        </div>
                      </SortableItem>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
  function handleDragMove(event) {
    // console.log(event);
  }

  function handleDragStart(event) {
    console.log('start');
    console.log(event.active);
    console.log(event.over);
    let index = state.items.findIndex((item) => item.name == event.active.id);
    state.items[index].held = true;
    setState({
      ...state,
      items: state.items,
    });
  }

  function handleDragEnd(event) {
    console.log('end');
    console.log(event.active);
    console.log(event.over);
    const { active, over } = event;

    let index = state.items.findIndex((item) => item.name == event.active.id);
    state.items[index].held = false;

    if (active.id !== over.id) {
      const oldIndex = state.items.findIndex((item) => item.name == active.id);
      const newIndex = state.items.findIndex((item) => item.name == over.id);

      setState({
        ...state,
        items: arrayMove(state.items, oldIndex, newIndex),
      });
    } else {
      setState({
        ...state,
        items: state.items,
      });
    }
  }
}
