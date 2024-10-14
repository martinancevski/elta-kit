import _ from "lodash"
var html_tablify = require('html-tablify');
export class KitResultsBcr{

    standardRows:any[] = []
    userRows:any[] = []
    isCalculationRows:any[] = []

    userMap:any = {}
    isCalculationMap:any = {}
    standardMap:any = {}

    ncn1 = 0.218
    ncn2 = 0.05
    ncn3 = 0.5

    isCalculation = -1

    constructor(xlsJson:any) {
        let rows:any[] = []

        for (let key in xlsJson){
            rows = xlsJson[key]
        }
        if (rows && rows.length > 0){
            rows.shift()
        }


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
            let concentrationMean = row.H
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
            let concentrationMean = row.H

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
            let concentrationMean = row.H
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
    getISConstantsTable():string{
        let tableRows:any[] = [
            {
                "CAL NCN % Assigned": this.ncn1,
                "CAL NCN Lower cutoff": this.ncn2,
                "CAL NCN Upper cutoff": this.ncn3,
            }
        ]

        let options = {
            data:tableRows,
            header:["CAL NCN % Assigned","CAL NCN Lower cutoff","CAL NCN Upper cutoff"],
            css: 'table {text-align: center;}',
            border: 1,
            cellspacing: 2,
            cellpadding: 6
        }
        let htmlData = html_tablify.tablify(options)
        return htmlData
    }
    makeISTable():string{
        let bcr = this.isCalculationMap.bcrConcentraionMean
        let abl = this.isCalculationMap.ablConcentraionMean


        let percentage = "invalid"
        let validation = "invalid"
        let factor = "invalid"
        if (_.isNumber(bcr) && _.isNumber(abl)){

            let percentageNumber = _.round(bcr/abl*100,4)
            this.isCalculation = percentageNumber
            percentage = percentageNumber+"%"
            if (percentageNumber >= this.ncn2 && percentageNumber <= this.ncn3){
                validation = "valid"
                let factorValue = this.ncn1/percentageNumber

                factorValue = _.round(factorValue,4)
                factor = ""+factorValue
            }
        }
        let tableRows:any[] = [
            {
                "CAL: BCR-ABL1 copies": bcr,
                "CAL: ABL1 copies": abl,
                "CAL NCN % Obtained": percentage,
                "Validation status": validation,
                "IS factor": factor,

            }
        ]

        let options = {
            data:tableRows,
            header:["CAL: BCR-ABL1 copies","CAL: ABL1 copies","CAL NCN % Obtained","Validation status","IS factor"],
            css: 'table {text-align: center;}',
            border: 1,
            cellspacing: 2,
            cellpadding: 6
        }
        let htmlData = html_tablify.tablify(options)
        return htmlData
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
                "Major BCR-ABL1 (NCN %)": this.calculateUserScore(data.ablConcentraionMean,data.bcrConcentraionMean),
                "Major BCR-ABL1 (IS NCN %)":this.calculateUserScore2(data.ablConcentraionMean,data.bcrConcentraionMean)
            }
            tableRows.push(row)
        }

        let options = {
            data:tableRows,
            header:["Sample ID","ABL1 Ct Value","ABL1 (CN ≥10,000 copies)","Major BCR-ABL1 Ct Value","Major BCR-ABL1 (CN)","Major BCR-ABL1 (NCN %)","Major BCR-ABL1 (IS NCN %)"],
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
        return "negative"
    }

    private calculateUserScore2(ablValue:number | undefined, bcrValue:number | undefined){
        if (ablValue && bcrValue && this.isCalculation>0){
            if (ablValue >= 10000){
                let calculation = bcrValue/ablValue * 100
                calculation = calculation*this.ncn1/this.isCalculation
                return ""+_.round(calculation,3)+"%"
            }
        }
        return "negative"
    }
}