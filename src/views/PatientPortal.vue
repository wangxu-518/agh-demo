<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="patient-public-home">
    <section class="patient-brand-hero">
      <span>AGH INTERNATIONAL CARE</span>
      <h1>跨越国界，连接更适合您的肿瘤医疗资源</h1>
      <p>由马来西亚服务团队、中国诊疗运营团队、肿瘤专家和合作医院共同提供全流程支持。</p>
      <button @click="router.push('/patient/records')">查看我的服务进度</button>
    </section>

    <section class="patient-trust-strip"><div><strong>6+</strong><span>合作肿瘤中心</span></div><div><strong>30+</strong><span>多学科专家</span></div><div><strong>中英</strong><span>双语全程服务</span></div></section>

    <section class="patient-home-section">
      <small>WHY AGH</small><h2>为什么选择我们</h2>
      <div class="patient-reason-grid">
        <article><span>01</span><b>专业医疗匹配</b><p>根据病种、分期和需求协调适合的专家与医院，而不是简单转诊。</p></article>
        <article><span>02</span><b>跨境全程协调</b><p>从资料整理、远程评审到签证、接送、入院和归国随访均有专人负责。</p></article>
        <article><span>03</span><b>双语信息透明</b><p>重要医疗资料、治疗方案、费用和出院安排以患者可理解的方式呈现。</p></article>
        <article><span>04</span><b>归国持续管理</b><p>治疗结束后继续提供复查、用药、康复、预警和专家复评服务。</p></article>
      </div>
    </section>

    <section class="patient-home-section hospital-section">
      <small>PARTNER HOSPITALS</small><h2>合作医疗机构</h2>
      <div class="patient-partners">
        <article><span>H</span><div><b>广州医科大学附属第一医院</b><p>国家呼吸医学中心 · 胸部肿瘤诊疗</p></div></article>
        <article><span>SYSU</span><div><b>中山大学肿瘤防治中心</b><p>肿瘤多学科诊疗与精准治疗</p></div></article>
        <article><span>NF</span><div><b>南方医科大学南方医院</b><p>国际医疗服务与综合肿瘤治疗</p></div></article>
      </div>
      <p class="partner-note">合作资源将根据患者病情、专家意见、床位和服务需求进行匹配。</p>
    </section>

    <section class="patient-service-flow"><small>HOW IT WORKS</small><h2>我们的服务流程</h2><div><span>1<em>提交资料</em></span><i></i><span>2<em>专家评审</em></span><i></i><span>3<em>赴华治疗</em></span><i></i><span>4<em>归国管理</em></span></div></section>

    <section class="patient-contact-card"><div><small>NEED HELP?</small><h2>联系我们</h2><p>服务时间：周一至周日 08:00–22:00</p></div><div class="contact-actions"><a href="tel:+60388992026">☎ +60 3-8899 2026</a><a href="https://wa.me/60388992026" target="_blank" rel="noreferrer">WhatsApp 咨询</a></div></section>
    <footer class="patient-home-footer">匿名化演示平台 · 不用于真实医疗诊断</footer>
  </div>
</template>
