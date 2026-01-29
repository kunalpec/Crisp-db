import React, { useState } from 'react'
import { VisitorSocket } from "./VisitorSocket";
import { EmployeeSocket } from "./EmployeeSocket";
import TestLogin from './TestLogin';
const ChatBoard = () => {
  const [visitor, setVisitor] = useState("");

  return (
    <div>
      {!visitor && (
        <>
          <button onClick={() => setVisitor("visitor")}>Visitor</button>
          <button onClick={() => setVisitor("employee")}>Employee</button>
          <TestLogin/>
        </>
      )}

      {visitor === "visitor" && <VisitorSocket />}
      {visitor === "employee" && <EmployeeSocket />}
    </div>
  );
};

export default ChatBoard;