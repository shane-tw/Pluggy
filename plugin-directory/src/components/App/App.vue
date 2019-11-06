<template>
  <div id="app" class="d-flex flex-column" tabindex="-1">
    <template v-if="doneLoginCheck">
      <Navbar />
      <div class="container flex-grow-1" id="content">
        <router-view />
      </div>
    </template>
    <div v-else-if="initedPlugin && !siteKnown" class="container flex-grow-1" id="content">
      <h1>Almost There</h1>
      <p>The config plugin needs to know what site it is dealing with. Please fill out the form below.</p>
      <b-form @submit="onFormSubmit">
        <b-form-group>
          <b-input-group>
            <b-form-input v-model="form.name" type="text" placeholder="Site name" aria-label="Site name" required />
            <b-form-invalid-feedback>
              Please enter your site's name.
            </b-form-invalid-feedback>
          </b-input-group>
        </b-form-group>
        <b-button ref="pluginSubmitBtn" type="submit">Submit</b-button>
      </b-form>
      <div v-if="newSite != null">
        <p>Site registered successfully! For this plugin to work, you must paste this code on your site:</p>
        <code>plug.siteId = {{ newSite.id }};</code>
        <p>If you refresh the page after doing this, the config plugin will show more options.</p>
      </div>
    </div>
  </div>
</template>

<script src="./App.js" />

<style>
@import '~bootstrap/dist/css/bootstrap.min.css';
@import '~bootstrap-vue/dist/bootstrap-vue.min.css';

#content {
  color: #2c3e50;
  background-color: #ebeaeb;
}

#app {
  min-height: 100vh;
  background-color: #e6e4e6;
}
</style>
