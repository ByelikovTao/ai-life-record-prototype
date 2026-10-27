# 数字人示例模型来源

本轮只用于三维形象和无声动作原型。当前为通用示例人物，不是陈远山或客户本人的数字孪生。

## V1.6 当前照片参考模型

- 使用文件：`reference-person-v3.glb`，生成日期 2026-10-27；入口 gzip 数据为 `avatar-model-data.js`。
- 参考图：`reference-person.png`，由用户在当前会话提供，仅作为当前人物的造型与气质参考。参考图不随基础模型素材标为 CC0。
- 基础工具、来源版本与 CC0 资产许可同下方 V1.5。当前模型没有使用动作库，也没有直接粘贴照片冒充可转动的人物。
- 参数：64 岁东亚男性、`old_asian_male` 皮肤、`short01` 黑灰短发、`eyebrow003` 眉毛、无明显睫毛。独立条纹衬衫、开襟针织外层和灰裤由生成脚本调整，保留蒙皮与 34 个面部形变。默认微笑权重和原始素材摘要见 `reference-person-v3.manifest.json`，完整参数见 `reference-person-v3.params.json`。
- 输出 SHA-256：`1bcb6d9250589abd687bc7748a95a57a41b6f10a164d7d08bc2850c3a23348b1`；13,841,020 字节，gzip 为 9,134,264 字节。
- 工作区生成源：`tmp/generate-elder.ts`、`tmp/reference-outfit.ts`、`tmp/cardigan-geometry.ts`；打包源：`tmp/pack-elder-avatar.cjs`。开衫前襟通过精确三角形裁切和属性插值形成连续边缘，弃用整面剔除及身体壳体叠加路径。
- 页面使用暖米色肖像背景、自然放臂、轻微肤色调整与柔和灯光；当前为单图参考的通用模型，不宣称一比一重建本人。

## V1.5 旧长辈模型（保留溯源）

- 文件：`elder-male-v2.glb`，生成日期 2026-10-27；12,049,028 字节。
- 工具：[Ara 3D Gen](https://github.com/olatunde85/3d-gen/tree/0c3473d7d46a2badcdcd1dcfd4aeb0762eb04b20)，固定版本 `0c3473d7d46a2badcdcd1dcfd4aeb0762eb04b20`，工具代码为 MIT。
- 模型素材：[MakeHuman CC0 资产许可](https://github.com/olatunde85/3d-gen/blob/0c3473d7d46a2badcdcd1dcfd4aeb0762eb04b20/scripts/ASSETS_LICENSE.txt)。未导入动作库，模型输出 `animations: false`。
- 参数：66 岁男性、东亚体型／脸型、`old_asian_male` 皮肤、`short04` 短发、`eyebrow003` 眉毛、无睫毛、`male_casualsuit01` 深蓝衬衫，详情见 `elder-male-v2.params.json`。
- 生成输入的 URL、SHA-256 与工具版本记录在 `elder-male-v2.manifest.json`；输出 SHA-256 为 `ef713fb389e4535d4b5828190bd3919c560087f3a262c420d906d4fbbceffcc7`。
- GLB 内嵌原始纹理，页面在着色阶段保留发丝透明度与纹理明暗，将头发呈现为银灰色；皮肤轻微减橙。页面同时调整手臂姿态，不修改骨骼权重。独立预览模拟这些处理，不等于未经调整的 GLB 截图。
- 运行包为 `avatar-model-data.js` 内嵌 gzip，直接打开 HTML 时无需远程请求；工作区生成脚本为 `tmp/generate-elder.ts` 和 `tmp/pack-elder-avatar.cjs`。

## V1.4 旧模型（仅保留溯源，不再载入）

- 原模型：[TalkingHead 的 mpfb.glb](https://github.com/met4citizen/TalkingHead/blob/6318ff8c798e4a661fcd70c9373c4ab789c822bb/avatars/mpfb.glb)。
- 来源版本：`6318ff8c798e4a661fcd70c9373c4ab789c822bb`，下载日期 2026-10-27。
- 授权：[项目 README 的 Attributions](https://github.com/met4citizen/TalkingHead#attributions)说明 MPFB 示例模型采用 CC0；本原型未采用该项目中有非商业限制的其他人物模型。
- 原始文件：`sample-person-source.glb`，保留来源文件。
- 使用文件：`sample-person.glb`，通过 glTF Transform 4.5.1 将贴图尺寸限制为 1024，保留骨骼与面部形变。
- 派生文件 SHA-256：`ddbf9fd9517829c5df8bb4bf9d0da8ca84dacdf5dc4c65fd1d61e70368487cc9`。
- 运行打包：`avatar-model-data.js` 内嵌 gzip 压缩数据，浏览器在本地解压；不请求远程模型或上传用户资料。

模型带口型、眨眼和表情形变，原型使用头部半身镜头。当前只展示无声动作，不包含语音识别、麦克风采集、本人声音或真实 AI。讲述动画按演示节奏播放，不声称音素级口型同步。
