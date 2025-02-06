import { toast } from '@medusajs/ui'
import { appDataDir } from '@tauri-apps/api/path'
import { mkdir, readDir, writeFile } from '@tauri-apps/plugin-fs'
import * as xlsx from 'xlsx'

export const parseData = (arrayBuffer: ArrayBuffer) => {
    const workbook = xlsx.read(arrayBuffer)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)

    function transformData(data: any[]): any[] {
        const result: Record<string, any> = {}

        data.forEach(event => {
            if (!result[event.事件编号]) {
                result[event.事件编号] = {
                    earthquake: {
                        id: event.事件编号,
                        time: event.发震时间,
                        hypocenter: {
                            name: event.发震地点,
                            location: {
                                latitude: parseFloat(event.震中纬度),
                                longitude: parseFloat(event.震中经度),
                                depth: parseFloat(event.震源深度),
                            },
                        },
                        magnitude: parseFloat(event.震级),
                    },
                    stations: []
                }
            }
            result[event.事件编号].stations.push({
                station: {
                    code: event.台网代码,
                    id: event.台站编码,
                    name: event.台站名称,
                    location: {
                        latitude: parseFloat(event.台站纬度),
                        longitude: parseFloat(event.台站经度),
                        distance: event.震中距,
                        tag: event.场地标签,
                    },
                },
                value: {
                    intensity: parseFloat(event.仪器烈度),
                    maxPga: parseFloat(event.总峰值加速度),
                    maxPgv: parseFloat(event.总峰值速度),
                    vs30: parseFloat(event.参考Vs30),
                    pgaE: parseFloat(event.东西分量PGA),
                    pgaN: parseFloat(event.南北分量PGA),
                    pgaZ: parseFloat(event.竖向分量PGA),
                    pgvE: parseFloat(event.东西分量PGV),
                    pgvN: parseFloat(event.南北分量PGV),
                    pgvZ: parseFloat(event.竖向分量PGV),
                }
            })
        })

        return Object.values(result)
    }

    return transformData(data)
}

export const saveXls = async (arrayBuffer: ArrayBuffer) => {
    const workbook = xlsx.read(arrayBuffer)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)

    if (JSON.stringify(Object.keys(data[0] as object)) !== '["事件编号","发震时间","震中纬度","震中经度","震源深度","发震地点","震级","台网代码","台站编码","台站名称","台站纬度","台站经度","震中距","仪器烈度","总峰值加速度PGA","总峰值速度PGV","场地标签","参考Vs30","东西分量PGA","南北分量PGA","竖向分量PGA","东西分量PGV","南北分量PGV","竖向分量PGV"]') {
        toast.error('错误', {
            description: '请导入正确的 xls 文件'
        })
        return
    }

    try {
        await readDir(await appDataDir())
    } catch {
        await mkdir(await appDataDir())
    }

    await writeFile(`${await appDataDir()}/${Date.now()}.xls`, new Uint8Array(arrayBuffer))
}