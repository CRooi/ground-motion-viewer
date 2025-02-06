import { Container } from '@medusajs/ui'

export default function Copyright({ className }: { className?: string }) {
    return (
        <Container className={`text-right inline w-auto text-xs p-2 select-none bg-opacity-20 text-black dark:text-white ${className}`}>
            <span>数据来源：中国地震台网中心预警速报部</span>
            {/* <br />
            <span>刘奕君、席楠、戴丹青、支明、蔡静等，2020年以来全国大陆M4.0级及以上地震强震动参数数据集，2024.</span> */}
        </Container>
    )
}