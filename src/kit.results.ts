
import _ from "lodash"
export class KitResults{
    kitSpecification:any
    resultData:any[]

    constructor(kitSpecification: any, resultData: any[]) {
        this.kitSpecification = kitSpecification
        this.resultData = resultData
        this.resultData.shift() //removes the title row
    }

    getXlsResult(){
        // {
        //     A: 'Well',
        //         B: 'Sample ID',
        //     C: 'Sample',
        //     D: 'Sample Type',
        //     E: 'Dye',
        //     F: 'Gene',
        //     G: 'Tm1(°C)',
        //     H: 'Peak Value 1',
        //     I: 'Tm2(°C)',
        //     J: 'Peak Value 2',
        //     K: 'Tm3(°C)',
        //     L: 'Peak Value 3'
        // },

        let result:any = {}
        let resultKeys:string[] = ["id","IC"]
        for (let key in this.kitSpecification){
            let temp:any = this.kitSpecification[key]
            for (let subkey in temp){
                if (subkey !== "IC"){
                    resultKeys.push(subkey)
                }

            }

        }
        for (let row of this.resultData){
            let sampleId = row.C
            if (sampleId === "PC1" || sampleId === "PC2"){
                row.C = "PC1/2"
            }
        }
        for (let row of this.resultData){
            let sampleId = row.C

            let dye = row.E
            let gene = row.F
            let key = `${dye} ${gene}`
            let sampleResult:any = {}
            if (result[sampleId]){
                sampleResult = result[sampleId]
            }else{
                result[sampleId] = sampleResult
            }
            sampleResult.id = sampleId
            sampleResult.IC = ""
            for (let key in this.kitSpecification){
                let temp:any = this.kitSpecification[key]
                for (let subkey in temp){
                    sampleResult[subkey] = ""

                }

            }
        }

        for (let row of this.resultData){
            let sampleId = row.C
            let dye = row.E
            let gene = row.F
            let key = `${dye} ${gene}`
            let temperatures = [parseFloat(""+row.G),parseFloat(""+row.I),parseFloat(""+row.K),parseFloat(""+row.M)]

            let sampleResult = result[sampleId]
            let specifications = this.kitSpecification[key]
            for (let specKey in specifications){
                let specData = specifications[specKey]
                let tempMin = specData.value - specData.delta
                let tempMax = specData.value + specData.delta
                let tempFound = false
                for (let temp of temperatures){

                    if (temp >= tempMin && temp <= tempMax){
                        tempFound = true
                    }
                }
                if (tempFound){

                    if (specKey === "IC"){
                        sampleResult.IC += "+"
                    }else{
                        sampleResult[specKey] += "+"
                    }


                }else{

                    if (specKey === "IC"){
                        sampleResult.IC += "-"
                    }else{
                        sampleResult[specKey] += "-"
                    }


                }
            }

        }
        let table:any[] = []
        for (let key in result){

            let value = result[key]
            let temp:any = {}

            for (let orderedKey of resultKeys){
                temp[orderedKey] = value[orderedKey]
            }
            table.push(temp)
        }

        // Utils.writeExcelFile("Test file 2 result",table)
        return {
            data:result,
            xlsTable:table,
            header:resultKeys
        }
    }

    getResultTemplateJson(){
        let result:any = {}
        for (let row of this.resultData){
            // let sampleId = row.C
            let dye = row.E
            let gene = row.F
            let key = `${dye} ${gene}`
            let temp:any = {}
            if (result[key]){
                temp = result[key]
            }else{
                result[key] = temp
            }
            let parts = gene.split("-")
            for (let part of parts){
                temp[part] = {
                    value:100,
                    delta:1.5
                }
            }
        }
        return result
    }
    static convertJsonToMatrix(json:any[]){
        let result:string[][] = []
        let columns:string[] = []
        for (let jsonRow of json){
            for (let column in jsonRow){
                columns.push(column)
            }
        }
        columns = _.uniq(columns)
        result.push(columns)
        for (let jsonRow of json){
            let tempRow:string[] = []
            for (let column of columns){
                let value =  jsonRow[column]
                // if (!value){
                //     value = ""
                // }
                if (!_.isString(value)){
                    value = JSON.stringify(value)
                }
                tempRow.push(value)
            }
            result.push(tempRow)
        }

        return result
    }
}