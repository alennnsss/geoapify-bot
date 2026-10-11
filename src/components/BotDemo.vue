<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const PAGE_SIZE = 3;
const ICONS = { contacted: "✅", replied: "💬", client: "🤝", rejected: "❌" };
const CYCLE = [null, "contacted", "replied", "client", "rejected"];

// Названия и адреса — в i18n (demo.leads), здесь только ключи.
const leads = ref([
  { key: "l1", phone: "+7 700 000 00 01", mobile: true, status: "contacted" },
  { key: "l2", phone: "+7 700 000 00 02", mobile: true, status: null },
  { key: "l3", phone: "+7 727 000 00 03", mobile: false, status: null },
  { key: "l4", phone: "+7 700 000 00 04", mobile: true, status: null },
  { key: "l5", phone: "+7 700 000 00 05", mobile: true, status: null },
  { key: "l6", phone: "+7 727 000 00 06", mobile: false, status: null },
]);

const page = ref(0);
const pages = Math.ceil(leads.value.length / PAGE_SIZE);
const start = computed(() => page.value * PAGE_SIZE);
const slice = computed(() => leads.value.slice(start.value, start.value + PAGE_SIZE));

const toast = ref("");
let toastTimer;

function notify(text) {
  toast.value = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 1600);
}

function cycle(lead) {
  const next = CYCLE[(CYCLE.indexOf(lead.status) + 1) % CYCLE.length];
  lead.status = next;
  notify(next ? t("demo.statusToast", { s: t(`demo.status.${next}`) }) : t("demo.unmarked"));
}
</script>

<template>
  <div class="panel">
    <h2>{{ t("demo.title") }}</h2>
    <p class="panel-note">{{ t("demo.hint") }}</p>
    <div class="chat">
      <div class="chat-head">
        <img src="/bot-icon.svg" alt="" width="36" height="36" />
        <div>
          <strong>Siteless</strong>
          <span>bot</span>
        </div>
      </div>
      <div class="chat-body">
        <div class="bubble out">/search кафе Алматы</div>
        <div class="bubble in">
          {{ t("demo.checked", { n: 48 }) }}<br />{{ t("demo.noSite", { n: 5 }) }}<br />{{ t("demo.socialOnly", { n: 1 }) }}
        </div>
        <div class="bubble in">
          <p class="muted">{{ t("demo.page", { page: page + 1, pages, n: leads.length }) }}</p>
          <div v-for="(lead, i) in slice" :key="lead.key" class="lead">
            <b>{{ start + i + 1 }}. {{ lead.status ? ICONS[lead.status] : "" }} {{ t(`demo.leads.${lead.key}.name`) }}</b>
            <span>{{ t(`demo.leads.${lead.key}.address`) }}</span>
            <span>📞 {{ lead.phone }}{{ lead.mobile ? "" : ` ${t("demo.landline")}` }}</span>
            <span class="links">{{ lead.mobile ? "WhatsApp · " : "" }}{{ t("demo.checkSite") }}</span>
          </div>
          <div class="kb">
            <button
              v-for="(lead, i) in slice"
              :key="lead.key"
              type="button"
              :aria-label="t('demo.statusBtn', { n: start + i + 1 })"
              @click="cycle(lead)"
            >
              {{ lead.status ? ICONS[lead.status] : "📩" }} {{ start + i + 1 }}
            </button>
          </div>
          <div class="kb">
            <button v-if="page > 0" type="button" @click="page--">{{ t("demo.prev") }}</button>
            <button v-if="page < pages - 1" type="button" @click="page++">{{ t("demo.next") }}</button>
          </div>
        </div>
        <Transition name="toast">
          <div v-if="toast" class="chat-toast" role="status">{{ toast }}</div>
        </Transition>
      </div>
    </div>
  </div>
</template>
