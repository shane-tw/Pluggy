<template>
  <b-modal id="authModal" ref="authModal" :title="title" :ok-title="title" @ok="onModalSubmit" @hidden="onModalHidden" @shown="focusFirstInput">
    <b-form ref="authForm" @submit="onFormSubmit">
      <b-form-group v-if="mode === 'register'">
        <b-input-group>
          <b-input-group-prepend is-text>
            <font-awesome-icon icon="user" fixed-width />
          </b-input-group-prepend>
          <b-form-input v-model="form.firstName" type="text" placeholder="First name" aria-label="First name" required />
          <b-form-invalid-feedback>
            Please enter your first name.
          </b-form-invalid-feedback>
        </b-input-group>
      </b-form-group>
      <b-form-group v-if="mode === 'register'">
        <b-input-group>
          <b-input-group-prepend is-text>
            <font-awesome-icon icon="user" fixed-width />
          </b-input-group-prepend>
          <b-form-input v-model="form.lastName" type="text" placeholder="Last name" aria-label="Last name" required />
          <b-form-invalid-feedback>
            Please enter your last name.
          </b-form-invalid-feedback>
        </b-input-group>
      </b-form-group>
      <b-form-group>
        <b-input-group>
          <b-input-group-prepend is-text>
            <font-awesome-icon icon="at" fixed-width />
          </b-input-group-prepend>
          <b-form-input v-model="form.email" type="email" placeholder="Email address" aria-label="Email address" required />
          <b-form-invalid-feedback>
            Please enter your email address.
          </b-form-invalid-feedback>
        </b-input-group>
      </b-form-group>
      <b-form-group>
        <b-input-group>
          <b-input-group-prepend is-text>
            <font-awesome-icon icon="lock" fixed-width />
          </b-input-group-prepend>
          <b-form-input v-model="form.password" type="password" placeholder="Password" aria-label="Password" required />
          <b-form-invalid-feedback>
            Please enter your password.
          </b-form-invalid-feedback>
        </b-input-group>
      </b-form-group>
      <b-button ref="authSubmitBtn" type="submit" v-show="false">Submit</b-button>
    </b-form>
  </b-modal>
</template>

<script src="./Auth.js" />
