// composables/useFileUpload.js
import { ref } from "vue";
import * as ExcelJS from "exceljs";

export function useFileUpload() {
  const fileInput = ref(null);
  const fileName = ref(null);
  const fileData = ref(null);
  const errorMessage = ref(null);
  const isFileNotReady = ref(true);
  const isProses = ref(false);
  const fileType = ref("EXCEL");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      fileInput.value = file;
      fileName.value = file.name;
      isFileNotReady.value = false;
    } else {
      fileInput.value = null;
      fileName.value = null;
      isFileNotReady.value = true;
    }
  };

  const readExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const workbook = new ExcelJS.Workbook();
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          await workbook.xlsx.load(buffer);

          const worksheet = workbook.getWorksheet(1);
          const jsonData = [];
          const headers = [];

          if (!worksheet) {
            throw new Error("No worksheet found in Excel file");
          }

          // Get headers from first row
          const headerRow = worksheet.getRow(1);
          headerRow.eachCell((cell, colNumber) => {
            headers.push(cell.value?.toString() || `Column ${colNumber}`);
          });

          // Get data from rows (starting from row 2)
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
              const rowData = {};
              row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                rowData[header] = cell.value;
              });
              jsonData.push(rowData);
            }
          });

          resolve({
            headers,
            data: jsonData,
            type: "excel",
          });
        } catch (error) {
          reject(new Error(`Error reading Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const readJsonFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          if (Array.isArray(jsonData) && jsonData.length > 0) {
            const headers = Object.keys(jsonData[0]);
            resolve({
              headers,
              data: jsonData,
              type: "json",
            });
          } else {
            resolve({
              headers: [],
              data: jsonData,
              type: "json",
            });
          }
        } catch (error) {
          reject(new Error("Invalid JSON file format"));
        }
      };

      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const processFile = async () => {
    isProses.value = true;
    errorMessage.value = null;
    fileData.value = null;

    try {
      if (!fileInput.value) {
        throw new Error(`Please select a ${fileType.value} file first`);
      }

      let data;
      if (fileType.value === "EXCEL") {
        data = await readExcelFile(fileInput.value);
      } else if (fileType.value === "JSON") {
        data = await readJsonFile(fileInput.value);
      } else {
        throw new Error("Unsupported file type");
      }

      fileData.value = data;
    } catch (error) {
      console.error("Error processing file:", error);
      errorMessage.value = error.message || "Failed to process file";
    } finally {
      isProses.value = false;
    }
  };

  const resetFileData = () => {
    fileInput.value = null;
    fileName.value = null;
    fileData.value = null;
    errorMessage.value = null;
    isFileNotReady.value = true;
    isProses.value = false;
  };

  return {
    // State
    fileInput,
    fileName,
    fileData,
    errorMessage,
    isFileNotReady,
    isProses,
    fileType,

    // Methods
    handleFileChange,
    processFile,
    resetFileData,
  };
}
