import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import formidable from "formidable"
import fs from "fs"
import {KitResults} from "./kit.results";
import {KIT_HPV, KIT_STD} from "./kit.data";
import XLSX from "xlsx"
var html_tablify = require('html-tablify');
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const excelToJson = require('convert-excel-to-json');

// function run(){
//   let resultDataXls = "input/elta/data2.xlsx"
//   let resultJson = excelToJson({
//     sourceFile:resultDataXls
//   })
//   console.log(resultJson)
//   let kitResult = new KitResults(KIT_STD,resultJson.Result)
//   let template = kitResult.getResultTemplateJson()
//   console.log(template)
//   Utils.writeFile("STD template",template)
//   let xlsResult = kitResult.getXlsResult()
//   console.log(xlsResult)
// }

app.get("/", (req: Request, res: Response) => {
  res.send(`
    <h2>Genematrix analyzer</h2>
    <form action="/app"  method="post">
        <div>
            Username: 
            <input type="text" name="user" id="user"/>
        </div>
        <div>
            Password: 
            <input type="text" name="pass" id="pass"/>
        </div>
      
      <input type="submit" value="Login" />
    </form>
  `);
});

app.post("/app", (req: Request, res: Response) => {

  let user = req.body.user
  let pass = req.body.pass
  let correct = user === "Ginekologija lab" && pass === "Ginekologija1"
  if (correct){
    res.send(`
    <h2>Genematrix analyzer</h2>
    <form action="/api/upload" enctype="multipart/form-data" method="post">
        <div>
        <select name="kitType" id="kitType">     
            <option value="HPV">Neoplex™ HPV29 Detection Kit</option>
            <option value="STD">NeoPlex™ STI-14 Detection Kit</option>
            
        </select>
      
        </div>
      <div>File: <input type="file" name="testResult" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
  }else{
    res.send(`
      <h2>Invalid username or password</h2>
    `)
  }

});

app.post('/api/upload', (req, res, next) => {
  const form = formidable({});

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    console.log(fields)
    let value = fields["kitType"]!
    console.log("Value "+value[0])
    let kits:any = {
      "HPV":KIT_HPV,
      "STD":KIT_STD
    }
    let file = files["testResult"]![0]
    let resultJson = excelToJson({
    sourceFile:file.filepath
    })
    let kitResult = new KitResults(kits[value[0]],resultJson.Result)
    let result = kitResult.getXlsResult()
    let options = {
      data:result.xlsTable,
      header:result.header,
      border: 1,
      cellspacing: 3,
      cellpadding: 8
    }
    let htmlData = html_tablify.tablify(options)
    htmlData = htmlData.replaceAll("<td>+</td>","<td style=\"color:red\n" +
        "\">+</td>")
    // let workbook = XLSX.utils.book_new()
    // let tempWorkbook = KitResults.convertJsonToMatrix(result.xlsTable)!
    // let ws = XLSX.utils.aoa_to_sheet(tempWorkbook)
    // XLSX.utils.book_append_sheet(workbook,ws)
    // let data = XLSX.write(workbook,{})
    // console.log(data)
    // res.writeHead(200, {
    //   'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\n",
    //   'Content-disposition': 'attachment;filename=' + "result.xlsx",
    //   'Content-Length': data.length
    // });
    // res.end(Buffer.from(data, 'binary'));
    // res.json(result);
    res.send(htmlData)
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});