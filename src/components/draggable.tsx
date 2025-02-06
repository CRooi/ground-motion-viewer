export default function Draggable() {
    return (
        <div id='dragging' className='z-50 absolute top-0 left-0 w-full h-screen bg-ui-bg-base'>
            <div className='m-3 border-dashed border-4 border-ui-border-base bg-ui-bg-secondary rounded-xl flex justify-center items-center' style={{ height: 'calc(100% - 1.5rem)' }}>
                <div className='text-xl font-bold text-ui-fg-base text-center'>
                    <div>将 xls 文件拖拽到此处以导入</div>
                    <div className='opacity-50 text-sm font-normal'>请勿导入非官方或经篡改的强震动观测数据</div>
                </div>
            </div>
        </div>
    )
}