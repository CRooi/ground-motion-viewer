import { remove, readFile } from '@tauri-apps/plugin-fs'
import { appDataDir } from '@tauri-apps/api/path'
import { DocumentText } from '@medusajs/icons'
import { Container, Button, Prompt } from '@medusajs/ui'
import { parseData } from '../../../lib/utils'

export default function FileItem({ file, loadFiles, loadData, onClose }: { file: string, loadFiles: () => Promise<void>, loadData: (data: any) => void, onClose: () => void }) {
    const handleDeleteButtonClick = async () => {
        await remove(`${await appDataDir()}/${file}`)
        await loadFiles()
    }

    const handleLoadDataButtonClick = async () => {
        const arrayBuffer = await readFile(`${await appDataDir()}/${file}`)
        loadData(parseData(arrayBuffer))
        onClose()
    }

    return (
        <Container className='mt-2 flex justify-between items-center text-ui-fg-base'>
            <div className='flex gap-2 items-center'>
                <DocumentText />
                <div className='text-sm'>{file}</div>
            </div>

            <div className='flex gap-2'>
                <Prompt>
                    <Prompt.Trigger asChild>
                        <Button variant='danger'>删除</Button>
                    </Prompt.Trigger>

                    <Prompt.Content className='z-50'>
                        <Prompt.Header>
                            <Prompt.Title>确定要删除此文件吗？</Prompt.Title>

                            <Prompt.Description>
                                此操作不可撤销。
                            </Prompt.Description>
                        </Prompt.Header>

                        <Prompt.Footer>
                            <Prompt.Cancel>取消</Prompt.Cancel>
                            <Prompt.Action onClick={handleDeleteButtonClick}>确定</Prompt.Action>
                        </Prompt.Footer>

                    </Prompt.Content>
                </Prompt>
                <Button variant='secondary' onClick={handleLoadDataButtonClick}>查看</Button>
            </div>
        </Container>
    )
}