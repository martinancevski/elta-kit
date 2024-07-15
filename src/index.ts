import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import formidable from "formidable"
import fs from "fs"
import {KitResults} from "./kit.results";
import {KIT_HPV, KIT_STD} from "./kit.data";
import XLSX from "xlsx"
import moment from "moment";
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
    <div style="display: flex;
   height: 100vh;
   align-content: center;
   justify-content: center;
   flex-direction: column;
   text-align: center;
   font-size: 14pt;">
   <div style="">
      <h2 >Genematrix analyzer</h2>
   </div>
   <form action="/app"  method="post">
      <div style="padding: 10px">
         <input type="text" name="user" id="user"  style="
            height: calc(1.5em + .75rem + 2px);
            padding: .375rem .75rem;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            width: 50%;
            border: 1px solid #ced4da;
            border-radius: .25rem;
            " placeholder="Username"/>
      </div>
      <div style="padding: 10px">
         <input type="password" name="pass" id="pass" style="height: calc(1.5em + .75rem + 2px);
            padding: .375rem .75rem;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            width: 50%;
            border: 1px solid #ced4da;
            border-radius: .25rem;" placeholder="Password" />
      </div>
      <div style="">
         <input type="submit" value="Sign in" style="
            width: 200px;
            background: rgb(47, 22, 209);
            border: 1px solid #ced4da;
            border-radius: .25rem;
            line-height: 2.5;
            font-size: 14px;
            color: white;margin: 20px 0px;
            font-weight: 400;
            text-align: center;
            padding: .375rem .75rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: .25rem;
            "/>
      </div>
   </form>
</div>
  `);
});

app.post("/app", (req: Request, res: Response) => {

  let user = req.body.user
  let pass = req.body.pass
  let correct = user === "Ginekologija lab" && pass === "Ginekologija1"
  if (correct){
    res.send(`
    <div style="display: flex;
   height: 100vh;
   align-content: center;
   justify-content: center;
   flex-direction: column;
   text-align: center;
   font-size: 14pt;">
<div style="">
   <h2 >
      Genematrix analyzer
   </h2></div>
   <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div style="padding: 10px">
         <select name="kitType" id="kitType" style="width: 350px;
            height: 40px;
            background: rgb(47, 22, 209);
            border: 1px solid #ced4da;
            border-radius: .25rem;
            line-height: 2.5;
            font-size: 14px;
            color: white;margin: 20px 0px;
            font-weight: 400;
            text-align: center;
            padding: .375rem .75rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: .25rem;">
            <option value="HPV">Neoplex™ HPV29 Detection Kit</option>
            <option value="STD">NeoPlex™ STI-14 Detection Kit</option>
         </select>
      </div>
      <div style="padding: 10px">
         File upload: <input type="file" name="testResult" multiple="multiple" />
      </div>
      <div style="padding: 10px">
         <input type="submit" value="Upload" style="width: 200px;
            background: rgb(47, 22, 209);
            border: 1px solid #ced4da;
            border-radius: .25rem;
            line-height: 2.5;
            font-size: 14px;
            color: white;margin: 20px 0px;
            font-weight: 400;
            text-align: center;
            padding: .375rem .75rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: .25rem;"/>
      </div>
   </form>
</div>
  `);
  }else{
    res.send(`
      <h3 style="color:red">Invalid username or password!</h3>
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

    let kitTitles:any = {
      "HPV":"NeoPlex™ HPV29 Detection",
      "STD":"NeoPlex™ STI-14 Detection"
    }
    let kitHeaders:any = {
      "HPV":`
       cellpadding="6">
<tr>
<th colspan="2">Analysis date</th>
<th colspan="14">T1</th>
<th colspan="15">T2</th>
<th colspan="1"></th>
</tr>
<tr>
<th colspan="2">${moment()
          .format("DD/MM/YYYY HH:mm:ss")}</th>
<th colspan="3">FAM</th>
<th colspan="3">HEX</th>
<th colspan="3">Texas Red</th>
<th colspan="3">Cy5</th>
<th colspan="2">Alexa Fluor 680</th>
<th colspan="3">FAM</th>
<th colspan="3">HEX</th>
<th colspan="3">Texas Red</th>
<th colspan="3">Cy5</th>
<th colspan="3">Alexa Fluor 680</th>
<th colspan="1"></th>
</tr>`,
      "STD":`
       cellpadding="6">
<tr>
<th colspan="2">Analysis date</th>
<th colspan="14">T1</th>
<th colspan="1"></th>
</tr>
<tr>
<th colspan="2">${moment()
          .format("DD/MM/YYYY HH:mm:ss")}</th>
<th colspan="3">FAM</th>
<th colspan="3">HEX</th>
<th colspan="3">Texas Red</th>
<th colspan="3">Cy5</th>
<th colspan="2">Alexa Fluor 680</th>
<th colspan="1"></th>
</tr>
      `
    }
    let kitHeader = kitHeaders[value[0]]
    let kitTitle = kitTitles[value[0]]
    let file = files["testResult"]![0]
    let resultJson = excelToJson({
    sourceFile:file.filepath
    })
    let kitResult = new KitResults(kits[value[0]],resultJson.Result)
    let result = kitResult.getXlsResult()
    let options = {
      data:result.xlsTable,
      header:result.header,
      css: 'table {text-align: center;}',
      border: 1,
      cellspacing: 2,
      cellpadding: 6
    }
    let htmlData = html_tablify.tablify(options)

    htmlData = htmlData.replaceAll("<td>+</td>","<td style=\"background:lightcoral\n" +
        "\">+</td>")
    htmlData = htmlData.replaceAll("<td>✓✓</td>","<td style=\"background:lightgreen\n" +
        "\">✓✓</td>")
    htmlData = htmlData.replaceAll("<td>✓</td>","<td style=\"background:lightgreen\n" +
        "\">✓</td>")
    htmlData = htmlData.replaceAll("<td>✓x</td>","<td style=\"background:lightsalmon\n" +
        "\">✓x</td>")
    htmlData = htmlData.replaceAll("<td>x✓</td>","<td style=\"background:lightsalmon\n" +
        "\">x✓</td>")
    htmlData = htmlData.replaceAll("<td>xx</td>","<td style=\"background:lightcoral\n" +
        "\">xx</td>")
    htmlData = htmlData.replaceAll("<td>x</td>","<td style=\"background:lightcoral\n" +
        "\">x</td>")
    htmlData = htmlData.replaceAll(" cellpadding=\"6\">",kitHeader)
    htmlData = `
      <h2>${kitTitle}</h2>
           ${htmlData}
       <p>${file.originalFilename}</p>
       
       
       <table id="tablify" class="tablify" border="1" cellspacing="3" cellpadding="6">
       <tr>
  <td style="text-align: center" colspan="2">Legend</td>
  
</tr>
<tr>
  <td style="background:lightcoral">+</td>
  <td>Detection</td>
</tr>
<tr>
  <td></td>
  <td>Not detected</td>
</tr>
    <tr>
      <td style="background:lightgreen">✓✓</td>
      <td>Positive IC</td>
    </tr>
  <tr>
    <td style="background:lightsalmon
    ">✓x</td>
    <td>Partial IC T1</td>
  </tr>
  <tr>
    <td style="background:lightsalmon
    ">x✓</td>
    <td>Partial IC T2</td>
  </tr>
  <tr>
    <td style="background:lightcoral
    ">xx</td>
    <td>Negative IC</td>
  </tr>
</table
    `
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