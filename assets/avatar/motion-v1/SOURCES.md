# 二维人物动作素材与复现说明

素材由内置 imagegen 工具对现有 `../father-portrait-v4.png` 进行四次定向编辑得到：闭眼、A 口型、O 口型和去除人物的背景板。原始写真与参考图的来源见上一级 [SOURCES.md](../SOURCES.md)。所有素材与工具处理均为本地原型演示，不认定为客户本人的数字孪生。

## 当前片段

- `idle-v3.mp4`：8 秒，间隔眨眼、轻点头与小幅前倾。
- `speaking-v3.mp4`：8 秒，上半身靠近，较轻的分段口型，语段间有停顿。
- `settling-v3.mp4`：1.25 秒，讲完缓缓回正，只播放一次。
- 三段均为 512×768、24fps、H.264 / yuv420p、无声；当前播放器只加载这些 v3 文件，不保留快节奏旧版路径。
- 身体靠近只改变人物前景，背景保持固定；嘴部先做二维形状对齐再混合纹理，避免透明切换叠出两张嘴。当前演示仍不与文本、音频逐字同步。
- 逐文件摘要见 [source-manifest.json](source-manifest.json)，真实 MP4 解码和动作测量见 [media-validation.json](media-validation.json)。

## 离线生成

生成脚本在工作区根目录 `tools/prepare-portrait-motion.py`、`tools/generate-portrait-motion.py` 和 `tools/portrait_mouth_warp.py`。仅离线生成需要 MediaPipe、OpenCV、NumPy 和 FFmpeg；运行原型只需浏览器，不加载这些工具或模型。

1. 使用 MediaPipe Face Landmarker 测量定位点，仅保留 x/y；Image Segmenter 输出人物遮罩。检测权重在临时工具目录，不随原型分发，也不参与运行时展示。
2. 对齐表情关键帧，通过局部二维变形合成口型、眨眼和点头；人物与房间分层，靠近时不移动整张照片。
3. 编码三段本地视频，通过临时文件原子替换已完成的生成结果，避免用户播放到半个 MP4。

运行示例（在工作区根目录，路径按本机工具安装位置填写）：

```powershell
python tools/prepare-portrait-motion.py --assets output/prototype/assets/avatar/motion-v1 --landmark-model <face_landmarker.task> --segment-model <selfie_multiclass.tflite> --packages <临时依赖目录>
python tools/generate-portrait-motion.py --ffmpeg <ffmpeg.exe> --landmarks output/prototype/assets/avatar/motion-v1/source-landmarks.json --assets output/prototype/assets/avatar/motion-v1 --packages <临时依赖目录>
```

参考：[MediaPipe 人脸定位](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/python)、[人物分割](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter)。OpenTalking 的 [FasterLivePortrait](https://datascale-ai.github.io/opentalking/latest/en/model-support/models/fasterliveportrait/) 可作为后续实时驱动的另一个部署方案，本轮未部署，也未将浏览器摄像头作为输入。

## imagegen 实际编辑提示词

### blink.png

Edit this exact portrait for a facial-animation reference frame. Preserve the camera, frame dimensions, man's exact identity, face proportions, head position, hair, clothing, background, lighting and skin colors precisely. Change ONLY the eyelids: both eyes are gently and completely closed in a natural relaxed blink, eyelid crease and eyelashes realistic. Keep the gentle closed-mouth smile exactly as the original. Do not move or tilt the head, do not change eyebrow positions, do not zoom or crop. Photorealistic, same portrait, a single frame, no text, no collage.

### mouth-a.png

Edit this exact portrait for a facial-animation reference frame. Preserve the exact camera, composition, man's identity, head position, face proportions, hair, clothing, background, lighting, skin colors and open eyes. Change ONLY lips and mouth: he is calmly speaking a soft 'ah' syllable, lips naturally parted, a modest mouth opening, realistic inner mouth and a little upper teeth, not smiling widely, not shouting, not surprised. The jaw moves only very slightly downward. Do not move head or change eyebrows or expression elsewhere, do not zoom or crop. One photorealistic animation keyframe, no text, no collage.

### mouth-o.png

Edit this exact portrait for a facial-animation reference frame. Preserve the exact camera, composition, man's identity, head position, face proportions, hair, clothing, background, lighting, skin colors and open eyes. Change ONLY lips and mouth: he is calmly speaking a soft 'oh / oo' syllable, slightly rounded lips, small relaxed natural opening, subtle pursing, realistic inner mouth. Not kissing, not shouting, not surprised. Keep the rest of the face, head and eyebrows still. Do not zoom or crop. One photorealistic animation keyframe, no text, no collage.

### room-empty.png

Edit this exact living-room portrait into a clean background plate for a 2D character animation. Remove ONLY the seated man completely, including hair, face, torso, arms and legs. Reveal and naturally inpaint the empty sofa seat and the living room behind him. Keep the exact same camera angle, image size, window, shelves, framed pictures, wall color, plants, sofa, daylight and all visible background as unchanged as possible. The room must be empty, no people, no human shadows or silhouettes, no additional objects, no text, no collage. This plate will only be visible in small areas that the moving character reveals.
