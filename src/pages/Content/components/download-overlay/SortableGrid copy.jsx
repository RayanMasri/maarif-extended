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

// same order when switchingg

export function SortableGrid(props) {
  const [state, setState] = useState({
    // items: props.datas.map((item) => item[props.access]),
    items: props.items.map((item) => `item-${item}`),
    access: props.access,
    held: -1,
  });

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const makeChunks = (arr, n) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += n) {
      chunks.push(arr.slice(i, i + n));
    }
    return chunks;
  };

  const handleDragStart = (event) => {
    let index = state.items.findIndex((item) => item == event.active.id);
    console.log(`Holding ${index}`);
    setState({
      ...state,
      held: index,
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    console.log(active.id);
    console.log(over.id);
    if (active.id !== over.id) {
      const oldIndex = state.items.findIndex((item) => item == active.id);
      const newIndex = state.items.findIndex((item) => item == over.id);

      // [state.items[oldIndex], state.items[newIndex]] =  [state.items[newIndex], state.items[oldIndex]]
      state.items = arrayMove(state.items, oldIndex, newIndex);

      setState({
        ...state,
        items: state.items,
        held: -1,
      });

      console.log(`on change ${JSON.stringify(state.items)}`);
      props.onChange(numerize(state.items));
    } else {
      setState({
        ...state,
        held: -1,
      });
    }
  };

  const numerize = (array) => {
    return array.map((item) => parseInt(item.split('-')[1]));
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
        onDragStart={handleDragStart}
      >
        <SortableContext items={state.items}>
          <div
            style={{
              position: 'relative',
              width: '100%',
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
                      <SortableItem
                        key={item}
                        id={item}
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
                          {
                            props.datas[parseInt(item.split('-')[1])][
                              props.access
                            ]
                          }
                          {/* {item} */}
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
                            opacity:
                              itemIndex + index * columns == state.held ? 1 : 0,
                            transition: '0.1s',
                          }}
                        >
                          <OpenWithIcon
                            sx={{
                              width: 48,
                              height: 48,
                              transform:
                                itemIndex + index * columns == state.held
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
}
