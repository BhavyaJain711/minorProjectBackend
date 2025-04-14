import ExcelJS from 'exceljs';

export async function parseExcelSheet(fileBuffer) {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet('Marks Entry');

        if (!worksheet) {
            throw new Error('Worksheet "Marks Entry" not found');
        }

        // Parse subject metadata
        const subjectData = {
            name: worksheet.getCell('A2').value,
            code: worksheet.getCell('B2').value,
            semester: worksheet.getCell('C2').value,
            credit: worksheet.getCell('D2').value
        };

        // Get the last row with data
        const lastRow = worksheet.lastRow;
        if (!lastRow) {
            throw new Error('No data found in the worksheet');
        }

        // Initialize array to store parsed data
        const parsedData = {
            subject: subjectData,
            students: []
        };

        // Start from row 6 (where student data begins)
        for (let rowNumber = 6; rowNumber <= lastRow.number; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            
            // Skip empty rows
            if (!row.getCell(1).value) continue;

            const studentData = {
                name: row.getCell(1).value,
                rollNumber: row.getCell(2).value,
                marks: {}
            };

            // Get all columns after student info
            const columns = worksheet.columnCount;
            let currentComponent = null;
            let currentSubComponents = [];

            // Start from column 3 (after student info)
            for (let colNumber = 3; colNumber <= columns; colNumber++) {
                const cell = row.getCell(colNumber);
                const headerCell = worksheet.getRow(4).getCell(colNumber);
                const subHeaderCell = worksheet.getRow(5).getCell(colNumber);

                // Skip grace marks column
                if (headerCell.value === 'Grace Marks') continue;

                // If this is a new component header
                if (headerCell.value && headerCell.value.includes('Total')) {
                    if (currentComponent) {
                        // Save previous component data
                        studentData.marks[currentComponent] = {
                            subComponents: currentSubComponents,
                            total: cell.value
                        };
                    }

                    // Start new component
                    currentComponent = headerCell.value.split(' Total')[0];
                    currentSubComponents = [];
                } else if (subHeaderCell.value) {
                    // This is a sub-component
                    currentSubComponents.push({
                        name: subHeaderCell.value.split(' (')[0],
                        marks: cell.value
                    });
                }
            }

            // Add the last component
            if (currentComponent) {
                studentData.marks[currentComponent] = {
                    subComponents: currentSubComponents,
                    total: row.getCell(columns).value
                };
            }

            parsedData.students.push(studentData);
        }

        return parsedData;
    } catch (error) {
        console.error('Error parsing Excel sheet:', error);
        throw new Error(`Failed to parse Excel sheet: ${error.message}`);
    }
}
