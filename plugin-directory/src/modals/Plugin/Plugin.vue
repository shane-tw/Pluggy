<template>
  <b-modal id="pluginModal" ref="pluginModal" :title="title" :ok-title="title" @ok="onModalSubmit" @hidden="onModalHidden" @shown="focusFirstInput">
    <b-form ref="pluginForm" @submit="onFormSubmit">
      <b-form-group>
        <b-input-group>
          <b-form-input v-model="form.name" type="text" placeholder="Plugin name" aria-label="Plugin name" required />
          <b-form-invalid-feedback>
            Please enter your plugin name.
          </b-form-invalid-feedback>
        </b-input-group>
      </b-form-group>
      <b-form-group>
        <b-input-group>
          <b-form-textarea v-model="form.description" placeholder="Plugin description" aria-label="Plugin description" required />
          <b-form-invalid-feedback>
            Please enter your plugin description.
          </b-form-invalid-feedback>
        </b-input-group>
      </b-form-group>
      <b-form-group>
        <b-input-group>
          <b-form-file
            ref="pluginUpload"
            v-model="form.file"
            placeholder="Choose plugin archive..."
            drop-placeholder="Drop plugin here..."
            required
          />
        </b-input-group>
      </b-form-group>
      <b-button ref="pluginSubmitBtn" type="submit" v-show="false">Submit</b-button>
    </b-form>
  </b-modal>
</template>

<script src="./Plugin.js" />
