/** 生成离线浏览器依赖入口；运行 npm run build:vendor 后使用生成的全局包。 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
window.MemoryThree={...THREE,RoundedBoxGeometry,GLTFLoader,HDRLoader,EffectComposer,RenderPass,GTAOPass,OutputPass};
