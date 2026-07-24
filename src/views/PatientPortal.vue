<script setup>
import { useRouter } from 'vue-router'
import PwaInstallPrompt from '../components/PwaInstallPrompt.vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({ entryMode: { type: Boolean, default: false } })
const router = useRouter()
const auth = useAuthStore()

function enterService() {
  if (props.entryMode) auth.demoLogin('patient')
  router.push('/patient/records')
}

const hospitals = [
  { mark: 'GZ', name: '广州医科大学附属第一医院', specialty: '国家呼吸医学中心 · 胸部肿瘤诊疗', city: '广州' },
  { mark: 'SYSU', name: '中山大学肿瘤防治中心', specialty: '肿瘤多学科诊疗 · 精准治疗', city: '广州' },
  { mark: 'NF', name: '南方医科大学南方医院', specialty: '综合肿瘤治疗 · 国际医疗服务', city: '广州' },
]

const experts = [
  { avatar: '林', name: '林志远', role: '医学总监', specialty: '肿瘤内科', color: 'blue' },
  { avatar: '郑', name: '郑慧敏', role: '首席医学顾问', specialty: '肿瘤外科', color: 'red' },
  { avatar: '陈', name: '陈嘉豪', role: '医学顾问', specialty: '放射肿瘤与MDT', color: 'green' },
]
</script>

<template>
  <div class="care-public-home">
    <section class="care-brand-hero">
      <div class="care-hero-copy">
        <span>AGH INTERNATIONAL CARE</span>
        <h1>AGH International Care</h1>
        <p>连接马来西亚患者、AGH肿瘤专家与中国优质医疗资源，为每一段跨境治疗旅程提供清晰、可靠的全程支持。</p>
        <div>
          <button type="button" @click="enterService">查看我的服务</button>
          <a href="https://wa.me/60388992026" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
    </section>

    <section class="care-trust-strip">
      <div><strong>6+</strong><span>合作肿瘤中心</span></div>
      <div><strong>3位</strong><span>AGH牵头专家</span></div>
      <div><strong>中英</strong><span>双语全程协调</span></div>
    </section>

    <section class="care-home-band care-value-band">
      <header><small>WHY AGH</small><h2>一支团队，连接治疗全程</h2><p>从资料整理到归国康复，每一步都由明确的专业角色负责。</p></header>
      <div class="care-value-list">
        <article><span>01</span><div><b>AGH专家人工评审</b><p>由AGH内部专家形成医学意见，并人工确认适合的接诊医院与医生。</p></div></article>
        <article><span>02</span><div><b>跨境治疗全程协调</b><p>面诊、医院承接、赴华行程、住院交接均由马来团队持续跟进。</p></div></article>
        <article><span>03</span><div><b>治疗后持续健康管理</b><p>归国后继续提供复查、用药、康复、营养、家访和异常预警支持。</p></div></article>
      </div>
    </section>

    <section class="care-home-band care-hospital-band">
      <header><small>PARTNER HOSPITALS</small><h2>合作医疗机构</h2><p>具体接诊团队由AGH专家评审或MDT会审后人工确认。</p></header>
      <div class="care-hospital-list">
        <article v-for="hospital in hospitals" :key="hospital.name">
          <span>{{ hospital.mark }}</span>
          <div><b>{{ hospital.name }}</b><p>{{ hospital.specialty }}</p></div>
          <em>{{ hospital.city }}</em>
        </article>
      </div>
    </section>

    <section class="care-home-band care-expert-band">
      <header><small>AGH MEDICAL ADVISORY</small><h2>AGH肿瘤专家团队</h2><p>三位AGH内部专家负责牵头评审、视频面诊和MDT会审。</p></header>
      <div class="care-expert-list">
        <article v-for="expert in experts" :key="expert.name">
          <span :class="expert.color">{{ expert.avatar }}</span>
          <div><b>{{ expert.name }} <small>{{ expert.role }}</small></b><p>{{ expert.specialty }}</p></div>
          <em>AGH</em>
        </article>
      </div>
    </section>

    <section class="care-home-band care-flow-band">
      <header><small>YOUR CARE JOURNEY</small><h2>跨境医疗服务流程</h2></header>
      <div>
        <article><span>1</span><b>提交资料</b><small>AI整理与人工校对</small></article>
        <article><span>2</span><b>专家评审</b><small>面诊与接诊决策</small></article>
        <article><span>3</span><b>赴华治疗</b><small>行程、入院与交接</small></article>
        <article><span>4</span><b>归国管理</b><small>康复与长期随访</small></article>
      </div>
    </section>

    <section class="care-home-service">
      <div><small>MY AGH CARE</small><h2>查看我的治疗服务进度</h2><p>医疗资料、专家方案、赴华行程和随访计划集中管理。</p></div>
      <button type="button" @click="enterService">进入服务 <span>›</span></button>
      <PwaInstallPrompt v-if="entryMode" variant="entry" />
    </section>

    <footer class="care-home-footer">匿名化演示平台 · 不用于真实医疗诊断或紧急医疗服务</footer>
  </div>
</template>
