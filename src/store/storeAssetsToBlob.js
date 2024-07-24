import { defineStore } from "pinia";

export const useLoaderAssets = defineStore("loader-assets-to-blob", {
    state() {
        return {
            obj: {},
            cacheData: [],
            loadCurrNum: 0,
            loadMaxNum: 1,
            _continue: false, // 只允许一个start
            _init: false, // 避免vue的重复加载
            _loadNum: 0, // 已加载静态资源数量
            _loadFinish: false, // 判断是否加载结束，避免重复加载
            update() {}
        };
    },
    getters: {
        getLoadNum() { return this._loadNum; },
        isInit() { return !this._init; },
        isFinish() { return this._loadFinish; }
    },
    actions: {
        init() {
            if(this._init) { return 0; }
            this._init = true;
            this.start();
        },
        setFinishState(b) {
            this._loadFinish = b;
        },
        addKey(cameraFov, lightPos) {
            if(typeof(cameraFov) == 'number') { cameraFov = cameraFov.toString(); }
            const keys01 = Object.keys(this.obj);
            if (keys01.indexOf(cameraFov) < 0) {
                this.obj[cameraFov] = {};
            }
            const keys02 = Object.keys(this.obj[cameraFov]);
            if (keys02.indexOf(lightPos) < 0) {
                this.obj[cameraFov][lightPos] = [];
            }
        },
        addCacheData(...arr) { this.cacheData.push(arr.map(e => e.toString())); },
        loadSuccess(cameraFov, lightPos, frame, blob) {
            this.obj[cameraFov][lightPos][frame] = URL.createObjectURL(blob);
            this._loadNum++;
            this.loadCurrNum--;
            this.update();
        },
        loadError(cameraFov, lightPos, frame) {
            // this.cacheData.push([cameraFov, lightPos, frame]);
            this.loadCurrNum--;
            this.update();
        },
        addImageToBlobByAsync(cameraFov, lightPos, frame) {
            const _this = this;
            const url = `./assets/${cameraFov}/${lightPos}/${frame.toString().padStart(4, "0")}.png`;

            fetch(url, {
                keepalive: false,
                method: "get"
            })
                .then(r => r.blob())
                .then(blob => {
                    _this.loadSuccess(cameraFov, lightPos, frame, blob);
                })
                .catch(e => {
                    _this.loadError(cameraFov, lightPos, frame);
                });
        },
        start() {
            if(this._continue) {return 0;}
            this._continue = true;
            while(this.cacheData.length) {
                if(this.loadCurrNum >= this.loadMaxNum) {
                    break;
                }
                this.loadCurrNum++;
                const info = this.cacheData.splice(0, 1)[0]; // 获取需要加载的图片
                this.addImageToBlobByAsync(...info);
            }
            this._continue = false;
        },
        getBlobUrlByCLF(...a) {
            const [cameraFov, lightPos, frame] = a.map(e => e.toString());
            return this.obj[cameraFov][lightPos][frame];
        }
    }
});