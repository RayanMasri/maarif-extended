import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MuiMenu from '@mui/material/Menu';

import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';

import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function Menu(props) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleClick = (option) => {
    props.onChange(option);
    setOpen(false);
  };

  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const [selectedIndex, setSelectedIndex] = React.useState(0);
  // const handleClickListItem = (event) => {
  //   setAnchorEl(event.currentTarget);
  //   console.log(anchorEl);
  // };

  // const handleMenuItemClick = (option) => {
  // props.onChange(option);
  //   setAnchorEl(null);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  return (
    <div
      style={{
        width: props.width,
      }}
    >
      <Button
        fullWidth
        onClick={handleToggle}
        ref={anchorRef}
        style={{
          color: '#8D8D8D',
          backgroundColor: 'white',
          textAlign: 'left',
          fontFamily: 'GESSTwoLight,GESSTwo,Tahoma',
          justifyContent: 'space-between',
          display: 'flex',
          height: '31px',
          fontSize: '14px',
          borderRadius: '0px',
        }}
      >
        <div
          style={{
            marginLeft: '5px',
            textTransform: 'none',
          }}
        >
          {!props.value || !props.options.includes(props.value)
            ? props.default
            : props.value}
        </div>
        <KeyboardArrowDownIcon
          sx={{
            width: 24,
            height: 24,
          }}
        />
      </Button>
      {/* 1E90FF */}

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        sx={{
          width: props.width,
          zIndex: 35002,
        }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  sx={{
                    color: '#8D8D8D',
                    '&& .Mui-selected': {
                      backgroundColor: '#1E90FF',
                      color: 'white',
                      opacity: 1,
                    },
                    '&& .Mui-selected:hover': {
                      backgroundColor: '#1E90FF',
                    },
                  }}
                  autoFocusItem={open}
                  id={`list-${props.id}`}
                >
                  {props.options.map((option, index) => (
                    <MenuItem
                      key={`menu-${props.id}-${option}`}
                      // If value does not exist in options, or value is null,
                      // set option to be selected if it is the default.
                      // Otherwise, set option to selected if it equals the value
                      selected={
                        !props.value || !props.options.includes(props.value)
                          ? props.default == option
                          : props.value == option
                      }
                      onClick={() => handleClick(option)}
                      sx={{
                        fontSize: '14px',
                        height: '21px',
                        fontFamily: 'GESSTwoLight,GESSTwo,Tahoma',
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {/* <MuiMenu
        anchorEl={anchorEl}
        open={anchorEl != null}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: props.width,
            backgroundColor: 'white',
          },
        }}
        MenuListProps={{
          sx: {
            justifyContent: 'flex-end !important',
            color: '#8D8D8D',
            '&& .Mui-selected': {
              backgroundColor: '#1E90FF',
              color: 'white',
              opacity: 1,
            },
            '&& .Mui-selected:hover': {
              backgroundColor: '#1E90FF',
            },
          },
        }}
        className="popover-menu"
      >
        {props.options.map((option, index) => (
          <MenuItem
            key={`menu-${props.id}-${option}`}
            // If value does not exist in options, or value is null,
            // set option to be selected if it is the default.
            // Otherwise, set option to selected if it equals the value
            selected={
              !props.value || !props.options.includes(props.value)
                ? props.default == option
                : props.value == option
            }
            onClick={(event) => handleMenuItemClick(option)}
            sx={{
              fontSize: '14px',
              justifyContent: 'flex-end !important',
              height: '21px',
              fontFamily: 'GESSTwoLight,GESSTwo,Tahoma',
            }}
          >
            {option}
          </MenuItem>
        ))}
      </MuiMenu> */}
    </div>
  );
}
