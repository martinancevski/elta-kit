import _ from "lodash"
var html_tablify = require('html-tablify');
export class KitResultsBcr{

    standardRows:any[] = []
    userRows:any[] = []
    isCalculationRows:any[] = []

    userMap:any = {}
    isCalculationMap:any = {}
    standardMap:any = {}

    constructor(xlsJson:any) {
        console.log("Json")
        console.log(xlsJson)
        for (let key in xlsJson){
            console.log(key)
        }
        let rows = xlsJson.Statistics
        console.log(rows)
        rows.shift()

        let stdRowIDs = ["STD1BCR","STD2BCR","STD3BCR","STD4BCR","STD5BCR","STD6BCR","STD1ABL1","STD2ABL1","STD3ABL1","STD4ABL1"]
        for (let row of rows){
            let originalSampleId = row.C
            let sampleId = row.C
            sampleId = sampleId.toUpperCase()
            sampleId = sampleId.replaceAll("-","")
            sampleId = sampleId.replaceAll(" ","")
            if (stdRowIDs.includes(sampleId)){
                row.C = sampleId
                this.standardRows.push(row)
            }else{
                if (sampleId === "ISCAL"){
                    row.C = sampleId
                    this.isCalculationRows.push(row)
                }else{
                    this.userRows.push(row)
                }
            }
        }
        this.makeUserDataRows()
        this.makeIsCalculationData()
        this.makeStandardData()
    }

    makeUserDataRows(){
        let result:any = {}
        for (let row of this.userRows){
            let sampleId = row.C
            let gene = row.F
            let ctMean = row.G
            let concentrationMean = row.J
            let tempResult:any = result[sampleId]
            if (!tempResult){
                tempResult = {}
            }
            if (gene === "BCR-ABL1-Maj"){
                if (_.isNumber(ctMean)){
                    tempResult.bcrCtMean = ctMean
                }
                if (_.isNumber(concentrationMean)){
                    tempResult.bcrConcentraionMean = concentrationMean
                }

            }
            if (gene === "ABL-1"){
                if (_.isNumber(ctMean)){
                    tempResult.ablCtMean = ctMean
                }
                if (_.isNumber(concentrationMean)){
                    tempResult.ablConcentraionMean = concentrationMean
                }
            }
            result[sampleId] = tempResult
        }
        this.userMap = result
    }
    makeIsCalculationData(){
        let result:any = {}
        for (let row of this.isCalculationRows){

            let gene = row.F
            let ctMean = row.G
            let concentrationMean = row.J

            if (gene === "BCR-ABL1-Maj"){
                if (_.isNumber(ctMean)){
                    result.bcrCtMean = ctMean
                }
                if (_.isNumber(concentrationMean)){
                    result.bcrConcentraionMean = concentrationMean
                }

            }
            if (gene === "ABL-1"){
                if (_.isNumber(ctMean)){
                    result.ablCtMean = ctMean
                }
                if (_.isNumber(concentrationMean)){
                    result.ablConcentraionMean = concentrationMean
                }
            }

        }
        this.isCalculationMap = result
    }
    makeStandardData(){
        let result:any = {}
        for (let row of this.standardRows){
            let sampleId = row.C
            let gene = row.F
            let ctMean = row.G
            let concentrationMean = row.J
            let tempResult:any = {}
            if (_.isNumber(ctMean)){
                tempResult.ctMean = ctMean
            }
            if (_.isNumber(concentrationMean)){
                tempResult.bcrConcentraionMean = concentrationMean
            }
            tempResult.gene = gene
            result[sampleId] = tempResult
        }
        this.standardMap = result
    }

    makeStandardTable():string{
        let tableRows:any[] = [
            {
                "Standard ID": "Std 1 (1.00 x 106/5µl)",
                "Obtained Ct (ABL1)": this.formatValue(this.standardMap["STD1ABL1"].ctMean),
                "Expected CT (ABL1)": "19±2",
                "Correct (ABL1)": this.calculateRange(this.standardMap["STD1ABL1"].ctMean,19),
                "Obtained Ct (BCR)": this.formatValue(this.standardMap["STD1BCR"].ctMean),
                "Expected CT (BCR)": "19±2",
                "Correct (BCR)": this.calculateRange(this.standardMap["STD1BCR"].ctMean,19),
            },
            {
                "Standard ID": "Std 2  (1.00 x 105/5µl)",
                "Obtained Ct (ABL1)": this.formatValue(this.standardMap["STD2ABL1"].ctMean),
                "Expected CT (ABL1)": "22±2",
                "Correct (ABL1)": this.calculateRange(this.standardMap["STD2ABL1"].ctMean,22),
                "Obtained Ct (BCR)": this.formatValue(this.standardMap["STD2BCR"].ctMean),
                "Expected CT (BCR)": "22±2",
                "Correct (BCR)": this.calculateRange(this.standardMap["STD2BCR"].ctMean,22),
            },
            {
                "Standard ID": "Std 3 (1.00 x 104/5µl)",
                "Obtained Ct (ABL1)": this.formatValue(this.standardMap["STD3ABL1"].ctMean),
                "Expected CT (ABL1)": "25±2",
                "Correct (ABL1)": this.calculateRange(this.standardMap["STD3ABL1"].ctMean, 25),
                "Obtained Ct (BCR)": this.formatValue(this.standardMap["STD3BCR"].ctMean),
                "Expected CT (BCR)": "25±2",
                "Correct (BCR)": this.calculateRange(this.standardMap["STD3BCR"].ctMean, 25),
            },
            {
                "Standard ID": "Std 4 (1.00 x 103/5µl)",
                "Obtained Ct (ABL1)": this.formatValue(this.standardMap["STD4ABL1"].ctMean),
                "Expected CT (ABL1)": "28±2",
                "Correct (ABL1)": this.calculateRange(this.standardMap["STD4ABL1"].ctMean,28),
                "Obtained Ct (BCR)": this.formatValue(this.standardMap["STD4BCR"].ctMean),
                "Expected CT (BCR)": "28±2",
                "Correct (BCR)": this.calculateRange(this.standardMap["STD4BCR"].ctMean,28),
            },
            {
                "Standard ID": "Std 5 (1.00 x 102/5µl)",
                "Obtained Ct (ABL1)": "",
                "Expected CT (ABL1)": "",
                "Correct (ABL1)": "",
                "Obtained Ct (BCR)": this.formatValue(this.standardMap["STD5BCR"].ctMean),
                "Expected CT (BCR)": "31±2",
                "Correct (BCR)": this.calculateRange(this.standardMap["STD5BCR"].ctMean,31),
            },{
                "Standard ID": "Std 6 (1.00 x 101/5µl)",
                "Obtained Ct (ABL1)": "",
                "Expected CT (ABL1)": "",
                "Correct (ABL1)": "",
                "Obtained Ct (BCR)": this.formatValue(this.standardMap["STD6BCR"].ctMean),
                "Expected CT (BCR)": "34±2",
                "Correct (BCR)": this.calculateRange(this.standardMap["STD6BCR"].ctMean,34),
            }
        ]


        let options = {
            data:tableRows,
            header:["Standard ID","Obtained Ct (ABL1)","Expected CT (ABL1)","Correct (ABL1)","Obtained Ct (BCR)","Expected CT (BCR)","Correct (BCR)"],
            css: 'table {text-align: center;}',
            border: 1,
            cellspacing: 2,
            cellpadding: 6
        }
        let htmlData = html_tablify.tablify(options)
        return htmlData
    }
    makeUserTable():string{
        let tableRows:any[] = []
        for (let sampleId in this.userMap){
            let data = this.userMap[sampleId]
            let row = {
                "Sample ID": sampleId,
                "ABL1 Ct Value": this.formatValue(data.ablCtMean),
                "ABL1 (CN ≥10,000 copies)": this.formatValue(data.ablConcentraionMean),
                "Major BCR-ABL1 Ct Value": this.formatValue(data.bcrCtMean),
                "Major BCR-ABL1 (CN)": this.formatValue(data.bcrConcentraionMean),
                "Major BCR-ABL1": this.calculateUserScore(data.ablConcentraionMean,data.bcrConcentraionMean)
            }
            tableRows.push(row)
        }

        let options = {
            data:tableRows,
            header:["Sample ID","ABL1 Ct Value","ABL1 (CN ≥10,000 copies)","Major BCR-ABL1 Ct Value","Major BCR-ABL1 (CN)","Major BCR-ABL1"],
            css: 'table {text-align: center;}',
            border: 1,
            cellspacing: 2,
            cellpadding: 6
        }
        let htmlData = html_tablify.tablify(options)
        return htmlData
    }
    private formatValue(data:number | undefined):string{
        if (data){
            return ""+data
        }else{
            return " "
        }
    }

    private calculateRange(data:number | undefined, expected:number){
        if (data){
            if (data >= expected-2 && data <= expected+2){
                return "✓"
            }
        }
        return "x"
    }

    private calculateUserScore(ablValue:number | undefined, bcrValue:number | undefined){
        if (ablValue && bcrValue){
            if (ablValue >= 10000){
                let calculation = bcrValue/ablValue * 100
                return ""+_.round(calculation,3)+"%"
            }
        }
        return "x"
    }
}