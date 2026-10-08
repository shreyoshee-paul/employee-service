const express = require("express");
const app = express();
app.use(express.json());

// In-memory employee list
let employees = [];

// Logger middleware
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Validation middleware
function validateEmployee(req, res, next) {
  const { name, department } = req.body;
  if (!name || !department) {
    return res.status(400).json({ message: "Name and department are required" });
  }
  next();
}

// Authentication middleware (basic example)
function checkAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Routes

// GET all employees
app.get("/employees", (req, res) => {
  res.status(200).json(employees);
});

// GET employee by ID
app.get("/employees/:id", (req, res) => {
  const id = Number(req.params.id);
  const employee = employees.find(e => e.id === id);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  res.json(employee);
});

// POST create employee
app.post("/employees", validateEmployee, (req, res) => {
  const employee = { id: employees.length + 1, ...req.body };
  employees.push(employee);
  res.status(201).json(employee);
});

// PUT update employee (replace)
app.put("/employees/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Employee not found" });
  }
  employees[index] = { id, ...req.body };
  res.json(employees[index]);
});

// PATCH update selected fields
app.patch("/employees/:id", (req, res) => {
  const id = Number(req.params.id);
  const employee = employees.find(e => e.id === id);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  Object.assign(employee, req.body);
  res.json(employee);
});

// DELETE employee
app.delete("/employees/:id", (req, res) => {
  const id = Number(req.params.id);
  const oldLength = employees.length;
  employees = employees.filter(e => e.id !== id);
  if (employees.length === oldLength) {
    return res.status(404).json({ message: "Employee not found" });
  }
  res.json({ message: "Employee deleted" });
});

// Filter by department
app.get("/employees", (req, res) => {
  const { department, name } = req.query;
  let result = employees;
  if (department) {
    result = result.filter(e => e.department === department);
  }
  if (name) {
    result = result.filter(e => e.name === name);
  }
  res.json(result);
});
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});
// Route to force an error
app.get("/test-error", (req, res, next) => {
  next(new Error("Forced error for testing"));
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
