import { Container, Tooltip, TooltipProvider } from '@medusajs/ui'

export default function Copyright({ className }: { className?: string }) {
    return (
        <Container className={`cursor-default text-right inline w-auto text-xs p-2 select-none bg-opacity-20 text-ui-fg-base ${className} opacity-80`}>
            <span>审图号：GS京(2022)1061号</span>
            <br />
            <TooltipProvider>
                <Tooltip className='cursor-default z-50 select-none !max-w-72' content={
                    <>
                        <div>刘奕君、席楠、戴丹青、支明、蔡静等，2020年以来全国大陆M4.0级及以上地震强震动参数数据集，2024.</div>
                        <div>Liu Yijun, Xi Nan, Dai Danqing, Zhi Ming, Cai Jing, et al. DataSet of strong ground motion parameters of magnitude M4.0 and above earthquakes in China since 2020.</div>
                        <div>DOI：10.12080/nedc.11.ds.2024.0002</div>
                        <div>CSTR：12166.11.ds.2024.0003 </div>
                    </>
                }>
                    <span className='cursor-pointer'>数据来源：中国地震台网中心预警速报部</span>
                </Tooltip>
            </TooltipProvider>
            <br />
            <span>使用时请遵守《地震科学数据共享管理办法》</span>
        </Container>
    )
}