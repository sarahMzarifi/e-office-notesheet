import { useState } from "react";
import Link from "next/link";

import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";

import { useAuth } from "../../context/AuthContext";

const drawerWidth = 240;

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardOutlinedIcon />,
      href: "/",
    },
    {
      label: "Notesheets",
      icon: <DescriptionOutlinedIcon />,
      href: "/notesheets",
    },
    {
      label: "My Drafts",
      icon: <DraftsOutlinedIcon />,
      href: "/notesheets?status=DRAFT",
    },
    {
      label: "My Work",
      icon: <AssignmentOutlinedIcon />,
      href: "/workflow",
    },
  ];

  const handleMobileDrawerOpen = (event) => {
    event.currentTarget.blur();
    setMobileDrawerOpen(true);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const handleMobileLogout = () => {
    setMobileDrawerOpen(false);
    logout();
  };

  const drawerContent = (
    <Box sx={{ px: 1.5, py: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          px: 1.5,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Workspace
      </Typography>

      <List sx={{ mt: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.label}
            component={Link}
            href={item.href}
            onClick={handleMobileDrawerClose}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              "&:hover": {
                backgroundColor: "#f0f6ff",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: "#1565c0",
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  fontSize: 14,
                  fontWeight: 500,
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <List>
        <ListItemButton
          component={Link}
          href="/profile"
          onClick={handleMobileDrawerClose}
          sx={{
            borderRadius: 1.5,
            "&:hover": {
              backgroundColor: "#f0f6ff",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: "#6b7280",
            }}
          >
            <AccountCircleOutlinedIcon />
          </ListItemIcon>

          <ListItemText
            primary="Profile"
            slotProps={{
              primary: {
                fontSize: 14,
                fontWeight: 500,
              },
            }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleMobileLogout}
          sx={{
            borderRadius: 1.5,
            "&:hover": {
              backgroundColor: "#fff5f5",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: "#6b7280",
            }}
          >
            <LogoutOutlinedIcon />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            slotProps={{
              primary: {
                fontSize: 14,
                fontWeight: 500,
              },
            }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#ffffff",
          color: "#1f2937",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important" }}>
          <IconButton
            edge="start"
            aria-label="open navigation menu"
            onClick={handleMobileDrawerOpen}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              mr: 1,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1565c0",
            }}
          >
            E-Office
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ textAlign: "right", mr: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600 }}
            >
              {user?.username}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {user?.role}
            </Typography>
          </Box>

          <IconButton
            onClick={logout}
            aria-label="logout"
          >
            <LogoutOutlinedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Sidebar */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important" }} />

        {drawerContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important" }} />

        <Box sx={{ px: 1.5, py: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              px: 1.5,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Workspace
          </Typography>

          <List sx={{ mt: 1 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.label}
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: "#f0f6ff",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: "#1565c0",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: 14,
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <List>
            <ListItemButton
              component={Link}
              href="/profile"
              sx={{
                borderRadius: 1.5,
                "&:hover": {
                  backgroundColor: "#f0f6ff",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "#6b7280",
                }}
              >
                <AccountCircleOutlinedIcon />
              </ListItemIcon>

              <ListItemText
                primary="Profile"
                slotProps={{
                  primary: {
                    fontSize: 14,
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={logout}
              sx={{
                borderRadius: 1.5,
                "&:hover": {
                  backgroundColor: "#fff5f5",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "#6b7280",
                }}
              >
                <LogoutOutlinedIcon />
              </ListItemIcon>

              <ListItemText
                primary="Logout"
                slotProps={{
                  primary: {
                    fontSize: 14,
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          backgroundColor: "#f5f7fa",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important" }} />

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}