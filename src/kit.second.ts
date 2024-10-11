import {KitResultsBcr} from "./kit.results.bcr";

const excelToJson = require('convert-excel-to-json');

export class KitSecond{
    getSecondKitResponse(files:any,req:any, res:any){
        let file = files["testResult"]![0]
        let resultJson = excelToJson({
            sourceFile:file.filepath
        })


        let kitResults = new KitResultsBcr(resultJson)
        let htmlData = `
<body style="font-family: 'Helvetica'">
<script type="text/javascript">
    function printDiv(divName) {
        var printContents = document.getElementById(divName).innerHTML;
        w=window.open();
        w.document.write(printContents);
        w.print();
        w.close();
    }
</script>
 <div style="
            float:right;
            margin: 16px;
            ">
      <input type="button" onclick="printDiv('print-content')" value="Print result" style="
            background: lightgreen;
            border: 1px solid #ced4da;
            border-radius: .25rem;
            color: black;
            font-weight: 400;
            text-align: center;
            padding: .375rem .75rem;
            font-size: 1rem;
            line-height: 1.5;
            
            "/>
            </div>
      <div id="print-content">
      <div><span><h2>TRUReport - BCR-ABL1 QT</h2> 
      </span>
     
            </div>
          <h4>Standards</h4>
         <div>  ${kitResults.makeStandardTable()}</div>
         <h4>Calculation for IS factor</h4>
         <div> ${kitResults.getISConstantsTable()} </div>
         <br>
         <div> ${kitResults.makeISTable()} </div>
         <h4>Calculation for IS ratio %</h4>
         <div>  ${kitResults.makeUserTable()}</div>
       <p>${file.originalFilename}</p>
       
       </div>
       </body>
        `
        htmlData = htmlData.replaceAll("<td>✓</td>","<td style=\"background:lightgreen\n" +
            "\">✓</td>")
        htmlData = htmlData.replaceAll("<td>valid</td>","<td style=\"background:lightgreen\n" +
            "\">valid</td>")
        htmlData = htmlData.replaceAll("<td>x</td>","<td style=\"background:lightcoral\n" +
            "\">x</td>")
        htmlData = htmlData.replaceAll("<td>invalid</td>","<td style=\"background:lightcoral\n" +
            "\">invalid</td>")
        htmlData = htmlData.replaceAll("<td>negative</td>","<td style=\"background:lightcoral\n" +
            "\">negative</td>")
        res.send(htmlData)
        // res.send(resultJson)
    }
}