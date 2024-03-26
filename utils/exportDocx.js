//import { Message } from "element-ui";
import docxtemplater from "docxtemplater";
import expressionParser from "docxtemplater/expressions.js";
import PizZip from "pizzip";
import JSZipUtils from "jszip-utils";
import { saveAs } from "file-saver";


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

export const exportDocx = async (tempDocxPath, data, fileName = "") => {
  //let out = false;

  let content = await getBinaryContent(tempDocxPath);

  const zip = new PizZip(content);
  const doc = new docxtemplater(zip, { parser: expressionParser }); //docxtemplater().loadZip(zip);

  doc.setData(data);

  try {
    doc.render();
  } catch (error) {
    throw error;
  }

  let out = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })

  if (fileName) {
    saveAs(out, fileName);
  }

  return out;

/*
  let out = await JSZipUtils.getBinaryContent(tempDocxPath, (error, content) => {
    if (error) {
      throw error;
    }

    const zip = new PizZip(content);
    const doc = new docxtemplater().loadZip(zip);

    doc.setData(data);

    try {
      doc.render();
    } catch (error) {
      throw error;
    }

    out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })

    if (fileName) {
      saveAs(out, fileName);
    }

  });
*/
  
}