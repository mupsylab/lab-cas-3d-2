<script setup>
import { onMounted, h, render } from 'vue';
import { initJsPsych } from 'jspsych';
import { jsPsychHtmlKeyboardResponse, jsPsychFullscreen, jsPsychSurveyHtmlForm } from '@/utils/jspsych/plugin_all_in_one.js';
import cardDrag from "./components/card-drag.vue";

import inst_total from './instruction/total.vue';
import inst_part1 from './instruction/part1.vue';
import inst_part2 from './instruction/part2.vue';
import inst_part1_prac from './instruction/part1_prac.vue';
import inst_part1_form from './instruction/part1_form.vue';

import renderInfo from "@/utils/renderInfo";
import { useLoaderAssets } from "@/store/storeAssetsToBlob.js";
const loadAssets = useLoaderAssets();

const jsPsych = initJsPsych({
  display_element: "exp",
  on_finish() {
    console.log(jsPsych.data.get().csv());
    jsPsych.DOM_container.innerHTML = "<div style='font-size: 32px;'>实验已结束，感谢您的参与</div>";
  }
});
window.jspsych = jsPsych;
window.loadAssets = loadAssets;

const timeline = [{
  timeline: [{
    type: jsPsychHtmlKeyboardResponse,
    choices: "NO_KEYS",
    stimulus: () => {
      return "请用本地浏览器打开";
    }
  }],
  conditional_function: () => {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/micromessenger/i) == "micromessenger") {
      return true;
    } else {
      return false;
    }
  }
}];
/**
 * 加载静态资源
 */
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  choices: ["NO_KEYS"],
  stimulus: "<span id='a1'>0</span>/<span id='a2'>1</span>",
  on_load() {
    const camera = [1, 2, 3, 4];
    const lightPos = ["固定", "两端变化", "中间变化", "越来越大", "越来越小"];
    const frames = 300;

    const totalNumDom = document.querySelector("#a2");
    const countNumDom = document.querySelector("#a1");
    totalNumDom.innerText = `${camera.length * lightPos.length * frames + 3 * 5}`;

    if (loadAssets.isFinish) {
      jsPsych.finishTrial();
      return 0;
    }

    // 判断是否存在vue的热加载，若为热加载，则刷新页面
    if (loadAssets.isInit) {
      loadAssets.update = function () {
        countNumDom.innerText = loadAssets.getLoadNum.toString();
        if (countNumDom.innerText == totalNumDom.innerText) {
          loadAssets.setFinishState(true);
          jsPsych.finishTrial();
        } else {
          loadAssets.start();
        }
      }

      lightPos.forEach(v2 => {
        camera.forEach(v1 => {
          loadAssets.addKey(v1, v2);
          for (let i = 1; i <= frames; i++) {
            loadAssets.addCacheData(v1, v2, i);
          }
        });
        loadAssets.addKey(0, v2);
        loadAssets.addCacheData(0, v2, 100);
        loadAssets.addCacheData(0, v2, 200);
        loadAssets.addCacheData(0, v2, 300);
      });
      loadAssets.init();
    } else {
      location.reload()
    }
  },
  on_finish() {
    console.log(loadAssets.obj);
  }
});

// 开始实验前各个trial的设计
const trial = {
  type: jsPsychHtmlKeyboardResponse,
  choices: ["NO_KEYS"],
  stimulus: "<div class='box'></div>",
  on_load() {
    render(h(cardDrag, {
      initHeightFrame: jsPsych.timelineVariable("initHeightFrame", true),
      lightPos: jsPsych.timelineVariable("lightPos", true),
      onEndClick(res) {
        render(null, document.querySelector(".box"));
        jsPsych.finishTrial({ start_time: res[0][1], res });
      }
    }), document.querySelector(".box"));
  }
};

const trial_ques = {
  type: jsPsychSurveyHtmlForm,
  html() {
    return "<div style='font-size: 24px;'>请观察图中的阴影设计，选出最符合你情况的选项。</div>" + renderInfo([{
      type: "radio",
      name: "nature",
      required: true,
      choose: ["1", "2", "3", "4", "5", "6", "7"],
      align: "hor",
      prefix: "我认为阴影设计非常自然"
    }, {
      type: "radio",
      name: "butty",
      required: true,
      choose: ["1", "2", "3", "4", "5", "6", "7"],
      align: "hor",
      prefix: "我认为阴影设计非常美观"
    }]);
  },
  button_label: "继续",
  on_finish(data) {
    Object.keys(data.response).forEach((v, i) => {
      data[v] = data.response[v];
    });
  }
};

const fixation = {
  type: jsPsychHtmlKeyboardResponse,
  choices: "NO_KEYS",
  stimulus: "<div style='font-size: 100px;'>+</div>",
  trial_duration: 100
}

const rest = {
  type: jsPsychHtmlKeyboardResponse,
  choices: " ",
  stimulus: "<div style='font-size: 32px;'>你可以休息一分钟！</div><div style='margin: 45px 0 0 0; font-size: 20px;'>（你也可以按空格键继续实验）</div>"
}

// 开始实验流程的设计
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: false,
  message: '<p style="margin: 0 0 53px 0;">欢迎参加本实验，请点击下方按钮进入全屏状态。</p>',
  button_label: "全屏进入实验"
});


timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  choices: [" "],
  stimulus: "<div id='box'></div>",
  on_load() {
    render(h(inst_total), document.querySelector("#box"));
  }
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  choices: [" "],
  stimulus: "<div id='box'></div>",
  on_load() {
    render(h(inst_part1), document.querySelector("#box"));
  }
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  choices: [" "],
  stimulus: "<div id='box'></div>",
  on_load() {
    render(h(inst_part1_prac), document.querySelector("#box"));
  }
}, fixation, {
  timeline: [trial],
  timeline_variables: [{ lightPos: "固定", initHeightFrame: 100 }]
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  choices: [" "],
  stimulus: "<div id='box'></div>",
  on_load() {
    render(h(inst_part1_form), document.querySelector("#box"));
  }
});

// 核心实验流程
let block = 1;
timeline.push({
  timeline: [{
    timeline: [fixation, trial, trial_ques],
    timeline_variables: jsPsych.randomization.factorial({
      lightPos: ["固定", "两端变化", "中间变化", "越来越大", "越来越小"],
      initHeightFrame: [100, 200, 300]
    })
  }, rest],
  conditional_function() { return true; },
  loop_function() {
    if (block < 3) {
      block++;
      return true;
    }
    return false;
  }
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  choices: [" "],
  stimulus: "<div id='box'></div>",
  on_load() {
    render(h(inst_part2), document.querySelector("#box"));
  }
});

timeline.push({
  type: jsPsychSurveyHtmlForm,
  html() {
    return renderInfo([{
      size: 4,
      type: "text",
      name: "age",
      required: true,
      prefix: "您的年龄是"
    },
    {
      type: "radio",
      name: "gender",
      required: true,
      choose: ["男", "女"],
      align: "col",
      prefix: "您的性别是"
    },
    {
      type: "radio",
      name: "education",
      required: true,
      choose: ["小学", "中学", "中专", "大专", "本科", "硕士及以上"],
      align: "col",
      prefix: "您的最高学历"
    },
    {
      type: "radio",
      name: "phoneLicense",
      required: true,
      choose: ["是", "否"],
      align: "col",
      prefix: "您是否使用过智能手机？"
    },
    {
      size: 8,
      type: "text",
      name: "usePhoneTime",
      required: true,
      prefix: "您的机龄是多久？"
    }]);
  },
  button_label: "继续",
  on_finish(data) {
    const info = {};
    Object.keys(data.response).forEach((v, i) => {
      info[v] = data.response[v];
    });
    jsPsych.data.get().addToAll(info); // 保存被试信息
  }
});

timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: false,
});

onMounted(() => {
  jsPsych.run(timeline);
});
</script>

<template>
  <div id="exp"></div>
</template>

<style scoped></style>