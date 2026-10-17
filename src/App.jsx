import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./hooks/useDarkMode";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
