import intColor from '../resources/intColor'

interface StationTooltipProps {
    data: any
}

export default function StationTooltip(props: StationTooltipProps) {
    const intensity = props.data.value.intensity < 0 ? 0 : props.data.value.intensity > 12 ? 12 : props.data.value.intensity
    const roundedIntensity = Math.round(intensity)
    const { bgcolor, strokeColor } = intColor[roundedIntensity]
    const stationLngLatInfo = <div>
        {props.data.station.location.latitude === 0 ? '0' : props.data.station.location.latitude > 0 ? `${props.data.station.location.latitude.toFixed(2)}N` : `${props.data.station.location.latitude.toFixed(2)}S`}
        ,
        {props.data.station.location.longitude === 0 ? '0' : props.data.station.location.longitude > 0 ? `${props.data.station.location.longitude.toFixed(2)}E` : `${props.data.station.location.longitude.toFixed(2)}W`}
        &nbsp;{props.data.station.location.distance}km
    </div>
    const stationInfo = <div className='flex gap-0.5 items-center'>
        <div className='text-base'>{props.data.station.name}</div>
        <div className='opacity-50 text-[.5rem] leading-[.6rem]'>
            <div>{props.data.station.code}.{props.data.station.id} {props.data.station.location.tag}</div>
            {stationLngLatInfo}
        </div>
    </div>

    return (
        <div className='text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 rounded-md p-2 border-zinc-200 dark:border-zinc-700 border-2 shadow-sm'>
            <div className='flex gap-1 items-center'>
                <div className='font-bold border-2 rounded-md p-0.5 text-white flex items-center justify-center'
                    style={{ borderColor: strokeColor, backgroundColor: bgcolor, textShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)' }}>
                    仪器烈度{roundedIntensity}
                </div>
                <div className='font-bold'>{stationInfo}</div>
            </div>

            <div className='text-sm mt-2'>
                <div>仪器烈度: {props.data.value.intensity.toFixed(1)}</div>
                <div>总峰值加速度PGA: {props.data.value.maxPga}</div>
                <div>总峰值速度PGV: {props.data.value.maxPgv}</div>
                <div>参考Vs30: {props.data.value.vs30}</div>
                <div>东西分量PGA: {props.data.value.pgaE}</div>
                <div>南北分量PGA: {props.data.value.pgaN}</div>
                <div>竖向分量PGA: {props.data.value.pgaZ}</div>
                <div>东西分量PGV: {props.data.value.pgvE}</div>
                <div>南北分量PGV: {props.data.value.pgvN}</div>
                <div>竖向分量PGV: {props.data.value.pgvZ}</div>
            </div>
        </div>
    )
}