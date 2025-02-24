import { useEffect, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom/client'
import maplibregl from 'maplibre-gl'
import axios from 'axios'
import { Button, Drawer, Select, Toaster, toast } from '@medusajs/ui'
import { ArrowPath, CubeSolid, Folder } from '@medusajs/icons'
import intColor from './resources/intColor'
import 'maplibre-gl/dist/maplibre-gl.css'
import Copyright from './components/copyright'
import Earthquake from './components/earthquake'
import Draggable from './components/draggable'
import File from './pages/file'
import { saveXls } from './lib/utils'
import StationTooltip from './components/stationTooltip'

export default function App() {
    let map = useRef<maplibregl.Map | null>(null), bounds = useRef<maplibregl.LngLatBounds>(new maplibregl.LngLatBounds())
    const [data, setData] = useState<any[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isFileDrawerOpen, setIsFileDrawerOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [elArray] = useState<HTMLElement[]>([])
    const [markerArray] = useState<maplibregl.Marker[]>([])

    const fileRef = useRef<{ loadFiles: () => void }>(null)

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
                    'text-size': 10,

                },
                paint: {
                    'text-color': '#222',
                    'text-halo-color': '#ddd',
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
                    'text-size': 12,
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

    const loadData = (_data: any) => {
        setData(_data)
    }

    useEffect(() => {
        if (data.length) {
            displayData(data[0].earthquake.id)
        }
    }, [data])

    useEffect(() => {
        initMap()

        const dragover = (e: DragEvent) => {
            e.preventDefault()
            setIsDragging(true)
        }

        const dragleave = () => {
            setIsDragging(false)
        }

        const drop = (e: DragEvent) => {
            e.preventDefault()
            setIsDragging(false);

            Array.from(e.dataTransfer?.items || []).forEach(item => {
                if (item.kind === 'file') {
                    const file = item.getAsFile()

                    if (file?.type !== 'application/vnd.ms-excel') {
                        toast.error('错误', {
                            description: '请导入正确的 xls 文件'
                        })
                        return
                    }

                    const reader = new FileReader()
                    reader.onload = async () => {
                        const arrayBuffer = reader.result as ArrayBuffer
                        saveXls(arrayBuffer)
                        fileRef.current?.loadFiles()
                    }
                    reader.readAsArrayBuffer(file)
                }
            })
        }

        document.addEventListener('dragover', dragover)
        document.addEventListener('dragleave', dragleave)
        document.addEventListener('drop', drop)
    }, [])

    const displayData = (id: string) => {
        setSelectedId(id)

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

            if (station.value.intensity < 0) {
                station.value.intensity = 0
            } else if (station.value.intensity > 12) {
                station.value.intensity = 12
            }

            el.style.backgroundColor = intColor[Math.round(station.value.intensity)].bgcolor
            el.style.border = `${intColor[Math.round(station.value.intensity)].strokeColor} 3px solid`
            el.innerHTML = Math.round(station.value.intensity).toString()
            el.style.zIndex = Math.round(station.value.intensity + 1).toString()

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([station.station.location.longitude, station.station.location.latitude])
                .addTo(map.current as maplibregl.Map)

            const tooltipEl = document.createElement('div')
            tooltipEl.style.position = 'absolute'
            tooltipEl.style.display = 'none'
            tooltipEl.style.zIndex = '9999'
            tooltipEl.style.pointerEvents = 'none'
            document.body.appendChild(tooltipEl)

            const root = ReactDOM.createRoot(tooltipEl)
            root.render(<StationTooltip data={station} />)

            el.addEventListener('mouseenter', () => {
                const markerEl = marker.getElement()
                const rect = markerEl.getBoundingClientRect()
                tooltipEl.style.display = 'block'
                tooltipEl.style.left = `${rect.right + 10}px`
                tooltipEl.style.top = `${rect.top + (rect.height - tooltipEl.offsetHeight) / 2}px`
            })

            el.addEventListener('mouseleave', () => {
                tooltipEl.style.display = 'none'
            })

            map.current?.on('move', () => {
                if (tooltipEl.style.display === 'block') {
                    const markerEl = marker.getElement()
                    const rect = markerEl.getBoundingClientRect()
                    tooltipEl.style.left = `${rect.right + 10}px`
                    tooltipEl.style.top = `${rect.top + (rect.height - tooltipEl.offsetHeight) / 2}px`
                }
            })

            elArray.push(el)
            markerArray.push(marker)
            elArray.push(tooltipEl)

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

            <div className='absolute top-0 left-0 p-3 z-20'>
                <Select onValueChange={displayData} value={selectedId as string}>
                    <Select.Trigger className='h-auto p-0 z-20 shadow-none select-trigger'>
                        <Select.Value placeholder=''></Select.Value>
                    </Select.Trigger>

                    <Select.Content className='z-20'>
                        {data.map(item => (
                            <Select.Item key={item.earthquake.id} value={item.earthquake.id} className='select-container'>
                                <Earthquake item={item} />
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select>
            </div>

            <div className='absolute top-0 right-0 p-3 flex gap-2 flex-col z-20'>
                <Drawer open={isFileDrawerOpen} onOpenChange={setIsFileDrawerOpen}>
                    <Drawer.Trigger asChild>
                        <Button variant='secondary' onClick={() => setIsFileDrawerOpen(true)}>
                            <Folder />
                            文件
                        </Button>
                    </Drawer.Trigger>

                    <Drawer.Content className='z-40 !max-w-[50vw]'>
                        <File ref={fileRef} onClose={() => setIsFileDrawerOpen(false)} loadData={loadData} />
                    </Drawer.Content>
                </Drawer>


                <Button variant='secondary' onClick={refresh}>
                    <ArrowPath />
                    重载
                </Button>

                <Button variant='secondary' onClick={fitBounds}>
                    <CubeSolid />
                    边界
                </Button>
            </div>

            <Copyright className='absolute z-20 bottom-0 right-0 m-3' />

            {isDragging && <Draggable />}

            <Toaster className='z-50' position='top-center' />
        </>
    )
}