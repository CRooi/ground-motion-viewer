import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Button, Drawer } from '@medusajs/ui'
import { readDir, mkdir } from '@tauri-apps/plugin-fs'
import { appDataDir } from '@tauri-apps/api/path'
import FileItem from './components/fileItem'
import { ArchiveBox, ArrowDownTray } from '@medusajs/icons'
import { saveXls } from '../../lib/utils'

interface FileComponentProps {
    onClose: () => void
    loadData: (data: any) => void
}

const FileComponent = forwardRef<{ loadFiles: () => void }, FileComponentProps>((props, ref) => {
    const { onClose, loadData } = props

    const [files, setFiles] = useState<string[]>([])

    const loadFiles = async () => {
        try {
            await readDir(await appDataDir())
        } catch {
            await mkdir(await appDataDir())
        }

        setFiles((await readDir(await appDataDir())).map(file => file.name).filter(file => file.endsWith('.xls')).sort((a, b) => b.localeCompare(a)))
    }

    useEffect(() => {
        loadFiles()
    }, [])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImportButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current!.click()
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (file) {
            const arrayBuffer = await file.arrayBuffer()
            await saveXls(arrayBuffer)
            await loadFiles()
        }
    }

    useImperativeHandle(ref, () => ({
        loadFiles
    }))

    return (
        <>
            <Drawer.Header>
                <Drawer.Title className='font-bold text-ui-fg-base'>文件</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body className='p-3 overflow-y-auto text-ui-fg-base'>
                <div>
                    <Button onClick={handleImportButtonClick}>
                        <ArrowDownTray />
                        导入 xls 文件
                    </Button>

                    <input ref={fileInputRef} type='file' accept='.xls' onChange={handleFileChange} className='hidden' />
                </div>

                <hr className="my-docs_2 h-[1px] w-full border-0 bg-ui-bg-switch-off my-3" />

                <div className='font-bold text-sm'>已导入文件</div>

                {files.length === 0
                    ?
                    <div className='text-center flex justify-center items-center flex-col mt-3 opacity-50'>
                        <ArchiveBox />
                        <div className='text-sm'>暂无文件</div>
                    </div>
                    :
                    files.map(file => (
                        <FileItem key={file} file={file} loadFiles={loadFiles} loadData={loadData} onClose={onClose} />
                    ))}
            </Drawer.Body>

            <Drawer.Footer>
                <Button variant='primary' onClick={onClose}>完成</Button>
            </Drawer.Footer>
        </>
    )
})

export default FileComponent