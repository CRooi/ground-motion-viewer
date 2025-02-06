import { Container } from '@medusajs/ui'
import intColor from '../resources/intColor'

export default function Earthquake({ item }: { item: any }) {
    let maxIntensity = Math.round(Math.max(...item.stations.map((station: any) => station.value.intensity)))

    if (maxIntensity < 0) {
        maxIntensity = 0
    } else if (maxIntensity > 12) {
        maxIntensity = 12
    }

    return (
        <Container className='flex p-1.5 items-center z-50'>
            <div className='flex gap-2 flex-1'>
                <div className='max-intensity' style={{ backgroundColor: intColor[maxIntensity].bgcolor, border: `${intColor[maxIntensity].strokeColor} 3px solid` }}>
                    {maxIntensity}
                </div>

                <div className='flex flex-col justify-center items-start leading-4'>
                    <div className='font-bold text-lg leading-6'>{item.earthquake.hypocenter.name}</div>
                    <div>M{item.earthquake.magnitude.toFixed(1)} {item.earthquake.hypocenter.location.depth}km</div>
                    <div>{item.earthquake.time}</div>
                </div>
            </div>

            <div>
                <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' fill='none' className='text-ui-fg-muted group-disabled/trigger:text-ui-fg-disabled ml-2' aria-hidden='true'><path fill='currentColor' d='M4.91 5.75c-.163 0-.323-.037-.464-.108a.85.85 0 0 1-.334-.293A.7.7 0 0 1 4 4.952a.7.7 0 0 1 .142-.39l2.59-3.454c.082-.11.195-.2.33-.263a1.04 1.04 0 0 1 .876 0 .9.9 0 0 1 .33.263l2.59 3.455a.7.7 0 0 1 .141.39.7.7 0 0 1-.111.396.85.85 0 0 1-.335.293c-.14.07-.3.108-.464.108zM10.09 9.25c.163 0 .323.037.463.108.14.07.256.172.335.293a.7.7 0 0 1 .111.397.7.7 0 0 1-.141.39l-2.59 3.454a.9.9 0 0 1-.33.263 1.04 1.04 0 0 1-.876 0 .9.9 0 0 1-.33-.263l-2.59-3.455a.7.7 0 0 1-.142-.39.7.7 0 0 1 .112-.396.85.85 0 0 1 .335-.293c.14-.07.3-.108.463-.108z'></path></svg>
            </div>
        </Container>
    )
}