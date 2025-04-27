// NotificationDrawer.js
import React, { useState, useContext } from "react";
import {
  Badge,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { NotificationContext } from "../contexts/NotificationContext";

const NotificationDrawer = () => {
  const {
    notifications,
    unreadCount,
    markNotificationAsViewed,
    markAllAsViewed,
  } = useContext(NotificationContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
    // Optionally, if you want to mark all notifications as read when the drawer opens:
    // if (open) markAllAsViewed();
  };

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{ "& .MuiBadge-badge": { fontWeight: "bold" } }}
        >
          <NotificationsIcon sx={{ color: "black" }} />
        </Badge>
      </Button>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <div style={{ width: 300, padding: 16 }}>
          <h3>Notifications</h3>
          <Divider />
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem key={notification.id} alignItems="flex-start">
                  <ListItemText
                    primary={`Received: ${new Date(
                      notification.timestamp
                    ).toLocaleString()}`}
                    secondary={
                      <>
                        {notification.subtopics.map((sub, idx) => (
                          <div key={idx}>
                            {sub.tag} - {sub.status}
                          </div>
                        ))}
                      </>
                    }
                  />
                  {!notification.viewed && (
                    <Button
                      onClick={() => markNotificationAsViewed(notification.id)}
                    >
                      Mark as viewed
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          )}
          <Divider style={{ margin: "16px 0" }} />
          {notifications.length > 0 && (
            <Button
              onClick={markAllAsViewed}
              fullWidth
              variant="contained"
              color="primary"
            >
              Mark all as viewed
            </Button>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default NotificationDrawer;
