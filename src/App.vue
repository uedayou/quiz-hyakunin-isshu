<template>
  <v-app>
    <v-app-bar
      app
      color="orange"
      dark
    >
      <div class="d-flex align-center">
        小倉百人一首クイズ
      </div>
    </v-app-bar>

    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer color="white" outlined>
      <v-spacer></v-spacer>
        <a style="text-decoration:none;color:inherit;margin-right:0.5em;" href="https://uedayou.net/" target="_blank">@uedayou</a> {{ new Date().getFullYear() }}. Some rights reserved.
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data: () => ({
    //
  }),
};
</script>
