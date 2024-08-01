
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
        resultKeys.push("comment")
        for (let row of this.resultData){
            row.C = row.C.replaceAll("-","")
            row.C = row.C.replaceAll(" ","")
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
            if (sampleId === "PC" || sampleId === "PC1/2"){
                sampleResult.comment = "Positive control"
            }else{
                sampleResult.comment = ""
            }

        }

        for (let row of this.resultData){
            let sampleId = row.C
            let dye = row.E
            let gene = row.F
            let key = `${dye} ${gene}`
            let temperatures = [parseFloat(""+row.G),parseFloat(""+row.I),parseFloat(""+row.K),parseFloat(""+row.M)]
            let peaks = [parseFloat(""+row.H),parseFloat(""+row.J),parseFloat(""+row.L),parseFloat(""+row.N)]
            // console.log(temperatures)
            let sampleResult = result[sampleId]
            let specifications = this.kitSpecification[key]
            for (let specKey in specifications){
                let specData = specifications[specKey]
                let tempMin = specData.value - specData.delta
                let tempMax = specData.value + specData.delta
                let tempFound = false
                let tempCount = 0
                let peakMin = this.getPeakTemp(key)

                for (let temp of temperatures){
                    let peak = peaks[tempCount]
                    if (temp >= tempMin && temp <= tempMax && peak >= peakMin){
                        tempFound = true
                    }
                    tempCount++
                }
                if (tempFound){

                    if (specKey === "IC"){
                        sampleResult.IC += "✓"
                    }else{
                        sampleResult[specKey] += "+"
                        if (sampleId === "PC" || sampleId === "PC1/2"){
                            // sampleResult.comment = "Positive control"
                        }else{
                            sampleResult.comment += specKey+" "
                        }
                    }


                }else{

                    if (specKey === "IC"){
                        if (sampleResult["61"]==="+"&& sampleResult["70"]==="+"&& sampleResult["73"]==="+"&& sampleResult.IC.length === 1 ){
                            sampleResult.IC += "✓"
                        }else{
                            sampleResult.IC += "x"
                        }

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

    getPeakTemp(color:string):number {

        if (color.startsWith("FAM")){
            return 40
        }
        if (color.startsWith("HEX")){
            return 50
        }
        if (color.startsWith("Texas")){
            return 65
        }
        if (color.startsWith("Cy5")){
            return 60
        }
        if (color.startsWith("Alexa")){
            return 65
        }
        return 0
    }
}