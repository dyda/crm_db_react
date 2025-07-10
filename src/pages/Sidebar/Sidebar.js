import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse, IconButton, Divider, Box,
} from '@mui/material';
import { Home, ContactMail, ExpandLess, ExpandMore, Menu, People, Settings, Logout ,Category,} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [nestedCompanyOpen, setCompanyNestedOpen] = useState(false);
  const [nestedEmployeeOpen, setEmployeeNestedOpen] = useState(false);
  const [nestedItemOpen, setItemNestedOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleNestedToggle = () => {
    setNestedOpen(!nestedOpen);
  };

  const handleCompanyNestedToggle = () => {
    setCompanyNestedOpen(!nestedCompanyOpen);
  };
  const handleEmployeeNestedToggle = () => {
    setEmployeeNestedOpen(!nestedEmployeeOpen);
  };

  const handleItemNestedToggle = () => {
    setItemNestedOpen(!nestedItemOpen);
  };

  const getTextStyles = () => ({
    color: 'white',
    '&:hover': {
      color: '#ffcc00',
    },
    cursor: 'pointer',
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
     localStorage.removeItem('authTokenExpiry');
    navigate('/');
  };

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 1200,
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
          color: '#000',
          borderRadius: '50%',
          boxShadow: 2,
        }}
        aria-label="Toggle menu"
      >
        <Menu />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            backgroundColor: '#002147',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <List sx={{ width: 250 }}>
            <ListItem button component={Link} to="/dashboard">
              <ListItemIcon sx={{ color: 'white' }}>
                <Home />
              </ListItemIcon>
              <ListItemText primary="داشبۆرد" sx={getTextStyles()} />
            </ListItem>

            <ListItem button onClick={handleNestedToggle} aria-expanded={nestedOpen}>
              <ListItemIcon sx={{ color: 'white' }}>
                <People />
              </ListItemIcon>
              <ListItemText primary="کڕیار" sx={getTextStyles()} />
              {nestedOpen ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
            </ListItem>

            <Collapse in={nestedOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
              <ListItem button component={Link} to="/customer_category">
                  <ListItemText inset primary="گرووپ" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/customer">
                  <ListItemText inset primary="ناساندن" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/customer/payment">
                  <ListItemText inset primary="واصڵكردن پارە" sx={getTextStyles()} />
                </ListItem>
             
              </List>
              <Divider sx={{ backgroundColor: 'white' }} />
            </Collapse>

            <ListItem button component={Link} to="/contact">
              <ListItemIcon sx={{ color: 'white' }}>
                <ContactMail />
              </ListItemIcon>
              <ListItemText primary="Contact" sx={getTextStyles()} />
            </ListItem>
            <Divider sx={{ backgroundColor: 'white' }} />

             <ListItem button onClick={handleItemNestedToggle} aria-expanded={nestedItemOpen}>
              <ListItemIcon sx={{ color: 'white' }}>
                <Category />
              </ListItemIcon>
              <ListItemText primary="زانیاری کاڵا" sx={getTextStyles()} />
              {nestedItemOpen ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
            </ListItem>

            <Collapse in={nestedItemOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>


                <ListItem button component={Link} to="/item">
                  <ListItemText inset primary=" کاڵا" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/item/category">
                  <ListItemText inset primary=" گرووپەکان" sx={getTextStyles()} />
                </ListItem>
                 <ListItem button component={Link} to="/item/brand">
                  <ListItemText inset primary=" براندەکان" sx={getTextStyles()} />
                </ListItem>
                 <ListItem button component={Link} to="/item/unit">
                  <ListItemText inset primary=" یەکەکان" sx={getTextStyles()} />
                </ListItem>
                 <ListItem button component={Link} to="/item/price/type">
                  <ListItemText inset primary="جۆری نرخەکان" sx={getTextStyles()} />
                </ListItem>
                    <ListItem button component={Link} to="/item/transaction">
                  <ListItemText inset primary="ڕێکخستنەوەی کۆگا" sx={getTextStyles()} />
                </ListItem>
                
              </List>
              <Divider sx={{ backgroundColor: 'white' }} />
            </Collapse>


            <Divider sx={{ backgroundColor: 'white' }} />

            <ListItem button onClick={handleEmployeeNestedToggle} aria-expanded={nestedEmployeeOpen}>
              <ListItemIcon sx={{ color: 'white' }}>
                <People />
              </ListItemIcon>
              <ListItemText primary="بەڕێوبەرایەتی" sx={getTextStyles()} />
              {nestedEmployeeOpen ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
            </ListItem>

            <Collapse in={nestedEmployeeOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>

                <ListItem button component={Link} to="/user">
                  <ListItemText inset primary=" کارمەندەکان" sx={getTextStyles()} />
                </ListItem>
                 <ListItem button component={Link} to="/salary">
                  <ListItemText inset primary=" مووچەدان" sx={getTextStyles()} />
                </ListItem>

              </List>
              <Divider sx={{ backgroundColor: 'white' }} />
            </Collapse>




            <ListItem button onClick={handleCompanyNestedToggle} aria-expanded={nestedCompanyOpen}>
              <ListItemIcon sx={{ color: 'white' }}>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="ڕێکخستن" sx={getTextStyles()} />
              {nestedCompanyOpen ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
            </ListItem>

            <Collapse in={nestedCompanyOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button component={Link} to="/company/">
                  <ListItemText inset primary="زانیاری کۆمپانیا" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/city/">
                  <ListItemText inset primary="شارەکان" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/zone/">
                  <ListItemText inset primary="زۆنەکان" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/region/">
                  <ListItemText inset primary="ناوچەکان" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/branch/">
                  <ListItemText inset primary="لقەکان" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/warehouse">
                  <ListItemText inset primary="کۆگاکان" sx={getTextStyles()} />
                </ListItem>
                <ListItem button component={Link} to="/currency">
                  <ListItemText inset primary="دراوەکان" sx={getTextStyles()} />
                </ListItem>
                 <ListItem button component={Link} to="/currency-rate">
                  <ListItemText inset primary="نرخی دراوەکان" sx={getTextStyles()} />
                </ListItem>

              </List>
              <Divider sx={{ backgroundColor: 'white' }} />
            </Collapse>
          </List>
        </Box>

        <List>
          <ListItem button onClick={handleLogout} sx={{ cursor: 'pointer' }}>
            <ListItemIcon sx={{ color: 'white' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="چوونەدەرەوە" sx={{ color: 'white' }} />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
