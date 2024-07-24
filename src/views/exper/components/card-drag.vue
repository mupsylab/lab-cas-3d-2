<script setup>
import { onMounted, ref } from "vue";
import { useLoaderAssets } from "@/store/storeAssetsToBlob.js";
const loadAssets = useLoaderAssets();

const props = defineProps({
    initHeightFrame: {
        type: Number,
        default: 1
    },
    lightPos: {
        type: String,
        default: "固定"
    },
    endFrame: {
        type: Number,
        default: 300
    },
    startFrame: {
        type: Number,
        default: 1
    }
});
const {initHeightFrame, lightPos, endFrame, startFrame} = props;

const getFrameFromRatio = (ratio) => {
    return Math.round(ratio * (endFrame - startFrame)) + startFrame;
};
// 计算鼠标位置
const barPos = ref(0.0);
const moveEvent = (e) => {
    const [top, height] = [dom.value.offsetTop + 90, dom.value.clientHeight - 180];

    const ratio = (1 - (e.y - top) / height);
    barPos.value = ratio < 0 ? 0 : (ratio > 1 ? 1 : ratio);

    const ctx = canvas.value.getContext("2d");
    const frame = getFrameFromRatio(barPos.value);
    res.push([frame, performance.now()]); // 保存帧对应的索引
    drawCam1(ctx, lightPos, frame);
    drawCam2(ctx, lightPos, frame);
    drawCam3(ctx, lightPos, frame);
    drawCam4(ctx, lightPos, frame);
};
// 结束事件
const emits = defineEmits(["endClick"]);
const res = [[0, performance.now()]];
const clickEvent = (e) => {
    emits("endClick", res);
};

const drawCam = (url, imgPos, ctx) => {
    const img = new Image();
        img.onload = function() {
            const [sx, sy, iw, ih, x, y, w, h] = imgPos;
            ctx.clearRect(x, y, w, h);
            ctx.drawImage(img, sx, sy, iw, ih, x, y, w, h);
        }
        img.src = url;
};
const drawCam0 = (ctx, lightPos, frame) => {
    drawCam(loadAssets.getBlobUrlByCLF(0, lightPos, frame),
            [373, 51, 213, 437, 0, 90, 213 * 540 / 437, 540], ctx);
};
const drawCam1 = (ctx, lightPos, frame) => {
    drawCam(loadAssets.getBlobUrlByCLF(2, lightPos, frame),
            [0, 0, 960, 540, 300, 90, 480, 270], ctx);
};
const drawCam2 = (ctx, lightPos, frame) => {
    drawCam(loadAssets.getBlobUrlByCLF(1, lightPos, frame),
            [0, 0, 960, 540, 300 + 480, 90, 480, 270], ctx);
};
const drawCam3 = (ctx, lightPos, frame) => {
    drawCam(loadAssets.getBlobUrlByCLF(3, lightPos, frame),
            [0, 0, 960, 540, 300, 90 + 270, 480, 270], ctx);
};
const drawCam4 = (ctx, lightPos, frame) => {
    drawCam(loadAssets.getBlobUrlByCLF(4, lightPos, frame),
            [0, 0, 960, 540, 300 + 480, 90 + 270, 480, 270], ctx);
};
const canvas = ref(null);
const dom = ref(null);
onMounted(() => {
    canvas.value.width = dom.value.clientWidth;
    canvas.value.height = dom.value.clientHeight;
    const ctx = canvas.value.getContext("2d");
    drawCam0(ctx, lightPos, initHeightFrame);
    drawCam1(ctx, lightPos, 1);
    drawCam2(ctx, lightPos, 1);
    drawCam3(ctx, lightPos, 1);
    drawCam4(ctx, lightPos, 1);
});
</script>

<template>
    <div class="card-drag-box" @mousemove="moveEvent" @click="clickEvent" ref="dom">
        <canvas ref="canvas"></canvas>
        <div class="bar" :style="`--bar: ${barPos}`"></div>
    </div>
</template>

<style scoped>
.card-drag-box {
    width: 1280px;
    height: 720px;
    position: relative;
}
.card-drag-box canvas {
    width: 100%;
    height: 100%;
}
.bar {
    position: absolute;
    width: 20px;
    height: 540px;
    right: 0;
    bottom: 90px;
    background-color: #fff;
    background-image: linear-gradient(0deg, #fff 0%, #fff 100%),
                      linear-gradient(0deg, #000 5%, transparent 6%, transparent 100%),
                      linear-gradient(0deg, #000 5%, transparent 6%, transparent 100%);
    background-size: 10px 5px, 18px 10.8px, 20px 54px;
    background-position: 5px 0px, 1px 0px, 0px 0px;
    background-repeat: repeat-y;
}
.bar::after {
    content: "";
    position: absolute;
    width: 10px;
    height: calc(100% * var(--bar));
    right: 5px;
    bottom: 0px;
    background-color: #f00;
}
</style>