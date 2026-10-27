# 人物档案示例视频来源

生成日期：2026-10-27。三份文件仅用于展示人生影片归档与本人拍摄影像的浏览、播放和时间轴交互，**不是客户成片，也不是本人真实拍摄素材**。每份画面持续显示“原型演示素材”和“由示例图片生成 · 非真实拍摄”。

| 文件 | 画面组成 | 时长 | 格式 |
|---|---|---|---|
| life-film.mp4 | 参考人物肖像 → 老屋 → 家人交流，淡入淡出与缓慢缩放 | 12 秒 | H.264 Constrained Baseline，640×360，25 fps，yuv420p，无音轨 |
| home-moment.mp4 | 老屋示例图的缓慢镜头移动 | 12 秒 | 同上 |
| family-moment.mp4 | 家人交流示例图的缓慢镜头移动 | 12 秒 | 同上 |

原图只读使用，没有覆盖：

- `../family.png`、`../room.png`：本项目已有 AI 生成示例图，原始说明见 [生成说明](../生成说明.md)。
- `../avatar/reference-person.png`：用户在当前会话提供的人物参考图，相关说明见 [人物来源](../avatar/SOURCES.md)。没有将用户提供的图片标为 CC0。

本地生成工具为 [ffmpeg-static 5.2.0](https://www.npmjs.com/package/ffmpeg-static/v/5.2.0)，已通过 npm 元数据确认其官方仓库为 [eugeneware/ffmpeg-static](https://github.com/eugeneware/ffmpeg-static)。包配置使用 `b6.0` Windows x64 资产，实际执行版本为 `ffmpeg 6.0-essentials_build-www.gyan.dev`。工具与依赖仅安装在工作区临时目录 `tmp/archive-media/`，不属于 APP 运行依赖，FFmpeg 二进制与系统字体不放入原型交付包。

可复现生成脚本为工作区 `tmp/archive-demo-generate.py`，通过参数传入 FFmpeg 路径。完整执行命令、输出规格、SHA-256、MP4 索引位置及解码结果见 [media-validation.json](media-validation.json)。三份文件合计约 2.61 MB。

已使用 FFmpeg 完整解码各文件，核对 12.0 秒、视频编码／尺寸／像素格式与无音轨，确认 `moov` 位于 `mdat` 之前。另提取每段第 6 秒的帧并通过图像查看工具检查水印、字幕和画面，三个水印均可读。没有启动浏览器、项目服务或访问真实客户资料；浏览器原生播放器的最终视觉及设备兼容性由整合验证另行说明。
