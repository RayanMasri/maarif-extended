import React, { useState, useEffect } from 'react';
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
import useUtilityHook from '../../hooks/UtilityHook.jsx';

const boxSize = 80;
const gap = 7;
const columns = 5;

// same order when switchingg
// exam order holder height dont change
// dominant clusters
// merge previous and ahead indices by filtering them
// on change with nestewd properties, just filter all them out and place them in indices

export function SortableGrid(props) {
  const { getObjectArrayUnique } = useUtilityHook();
  const [state, setState] = useState({
    items: getObjectArrayUnique(props.items, props.access),
    // items: props.items,
    // temporary: props.items.map(item => item[props.access]),
    held: -1,
  });

  useEffect(() => {
    setState({
      ...state,
      items: getObjectArrayUnique(props.items, props.access),
    });
    // console.log(`switched access to ${props.access}`);
  }, [props.access, props.items]);

  useEffect(() => {
    setState({
      ...state,
      items: getObjectArrayUnique(props.items, props.access),
    });

    document.dispatchEvent(
      new CustomEvent('force-update-advanced-dropdown', {
        detail: { hierarchyDifference: 1 },
      })
    );
    document.dispatchEvent(
      new CustomEvent('force-update-order-dropdown', {
        detail: { hierarchyDifference: 0 },
      })
    );

    console.log(`filters changed a lot`);
  }, [JSON.stringify(props.filters)]);

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
  // on each access change,  change items to order each other

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

      let ordered = state.items
        .map((accessed) => {
          let filtered = props.items.filter(
            (item) => item[props.access] == accessed
          );

          return filtered;
        })
        .flat();

      console.log(ordered);

      props.onChange(ordered);

      // [a^a, b^b, c^a, d^a, f^c, e^c]

      // props.onChange(numerize(state.items));
      // props.onChange(state.items);
    } else {
      setState({
        ...state,
        held: -1,
      });
    }
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
                          {item}
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
