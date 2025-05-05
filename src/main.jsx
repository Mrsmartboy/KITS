import React from "react";
import "./index.css";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from "./App.jsx";
import { JobsProvider } from "./contexts/JobsContext.jsx";
import { StudentsDataProvider } from "./contexts/StudentsListContext.jsx";
import { StudentsManageProvider } from "./contexts/ManagerStudentsContext.jsx";
import { StudentsMentorProvider } from "./contexts/MentorStudentsContext.jsx";
import { StudentsApplyProvider } from "./contexts/StudentsApplyContext.jsx";
import { DashboardProvider } from "./contexts/DashboardContext.jsx";
import { EditProvider } from "./contexts/EditContext.jsx";
import { StudentProvider } from "./contexts/StudentProfileContext.jsx";
import { UniqueBatchesProvider } from "./contexts/UniqueBatchesContext.jsx";
import { DailyProvider } from "./contexts/DailyContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { FlagsProvider } from "./contexts/FlagsContext.jsx";

const theme = createTheme();
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <UniqueBatchesProvider>
        <JobsProvider>
          <StudentsDataProvider>
            <StudentsManageProvider>
              <StudentsMentorProvider>
                <StudentsApplyProvider>
                  <DashboardProvider>
                    <StudentProvider>
                      <EditProvider>
                        <DailyProvider>
                          <NotificationProvider>
                            <FlagsProvider>
                              <App />
                            </FlagsProvider>
                          </NotificationProvider>
                        </DailyProvider>
                      </EditProvider>
                    </StudentProvider>
                  </DashboardProvider>
                </StudentsApplyProvider>
              </StudentsMentorProvider>
            </StudentsManageProvider>
          </StudentsDataProvider>
        </JobsProvider>
      </UniqueBatchesProvider>
    </ThemeProvider>
  </BrowserRouter>
);
