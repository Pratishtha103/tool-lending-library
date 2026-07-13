import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sanitizeObject } from "../../../services/security";

const dataFilePath = path.join(process.cwd(), "src", "data", "tools.json");

// Helper to read database
function readDatabase() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading tools file:", error);
    return [];
  }
}

// Helper to write database
function writeDatabase(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing tools file:", error);
    return false;
  }
}

// Helper to simulate latency
async function simulateLatency(request) {
  const { searchParams } = new URL(request.url);
  const latency = searchParams.get("latency");
  
  if (latency === "slow3g") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  } else if (latency === "high") {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
}

// GET - Retrieve tools
export async function GET(request) {
  await simulateLatency(request);
  const tools = readDatabase();
  return NextResponse.json(tools);
}

// POST - Create a new tool
export async function POST(request) {
  await simulateLatency(request);
  
  try {
    const rawData = await request.json();
    const data = sanitizeObject(rawData);
    
    const { name, category, serialNumber, description, status, borrowerName, dueDate, operator } = data;
    
    // Server-side validation
    const errors = {};
    if (!name || name.trim() === "") errors.name = "Tool name is required.";
    if (!category || category.trim() === "") errors.category = "Category is required.";
    
    // Serial number check: Must match pattern TL-XXXXX
    const serialPattern = /^TL-\d{5}$/;
    if (!serialNumber) {
      errors.serialNumber = "Serial number is required.";
    } else if (!serialPattern.test(serialNumber.trim())) {
      errors.serialNumber = "Serial number must follow the format TL-XXXXX (e.g. TL-12345).";
    }
    
    // Loaned validation
    if (status === "Loaned") {
      if (!borrowerName || borrowerName.trim() === "") errors.borrowerName = "Borrower name is required for loaned tools.";
      if (!dueDate || dueDate.trim() === "") errors.dueDate = "Due date is required for loaned tools.";
    }
    
    const tools = readDatabase();
    
    // Check if serial number already exists
    if (serialNumber && tools.some(t => t.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase())) {
      errors.serialNumber = "Serial number is already registered in the library.";
    }
    
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }
    
    const newTool = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      category: category.trim(),
      serialNumber: serialNumber.trim().toUpperCase(),
      description: description ? description.trim() : "",
      status: status || "Available",
      borrowerName: status === "Loaned" ? borrowerName.trim() : null,
      dueDate: status === "Loaned" ? dueDate : null,
      lastUpdated: new Date().toISOString(),
      updatedBy: operator || "Manager"
    };
    
    tools.push(newTool);
    writeDatabase(tools);
    
    // Telemetry log
    console.log(`[Analytics] User interacted with Feature Complete CRUD - CREATE - Tool Serial: ${newTool.serialNumber}`);
    
    return NextResponse.json({ success: true, tool: newTool });
  } catch (error) {
    console.error("API error during POST:", error);
    return NextResponse.json({ success: false, message: "Server error occurred." }, { status: 500 });
  }
}

// PUT - Update a tool or status
export async function PUT(request) {
  await simulateLatency(request);
  
  try {
    const rawData = await request.json();
    const data = sanitizeObject(rawData);
    
    const { id, name, category, serialNumber, description, status, borrowerName, dueDate, operator } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Tool ID is required." }, { status: 400 });
    }
    
    const tools = readDatabase();
    const toolIndex = tools.findIndex(t => t.id === id);
    
    if (toolIndex === -1) {
      return NextResponse.json({ success: false, message: "Tool not found." }, { status: 404 });
    }
    
    const errors = {};
    if (!name || name.trim() === "") errors.name = "Tool name is required.";
    if (!category || category.trim() === "") errors.category = "Category is required.";
    
    const serialPattern = /^TL-\d{5}$/;
    if (!serialNumber) {
      errors.serialNumber = "Serial number is required.";
    } else if (!serialPattern.test(serialNumber.trim())) {
      errors.serialNumber = "Serial number must follow format TL-XXXXX.";
    }
    
    if (status === "Loaned") {
      if (!borrowerName || borrowerName.trim() === "") errors.borrowerName = "Borrower name is required.";
      if (!dueDate || dueDate.trim() === "") errors.dueDate = "Due date is required.";
    }
    
    // Check if new serial number is duplicated
    if (serialNumber && tools.some(t => t.id !== id && t.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase())) {
      errors.serialNumber = "Serial number is already registered by another tool.";
    }
    
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }
    
    const updatedTool = {
      ...tools[toolIndex],
      name: name.trim(),
      category: category.trim(),
      serialNumber: serialNumber.trim().toUpperCase(),
      description: description ? description.trim() : "",
      status: status || "Available",
      borrowerName: status === "Loaned" ? borrowerName.trim() : null,
      dueDate: status === "Loaned" ? dueDate : null,
      lastUpdated: new Date().toISOString(),
      updatedBy: operator || "Manager"
    };
    
    tools[toolIndex] = updatedTool;
    writeDatabase(tools);
    
    // Telemetry log
    console.log(`[Analytics] User interacted with Feature Complete CRUD - UPDATE - Tool Serial: ${updatedTool.serialNumber}`);
    
    return NextResponse.json({ success: true, tool: updatedTool });
  } catch (error) {
    console.error("API error during PUT:", error);
    return NextResponse.json({ success: false, message: "Server error occurred." }, { status: 500 });
  }
}

// DELETE - Remove a tool
export async function DELETE(request) {
  await simulateLatency(request);
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const operator = searchParams.get("operator") || "Manager";
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Tool ID is required." }, { status: 400 });
    }
    
    const tools = readDatabase();
    const toolIndex = tools.findIndex(t => t.id === id);
    
    if (toolIndex === -1) {
      return NextResponse.json({ success: false, message: "Tool not found." }, { status: 404 });
    }
    
    const deletedTool = tools[toolIndex];
    tools.splice(toolIndex, 1);
    writeDatabase(tools);
    
    // Telemetry log
    console.log(`[Analytics] User interacted with Feature Complete CRUD - DELETE - Tool Serial: ${deletedTool.serialNumber}`);
    
    return NextResponse.json({ success: true, message: "Tool deleted successfully." });
  } catch (error) {
    console.error("API error during DELETE:", error);
    return NextResponse.json({ success: false, message: "Server error occurred." }, { status: 500 });
  }
}
