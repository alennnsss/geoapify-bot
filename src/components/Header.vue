<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { LOCALES, setLocale } from "../i18n.js";
import { theme, toggleTheme } from "../theme.js";
import Icon from "./Icon.vue";

const { t, locale } = useI18n();

const langOpen = ref(false);
const langRoot = ref(null);
const langButton = ref(null);
const current = computed(() => LOCALES.find((item) => item.code === locale.value));

function chooseLocale(code) {
  setLocale(code);
  langOpen.value = false;
  langButton.value?.focus();
}

// Закрываем список по клику мимо и по Escape.
function onDocumentClick(event) {
  if (!langRoot.value?.contains(event.target)) langOpen.value = false;
}

function onKeydown(event) {
  if (event.key === "Escape" && langOpen.value) {
    langOpen.value = false;
    langButton.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <RouterLink to="/" class="logo">Siteless</RouterLink>
      <nav class="nav-pill" :aria-label="t('nav.label')">
        <RouterLink :to="{ path: '/', hash: '#how' }">{{ t("nav.how") }}</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#commands' }">{{ t("nav.commands") }}</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#faq' }">{{ t("nav.faq") }}</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#access' }">{{ t("nav.access") }}</RouterLink>
        <RouterLink to="/about">{{ t("nav.about") }}</RouterLink>
      </nav>
      <div class="header-actions">
        <a class="icon-btn" href="https://t.me/getsite_bot" target="_blank" rel="noopener" :aria-label="t('nav.bot')" :title="t('nav.bot')">
          <Icon name="telegram" />
        </a>
        <RouterLink class="icon-btn show-sm" to="/about" :aria-label="t('nav.about')" :title="t('nav.about')">
          <Icon name="user" />
        </RouterLink>
        <button
          type="button"
          class="icon-btn"
          :aria-label="theme === 'dark' ? t('nav.light') : t('nav.dark')"
          :title="theme === 'dark' ? t('nav.light') : t('nav.dark')"
          @click="toggleTheme"
        >
          <Icon :name="theme === 'dark' ? 'sun' : 'moon'" :size="20" />
        </button>
        <div ref="langRoot" class="lang">
          <button
            ref="langButton"
            type="button"
            class="icon-btn lang-btn"
            aria-haspopup="true"
            :aria-expanded="langOpen"
            :aria-label="t('nav.lang')"
            :title="t('nav.lang')"
            @click="langOpen = !langOpen"
          >
            {{ current?.short }}
            <Icon name="chevron" :size="14" />
          </button>
          <Transition name="menu">
            <ul v-if="langOpen" class="lang-menu" role="menu">
              <li v-for="item in LOCALES" :key="item.code" role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  :aria-checked="item.code === locale"
                  :lang="item.code"
                  @click="chooseLocale(item.code)"
                >
                  {{ item.label }}
                  <span v-if="item.code === locale" aria-hidden="true">✓</span>
                </button>
              </li>
            </ul>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>
