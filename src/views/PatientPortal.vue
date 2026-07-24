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
  {
    name: '佛山复星禅诚医院',
    type: '三甲综合医院',
    city: '佛山',
    badge: '佛山首台',
    highlight: 'CyberKnife M6 射波刀',
    description: '肿瘤精准诊疗、妇科重点专科与国际医疗服务。',
    image: '/hospitals/foshan-chancheng.webp',
  },
  {
    name: '武汉同济医院',
    type: '国家医学中心',
    city: '武汉',
    badge: '质子治疗',
    highlight: '肿瘤专科始建于1958年',
    description: '综合肿瘤诊疗、质子治疗及多学科会诊资源。',
    image: '/hospitals/wuhan-tongji.webp',
  },
  {
    name: '北京大学首钢医院',
    type: '三级综合医院',
    city: '北京',
    badge: '北大医学',
    highlight: '精准诊治与临床研究',
    description: '结直肠肿瘤、骨肿瘤及综合诊疗研究资源。',
    image: '/hospitals/beijing-shougang.webp',
  },
  {
    name: '重庆海吉亚肿瘤医院',
    type: '肿瘤专科医院',
    city: '重庆',
    badge: '精准放疗',
    highlight: '陀螺旋转式钴-60放疗',
    description: '放疗、微创介入与肿瘤综合治疗资源。',
    image: '/hospitals/chongqing-hygeia.webp',
  },
  {
    name: '上海第九人民医院',
    type: '三甲综合医院',
    city: '上海',
    badge: '全国第1',
    highlight: '整复外科全国第1',
    description: '2018复旦专科榜；另具口腔颌面及头颈肿瘤优势。',
    image: '/hospitals/shanghai-ninth.webp',
  },
  {
    name: '宁波 Sinocell 希诺赛',
    type: '生物科技机构',
    city: '宁波',
    badge: '专项技术',
    highlight: '细胞制备、储存与质检',
    description: '非医院；临床应用须经资质核验和专家评审。',
    image: '/hospitals/ningbo-sinocell.webp',
  },
]

const experts = [
  {
    name: '林志远',
    role: '医学总监',
    specialty: '肿瘤内科 · MDT · 系统治疗',
    bio: '负责病例初筛、系统治疗路径评审与跨境MDT牵头。',
    image: '/experts/lin-zhiyuan.webp',
  },
  {
    name: '郑慧敏',
    role: '首席医学顾问',
    specialty: '肿瘤外科 · 围术期 · 康复衔接',
    bio: '负责实体瘤外科评审、围术期方案与术后管理衔接。',
    image: '/experts/zheng-huimin.webp',
  },
  {
    name: '陈嘉豪',
    role: '医学顾问',
    specialty: '放射肿瘤 · 影像复核 · 视频面诊',
    bio: '负责放疗适应证评估、影像资料复核与会诊组织。',
    image: '/experts/chen-jiahao.webp',
  },
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
      <div><strong>6项</strong><span>重点医疗资源</span></div>
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
      <header><small>MEDICAL NETWORK</small><h2>重点对接医疗资源</h2><p>覆盖肿瘤精准治疗、综合诊疗、整复医疗与专项技术。</p></header>
      <div class="care-hospital-list">
        <article v-for="hospital in hospitals" :key="hospital.name">
          <div class="care-hospital-photo">
            <img :src="hospital.image" :alt="hospital.name">
            <span>{{ hospital.type }}</span>
          </div>
          <div class="care-hospital-copy">
            <header><em>{{ hospital.city }}</em><small>{{ hospital.badge }}</small></header>
            <b>{{ hospital.name }}</b>
            <strong>{{ hospital.highlight }}</strong>
            <p>{{ hospital.description }}</p>
          </div>
        </article>
      </div>
      <p class="care-resource-source"><b>资料说明</b> 名单依据AGH Facebook公开宣传资料整理，机构优势来自医院官网或政府公开页面。具体接诊医院和医生由AGH专家评审后人工确认。</p>
    </section>

    <section class="care-home-band care-expert-band">
      <header><small>AGH MEDICAL ADVISORY</small><h2>AGH肿瘤专家团队</h2><p>三位AGH内部专家负责牵头评审、视频面诊和MDT会审。</p></header>
      <div class="care-expert-list">
        <article v-for="expert in experts" :key="expert.name">
          <img :src="expert.image" :alt="expert.name">
          <div>
            <header><small>AGH · DEMO</small><em>{{ expert.role }}</em></header>
            <b>{{ expert.name }}</b>
            <strong>{{ expert.specialty }}</strong>
            <p>{{ expert.bio }}</p>
          </div>
        </article>
      </div>
      <p class="care-expert-note">专家姓名、头像及简介为Demo演示资料，正式版替换为AGH确认的真实专家信息。</p>
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
