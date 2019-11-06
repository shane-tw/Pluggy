<template>
  <div>
    <p v-if="!$root.loggedInUser">You need to log in for your plugins to be tracked</p>
    <template v-else>
      <div v-if="plugins.length === 0" class="blank-slate">
        <span class="blank-slate__text">You haven't published any plugins yet</span>
        <button class="blank-slate__button button button--clickable" v-b-modal.pluginModal @click="mode = 'add'">Add Plugin</button>
      </div>
      <div v-else>
        <div style="display: flex; justify-content: flex-end; margin: 0.5rem;">
          <button v-b-modal.pluginModal @click="mode = 'add'">Add Plugin</button>
        </div>
        <div class="s-plugins-list">
          <div class="w-plugin" v-for="(plugin, pluginIdx) in plugins" :key="pluginIdx">
            <div class="w-plugin__header">
              <div class="w-plugin__title">{{ plugin.name }}</div>
              <b-button v-if="!plugin.enabled" variant="success" @click="enablePlugin(plugin)">Add</b-button>
              <b-dropdown v-if="plugin.enabled" variant="outline-primary" no-caret v-on:show="maybeSettings(plugin)">
                <template slot="button-content"><font-awesome-icon icon="cog" /></template>
                <b-dropdown-item v-if="plugin.hasSettings" href="#" @click="viewSettings(plugin)">Settings</b-dropdown-item>
                <b-dropdown-item href="#" @click="disablePlugin(plugin)">Remove</b-dropdown-item>
                <b-dropdown-item href="#" @click="deletePlugin(plugin)">Delete</b-dropdown-item>
              </b-dropdown>
            </div>
            <div class="w-plugin__desc">
              {{ plugin.description }}
            </div>
          </div>
        </div>
      </div>
      <PluginModal :mode="mode" v-on:plugin-created="updatePlugins" />
    </template>
  </div>
</template>

<script src="./Plugins.js" />

<style lang="scss">
@import '@/assets/css/button.scss';
@import '@/assets/css/blank-slate.scss';
@import '@/assets/css/s-plugins-list.scss';
@import '@/assets/css/w-plugin.scss';
</style>
