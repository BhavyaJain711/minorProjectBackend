// src/controllers/excelController.js
import ExcelJS from 'exceljs';
import { fetchExamComponentData } from './dataService.js';


let lastColUsed = 0;
async function createExcelSheet(data, students,subjectData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Marks Entry');
    await worksheet.protect('312dsasfafewr312edqwdqd213ed', { selectLockedCells: false, selectUnlockedCells: true, });
    const headerStyle = getHeaderStyle();

    addMetaData(worksheet,1,subjectData);
    setupHeader(worksheet,4);
    addStudentData(worksheet, students,6);
    addComponentHeaders(worksheet, data.components, headerStyle,4);
    addGraceMarksHeader(worksheet,4);
    autoFitColumns(worksheet);

    // await saveWorkbook(workbook, 'Marks_Entry_Styled.xlsx');
    return await workbook.xlsx.writeBuffer();
}

function addMetaData(worksheet,startRow){
    worksheet.getCell('A1').value = 'Subject Name';
    worksheet.getCell('B1').value = 'Subject Code';
    worksheet.getCell('C1').value = 'Semester';
    worksheet.getCell('D1').value = 'Credit';

    worksheet.getCell('A2').value = subjectData.name;
    worksheet.getCell('B2').value = subjectData.code;
    worksheet.getCell('C2').value = subjectData.semesters;
    worksheet.getCell('D2').value = subjectData.credit;

    worksheet.columns = [
        { key: 'subjectName', width: 25 },
        { key: 'subjectCode', width: 15 },
        { key: 'semester', width: 15 },
        { key: 'credit', width: 15 },
    ];
}


// Function to set up the main header row for the worksheet
function setupHeader(worksheet, startRow = 1) {
    const headerRow = worksheet.getRow(startRow);
    headerRow.getCell(1).value = 'Student Name';
    headerRow.getCell(2).value = 'Roll Number';
    headerRow.height = 20;

    worksheet.columns = [
        { key: 'studentName', width: 25 },
        { key: 'rollNumber', width: 15 }
    ];
}

// Function to add student data starting from a specified row
function addStudentData(worksheet, students, startRow = 5) {
    students.forEach((student, index) => {
        const row = worksheet.getRow(startRow + index);
        row.getCell(1).value = student.name;
        row.getCell(2).value = student.rollNumber;
        row.height = 20;
    });
}

// Function to add component headers, merge cells, and apply formulas
function addComponentHeaders(worksheet, components, headerStyle, startRow = 1) {
    components.forEach((component, componentIndex) => {
        const startCol = worksheet.columns.length;
        const mergeCount = component.examComponents.length;

        addParentHeader(worksheet, component, startRow, startCol, mergeCount, headerStyle);
        addSubComponentHeaders(worksheet, component.examComponents, startRow, startCol, headerStyle);
        addTotalColumn(worksheet, component, startRow, startCol, mergeCount, headerStyle);
    });
}

// Function to add the parent component header and merge cells
function addParentHeader(worksheet, component, row, col, mergeCount, headerStyle) {
    const parentCell = worksheet.getCell(row, col + 1);
    parentCell.value = `${component.name} (${component.marks})`;
    parentCell.alignment = { horizontal: 'center', vertical: 'middle' };
    parentCell.font = { bold: true };

    worksheet.mergeCells(row, col + 1, row, col + mergeCount);
    applyHeaderStyle(worksheet, row, col + 1, mergeCount, headerStyle);

}

// Function to add sub-component headers
function addSubComponentHeaders(worksheet, subComponents, row, col, headerStyle) {
  subComponents.forEach((subComponent, index) => {
      const column = worksheet.getColumn(col + 1 + index);
      
      column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
          if (rowNumber > 5) {
              // Make cells editable and add data validation
              cell.protection = { locked: false };
              cell.dataValidation = {
                  type: 'whole',
                  operator: 'between',
                  showErrorMessage: true,
                  errorTitle: 'Marks Entry Error',
                  error: 'Marks should be positive integer and less than or equal to subComponent marks',
                  formulae: [0, subComponent.marks]
              };
              
              // Store weightage in the cell's note property for later use
              cell.note = `Weightage: ${subComponent.weightage/subComponent.marks}`;
          }
      });
      
      // Set up header for each subcomponent
      const subComponentCell = worksheet.getCell(row + 1, col + 1 + index);
      subComponentCell.value = `${subComponent.name} (${subComponent.marks})`;
      subComponentCell.alignment = { horizontal: 'center', vertical: 'middle' };
      subComponentCell.font = { bold: true };
      subComponentCell.style = headerStyle;
  });
}

// Function to add the total column and apply formula based on component type
function addTotalColumn(worksheet, component, row, col, mergeCount, headerStyle) {
  const totalCell = worksheet.getCell(row, col + mergeCount + 1);
  lastColUsed = col + mergeCount + 1;
  
  // Set up total cell header
  totalCell.value = `${component.name} Total (${component.weightage})`;
  totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totalCell.font = { bold: true };
  totalCell.style = headerStyle;
  totalCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
  };

  const totalCol = worksheet.getColumn(col + mergeCount + 1);
  
  // Determine the formula prefix based on component type
  const formulaPrefix = getFormulaPrefix(component.type);

  // Apply formula to each cell in the total column based on subcomponent weightages
  totalCol.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 5) {
          let weightedFormulas = []; // Array to store individual weighted formulas

          // Loop over each subcomponent cell and build weighted formula parts
          for (let i = 0; i < mergeCount; i++) {
              const subComponentCell = worksheet.getCell(rowNumber, col + 1 + i);
              
              // Get weightage from note and apply if present
              if (subComponentCell.note) {
                  const weightageFactor = parseFloat(subComponentCell.note.split(': ')[1]);
                  const cellLetter = worksheet.getColumn(col + 1 + i).letter;
                  
                  // Build the formula as a weighted value for each subcomponent cell
                  weightedFormulas.push(`(${cellLetter}${rowNumber} * ${weightageFactor})`);
              }
          }

          // Join weighted formulas and wrap them in the appropriate formula type
          cell.value = { formula: `=${formulaPrefix}${weightedFormulas.join(',')}) / ${component.marks} * ${component.weightage}` };
      }
  });
}

function addGraceMarksHeader(worksheet, startRow) {
    const graceMarksCell = worksheet.getCell(startRow, lastColUsed + 1);
    graceMarksCell.value = 'Grace Marks';
    graceMarksCell.alignment = { horizontal: 'center', vertical: 'middle' };

    
}

// Helper function to get the appropriate formula prefix based on component type
function getFormulaPrefix(type) {
    switch (type) {
        case 'best_of_n':
            return 'MAX(';
        case 'sum_of_n':
            return 'SUM(';
        case 'average_of_n':
            return 'AVERAGE(';
        default:
            return '';
    }
}

// Function to auto-fit columns based on the content length
function autoFitColumns(worksheet) {
    worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        column.width = maxLength < 10 ? 10 : maxLength;
    });
}

// Function to apply a consistent style to header cells
function applyHeaderStyle(worksheet, row, startCol, mergeCount, style) {
    for (let i = 0; i < mergeCount; i++) {
        worksheet.getCell(row, startCol + i).style = style;
    }
}

// Function to get the header style object
function getHeaderStyle() {
    return {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };
}

// Function to save the workbook to a file
async function saveWorkbook(workbook, fileName) {
    await workbook.xlsx.writeFile(fileName);
    console.log(`${fileName} created successfully.`);
}

// Example data and students to demonstrate functionality
// const data = {
//     components: [
//         {
//             name: 'IA',
//             weightage: 25,
//             type: 'best_of_n',
//             examComponents: [
//                 { name: 'Quiz 1', weightage: 25 },
//                 { name: 'Quiz 2', weightage: 25 }
//             ]
//         },
//         {
//             name: 'Mid Semester',
//             weightage: 25,
//             type: 'sum_of_n',
//             examComponents: [
//                 { name: 'Question 1', weightage: 10 },
//                 { name: 'Question 2', weightage: 15 }
//             ]
//         },
//         {
//             name: 'End Semester',
//             weightage: 50,
//             type: 'sum_of_n',
//             examComponents: [
//                 { name: 'Q1', weightage: 50 }
//             ]
//         }
//     ]
// };

const studentsData = [
    { name: 'A', rollNumber: "21BCP091" },
    { name: 'B', rollNumber: "21BCP092" },
    { name: 'C', rollNumber: "21BCP093" }
];

const subjectData={
    "_id": {
      "$oid": "66d579adeb28e73c66d7fa40"
    },
    "name": "Artificial Intelligence",
    "code": "20CP304T",
    "department": "66d56f6020de3e769d84bfbf",
    "courses": [
      "66d57922eb28e73c66d7fa27"
    ],
    "semesters": [
      6
    ],
    "credit": 3,
    "createdAt": {
      "$date": "2024-09-02T08:39:09.162Z"
    },
    "updatedAt": {
      "$date": "2024-09-02T08:39:09.162Z"
    },
    "__v": 0
  }

const data={
    "_id": {
      "$oid": "67349f5c370b7160ffd99b93"
    },
    "name": "Trial",
    "subject": [
      "66d579adeb28e73c66d7fa40"
    ],
    "year": 2025,
    "semester": 7,
    "components": [
      {
        "name": "Mid Sem",
        "weightage": 25,
        "marks": 50,
        "type": "sum_of_n",
        "bestOfSettings": {},
        "examComponents": [
          {
            "name": "Q1",
            "weightage": 10,
            "marks": 10,
            "id": "67349f5c62ab621654583a10",
            "blockName": "A-1",
            "blockType": "exam-sub-component"
          },
          {
            "name": "Q2",
            "weightage": 20,
            "marks": 20,
            "id": "67349f5c62ab621654583a11",
            "blockName": "A-2",
            "blockType": "exam-sub-component"
          },
          {
            "name": "Q3",
            "weightage": 20,
            "marks": 20,
            "id": "67349f5c62ab621654583a12",
            "blockType": "exam-sub-component"
          }
        ],
        "id": "67349f5c62ab621654583a0d",
        "blockType": "exam-name"
      },
      {
        "name": "End Semester",
        "weightage": 50,
        "marks": 100,
        "type": "sum_of_n",
        "bestOfSettings": {},
        "examComponents": [
          {
            "name": "half",
            "weightage": 50,
            "marks": 100,
            "id": "67349f5c62ab621654583a13",
            "blockType": "exam-sub-component"
          },
          {
            "name": "half-2",
            "weightage": 50,
            "marks": 200,
            "id": "67349f5c62ab621654583a14",
            "blockType": "exam-sub-component"
          }
        ],
        "id": "67349f5c62ab621654583a0e",
        "blockType": "exam-name"
      },
      {
        "name": "IA",
        "weightage": 25,
        "marks": 50,
        "type": "sum_of_n",
        "bestOfSettings": {},
        "examComponents": [
          {
            "name": "IA-1",
            "weightage": 50,
            "marks": 25,
            "id": "67349f5c62ab621654583a15",
            "blockType": "exam-sub-component"
          }
        ],
        "id": "67349f5c62ab621654583a0f",
        "blockType": "exam-name"
      }
    ],
    "createdAt": {
      "$date": "2024-11-13T12:45:16.729Z"
    },
    "updatedAt": {
      "$date": "2024-11-13T12:45:16.729Z"
    },
    "__v": 0
  }


// Call the function to create the Excel sheet with styling
createExcelSheet(data, studentsData,subjectData);


// Controller to generate and send Excel file
export async function downloadExcel(req, res) {
  const { examComponentId } = req.params;
  const token=req.header("Authorization");

  try {
    // Fetch data from Payload CMS
    const { examComponent, subject } = await fetchExamComponentData(examComponentId,token);

    // Create Excel workbook
    const workbook = await createExcelSheet(examComponent, studentsData, subject);

    // Send Excel file to client
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Marks_Entry_${subject.name}.xlsx`);
    
    // Write the Excel file to the response
    await res.send(workbook);
    res.end();
  } catch (error) {
    console.error('Error generating Excel sheet:', error);
    res.status(500).send('Error generating Excel sheet');
  }
}
