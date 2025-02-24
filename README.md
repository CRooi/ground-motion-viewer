# Ground Motion Viewer

Visualizer for "DataSet of strong ground motion parameters of magnitude M4.0 and above earthquakes in China since 2020".

> [!CAUTION]
> This project does not provide any dataset of strong ground motion parameters; all data must be imported by the user. When using this software, it is strictly prohibited to import non-official or tampered datasets. Please read and comply with 《地震科学数据共享管理办法》 ([https://data.earthquake.cn/sjgxgz/info/2016/2344.html](https://data.earthquake.cn/sjgxgz/info/2016/2344.html)).

![image](https://github.com/CRooi/ground-motion-viewer/blob/main/screenshots/main.png?raw=true)
![image](https://github.com/CRooi/ground-motion-viewer/blob/main/screenshots/file.png?raw=true)

## How To Use

Before using, you need to register at the National Earthquake Data Center (https://data.earthquake.cn/).

1. Visit [https://data.earthquake.cn/datashare/report.shtml?PAGEID=ground_motion_list](https://data.earthquake.cn/datashare/report.shtml?PAGEID=ground_motion_list).
2. Enter the query parameters.
3. Perform the query and download the retrieved data.
4. Drag or import the downloaded `.xls` file into Ground Motion Viewer.

## For Developers

### Dev

```
bun tauri dev
```

### Build

```
bun tauri build
```
