import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565c0",
    },
    secondary: {
      main: "#6a1b9a",
    },
    background: {
      default: "#f5f7fa",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}