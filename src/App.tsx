import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import axios from 'axios'
import { Button, Container, Select } from '@medusajs/ui'
import { ArrowPath, CubeSolid } from '@medusajs/icons'
import intColor from './resources/intColor'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function App() {
    let map = useRef<maplibregl.Map | null>(null), bounds = useRef<maplibregl.LngLatBounds>(new maplibregl.LngLatBounds())
    const [data, setData] = useState<any[]>([])

    const fitChinaMainlandBounds = (animate: boolean) => {
        map.current?.fitBounds(
            [
                new maplibregl.LngLat(72.4951, 15.58),
                new maplibregl.LngLat(136.0765, 55.33)
            ],
            { animate }
        )
    }

    const initMap = async () => {
        const chinaGeojson = (await axios.get('./resources/geojson/china.json')).data
        const chinaCityGeojson = (await axios.get('./resources/geojson/china-city.json')).data

        const chinaProvinceLabelGeojson = {
            type: 'FeatureCollection',
            features: chinaGeojson.features.filter((feature: any) => feature.properties.adchar !== 'JD').map((feature: any) => ({
                ...feature,
                geometry: {
                    type: 'Point',
                    coordinates: feature.properties.center
                }
            }))
        }

        const chinaCityLabelGeojson = {
            type: 'FeatureCollection',
            features: chinaCityGeojson.features.filter((feature: any) => feature.properties.adchar !== 'JD').map((feature: any) => ({
                ...feature,
                geometry: {
                    type: 'Point',
                    coordinates: feature.properties.center
                }
            }))
        }

        console.log(chinaCityLabelGeojson)

        map.current = new maplibregl.Map({
            container: 'map',
            style: {
                version: 8,
                sources: {},
                layers: [],
                glyphs: 'https://fonts.undpgeohub.org/fonts/{fontstack}/{range}.pbf',
            },
            center: [107.79942839007867, 37.093496518166944],
            zoom: 2,
        })

        map.current.on('load', () => {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

            map.current?.addSource('china', {
                type: 'geojson',
                data: chinaGeojson
            })

            map.current?.addSource('china-city', {
                type: 'geojson',
                data: chinaCityGeojson
            })

            map.current?.addSource('china-province-label', {
                type: 'geojson',
                data: chinaProvinceLabelGeojson as any
            })

            map.current?.addSource('china-city-label', {
                type: 'geojson',
                data: chinaCityLabelGeojson as any
            })

            if (mediaQuery.matches) {
                // dark
                map.current?.addLayer({
                    id: 'china-fill',
                    type: 'fill',
                    source: 'china',
                    paint: {
                        'fill-color': '#222'
                    }
                })
            } else {
                // light
                map.current?.addLayer({
                    id: 'china-fill',
                    type: 'fill',
                    source: 'china',
                    paint: {
                        'fill-color': '#eee'
                    }
                })
            }

            map.current?.addLayer({
                id: 'china-city-line',
                type: 'line',
                source: 'china-city',
                paint: {
                    'line-color': '#848484',
                    'line-width': 0.1
                },
                filter: ['all', ['>', ['zoom'], 4]]
            })

            map.current?.addLayer({
                id: 'china-province-line',
                type: 'line',
                source: 'china',
                paint: {
                    'line-color': '#ADB8C0',
                    'line-width': 0.8
                }
            })

            map.current?.addLayer({
                id: 'china-city-label',
                type: 'symbol',
                source: 'china-city-label',
                layout: {
                    'text-field': ['get', 'name'],
                    'text-font': ['Roboto Regular'],
                    'text-size': 12,

                },
                paint: {
                    'text-color': '#222',
                    'text-halo-color': '#eee',
                    'text-halo-width': 1,
                },
                filter: ['all', ['>', ['zoom'], 4]]
            })

            map.current?.addLayer({
                id: 'china-province-label',
                type: 'symbol',
                source: 'china-province-label',
                layout: {
                    'text-field': ['get', 'name'],
                    'text-font': ['Roboto Regular'],
                    'text-size': 14,
                },
                paint: {
                    'text-color': '#000000',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 1,
                }
            })

            fitChinaMainlandBounds(false)

            mediaQuery.addEventListener('change', e => {
                if (e.matches) {
                    // dark
                    map.current?.removeLayer('china-fill')

                    map.current?.addLayer({
                        id: 'china-fill',
                        type: 'fill',
                        source: 'china',
                        paint: {
                            'fill-color': '#222'
                        }
                    })
                } else {
                    // light
                    map.current?.removeLayer('china-fill')

                    map.current?.addLayer({
                        id: 'china-fill',
                        type: 'fill',
                        source: 'china',
                        paint: {
                            'fill-color': '#eee'
                        }
                    })
                }

                map.current?.moveLayer('china-fill', 'china-province-line')
                map.current?.moveLayer('china-fill', 'china-city-line')
            })
        })
    }

    const loadData = async () => {
        const data = (await axios.get('./resources/data.json')).data
        setData(data)
    }

    useEffect(() => {
        initMap()
        loadData()
    }, [])

    const elArray = [] as HTMLElement[]
    const markerArray = [] as maplibregl.Marker[]

    const displayData = (id: string) => {
        elArray.forEach(el => el.remove())
        markerArray.forEach(marker => marker.remove())

        bounds.current = new maplibregl.LngLatBounds()

        const item = data.find(item => item.earthquake.id === id)

        const el = document.createElement('div')
        el.className = 'epicenter'

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([item.earthquake.hypocenter.location.longitude, item.earthquake.hypocenter.location.latitude])
            .addTo(map.current as maplibregl.Map)

        elArray.push(el)
        markerArray.push(marker)

        bounds.current.extend([item.earthquake.hypocenter.location.longitude, item.earthquake.hypocenter.location.latitude])

        item.stations.forEach((station: any) => {
            const el = document.createElement('div')
            el.className = 'station'
            el.style.backgroundColor = intColor[Math.round(station.value.intensity)].bgcolor
            el.style.border = `${intColor[Math.round(station.value.intensity)].strokeColor} 3px solid`
            el.innerHTML = Math.round(station.value.intensity).toString()
            el.style.zIndex = Math.round(station.value.intensity).toString()

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([station.station.location.longitude, station.station.location.latitude])
                .addTo(map.current as maplibregl.Map)

            elArray.push(el)
            markerArray.push(marker)

            bounds.current.extend([station.station.location.longitude, station.station.location.latitude])
        })

        map.current?.fitBounds(bounds.current, { padding: 50, animate: true })
    }

    const refresh = () => {
        window.location.reload()
    }

    const fitBounds = () => {
        if (bounds.current.isEmpty()) {
            fitChinaMainlandBounds(true)
        } else {
            map.current?.fitBounds(bounds.current, { padding: 50, animate: true })
        }
    }

    return (
        <>
            <div id='map' className='h-screen bg-gray-50 dark:bg-[#242424]'></div>

            <div className='absolute top-0 left-0 p-3 z-50'>
                <Select onValueChange={displayData}>
                    <Select.Trigger className='h-auto p-0 z-50 shadow-none select-trigger'>
                        <Select.Value placeholder={<div className='flex items-center p-3'>请选择<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' fill='none' className='text-ui-fg-muted group-disabled/trigger:text-ui-fg-disabled ml-2' aria-hidden='true'><path fill='currentColor' d='M4.91 5.75c-.163 0-.323-.037-.464-.108a.85.85 0 0 1-.334-.293A.7.7 0 0 1 4 4.952a.7.7 0 0 1 .142-.39l2.59-3.454c.082-.11.195-.2.33-.263a1.04 1.04 0 0 1 .876 0 .9.9 0 0 1 .33.263l2.59 3.455a.7.7 0 0 1 .141.39.7.7 0 0 1-.111.396.85.85 0 0 1-.335.293c-.14.07-.3.108-.464.108zM10.09 9.25c.163 0 .323.037.463.108.14.07.256.172.335.293a.7.7 0 0 1 .111.397.7.7 0 0 1-.141.39l-2.59 3.454a.9.9 0 0 1-.33.263 1.04 1.04 0 0 1-.876 0 .9.9 0 0 1-.33-.263l-2.59-3.455a.7.7 0 0 1-.142-.39.7.7 0 0 1 .112-.396.85.85 0 0 1 .335-.293c.14-.07.3-.108.463-.108z'></path></svg></div>}></Select.Value>
                    </Select.Trigger>

                    <Select.Content className='z-50'>
                        {data.map(item => (
                            <Select.Item key={item.earthquake.id} value={item.earthquake.id} className='select-container'>
                                <Container className='flex p-1.5 items-center z-50'>
                                    <div className='flex gap-2 flex-1'>
                                        <div className='max-intensity' style={{ backgroundColor: intColor[Math.round(Math.max(...item.stations.map((station: any) => station.value.intensity)))].bgcolor, border: `${intColor[Math.round(Math.max(...item.stations.map((station: any) => station.value.intensity)))].strokeColor} 3px solid` }}>
                                            {Math.round(Math.max(...item.stations.map((station: any) => station.value.intensity)))}
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
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select>
            </div>

            <div className='absolute top-0 right-0 p-3 flex gap-3 flex-col z-50'>
                <Button variant='secondary' onClick={refresh}>
                    <ArrowPath />
                    刷新
                </Button>

                <Button variant='secondary' onClick={fitBounds}>
                    <CubeSolid />
                    边界
                </Button>
            </div>
        </>
    )
}