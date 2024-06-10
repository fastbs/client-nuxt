import docxtemplater from "docxtemplater";
import expressionParser from "docxtemplater/expressions.js";
import PizZip from "pizzip";
import JSZipUtils from "jszip-utils";
import { saveAs } from "file-saver";
import axios from "axios";

export const exportReport = async (format, tempDocxPath, data, fileName = "No name") => {
  switch (format) {
    case "docx":
      saveAs(await exportDocx(tempDocxPath, data), fileName + ".docx");
      return true;
    case "pdf":
      const docx = await exportDocx(tempDocxPath, data);
      const formData = new FormData();
      formData.append("file", docx, "report.docx");
      const gotenbergProxy = () => { return axios.create({ baseURL: "http://localhost:4400" }); }
      const pdf = await gotenbergProxy().post('posts/report', formData, { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'arraybuffer' });
      console.log("pdf:", pdf);
      saveAs(new Blob([pdf.data]), fileName + ".pdf");
      return true;
    default:
      return false;
  }

}

/* export const exportReport2 = async (name, format, data, fileName = "No name") => {
  const formData = new FormData();
  formData.append("name", naem);
  const gotenbergProxy = () => { return axios.create({ baseURL: "http://localhost:4400" }); }
  const pdf = await gotenbergProxy().post('posts/report', formData, { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'arraybuffer' });
  console.log("pdf:", pdf);
  saveAs(new Blob([pdf.data]), fileName + ".pdf");
  return true;
} */

function getBinaryContent(tempDocxPath) {
  return new Promise(function (resolve, reject) {
    JSZipUtils.getBinaryContent(tempDocxPath, (error, content) => {
      if (error) {
        reject(Error(error));
      }
      resolve(content);
    });
  })
}

export const exportDocx = async (tempDocxPath, data) => {
  const content = await getBinaryContent(tempDocxPath);
  const zip = new PizZip(content);
  const docx = new docxtemplater(zip, { parser: expressionParser });
  docx.setData(data);
  docx.render();
  const out = docx.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })

  return out;
}