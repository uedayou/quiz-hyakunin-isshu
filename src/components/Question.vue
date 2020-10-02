<template>
  <v-container>
    <v-row dense v-show="!loading">
      <v-col cols="12">
        <v-card>
          <v-list-item>
            <v-list-item-content>
              <div class="overline mb-4">
                {{ quiz && '問題'+quiz.index }}
              </div>
              <v-list-item-title class="headline mb-1" style="white-space: normal;">
                {{ quiz && getKarutaTextByCurrentTime(quiz.answer.karuta.value) }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-row justify="center">
          <v-col
            cols="auto"
          >
            <v-progress-circular
              rotate="-90"
              size="100"
              :value="100-Math.floor(currentTime)/startTime*100"
              width="10"
              :color="getTimerColor()"
            >
            <span class="currentTime">
              {{ Math.floor(currentTime) }}
            </span>
            </v-progress-circular>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-list-item>
            <div class="overline mb-4">
              解答
            </div>
          </v-list-item>
          <v-list-item>
            <div class="overline mb-4">
              以下の画像をひとつ選択して解答ボタンを押してください。
            </div>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-btn-toggle
                v-model="select" style="width:100%;">
                <v-row justify="center">
                  <v-col 
                    :cols="$vuetify.breakpoint.mobile ? 6 : 3"
                    class="col-answer"
                    v-for="(candidate,i) in quiz?quiz.candidates:[]"
                    :key="i"
                    :ref="'cand-'+i"
                  >
                    <v-btn :style="{backgroundImage: 'url(' + candidate.image.value + ')', backgroundSize: 'cover', width: '100%', height: getHeightFromIiifUrl(candidate.image.value, 'cand-'+i)+'px'}" class="btn-answer title" active-class="btn-answer-active">
                    </v-btn>
                  </v-col>
                </v-row>
              </v-btn-toggle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-row justify="center">
                <v-col cols="auto">
                  <v-btn 
                    :disabled="select == null || currentTime <= 0"
                    depressed large color="primary"
                    @click="complete">
                    解答する
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline justify-center">
          解答終了
        </v-card-title>
        <v-spacer></v-spacer>
        <v-card-actions class="justify-center">
          <v-btn depressed large color="primary" @click="goAnswerPage">
            正解は？
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-overlay v-show="loading">
      <v-progress-circular
        indeterminate
        color="white">
      </v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
export default {
  name: 'Question',
  data: () => ({
    loading: false,
    answer: null,
    line: null,
    quiz: null,
    candidates: null,
    stations: null,
    timerObj: null,
    displayTime: 5,
    startTime: 30,
    currentTime: 0,
    dialog: false,
    select: null,
  }),
  mounted: function() {
    if (this.$route.params.id) {
      this.startTime = this.$store.getters.getAnswerTime;
      this.getQuiz(this.$route.params.id);
    }
  },
  methods: {
    getQuiz: async function(id) {
      this.loading = true;
      this.quiz = this.$store.getters.getQuizById(id);
      if (!this.quiz) {
        alert("Error!");
        this.$router.replace({ name: "top" });
        return;
      }
      this.loading = false;
      this.currentTime = this.startTime;
      this.start();
    },
    count: function() {
      if(Math.floor(this.currentTime) <= 0) {
        this.complete();
      } else {
        this.currentTime -= 0.2;
        if (this.currentTime < 0) this.currentTime = 0;
      }
    },
    start: function() {
      this.timerObj = setInterval(()=>{this.count()}, 200)
    },
    stop: function() {
      clearInterval(this.timerObj);
    },
    complete: function() {
      this.stop();
      this.setResult();
      this.dialog = true;
    },
    getKarutaTextByCurrentTime: function(text) {
      if (text.length>Math.floor(this.startTime*3-this.currentTime*3))
        return text.substring(0, Math.floor(this.startTime*3-this.currentTime*3));
      return text;
    },
    goAnswerPage: function() {
      this.dialog = false;
      this.$router.replace({
        name: "answer",
        params: {
          id: this.$route.params.id
        }
      });
    },
    setResult: function() {
      const select = this.quiz.candidates[this.select]||null;
      this.$store.commit("setResult", {
        ...this.quiz,
        candidates: this.candidates,
        select,
        correct: select===this.quiz.answer,
        time: this.startTime-Math.floor(this.currentTime),
      });
    },
    getRestTime: function(number) {
      const time = this.startTime-this.displayTime*number;
      return this.currentTime-time;
    },
    getQuestionItem: function(number) {
      if (this.candidates == null) return "";
      const time = this.getRestTime(number);
      if (time>0) {
        return time+"秒後";
      }
      return this.candidates[number];
    },
    getTimerColor: function() {
      const time = this.startTime/4;
      if (this.currentTime<=time) {
        return "red";
      } else if (this.currentTime<=time*2) {
        return "yellow";
      }
      return "green";
    },
    getHeightFromIiifUrl: function(url, id) {
      if (!this.$refs[id]) {
        return 0;
      }
      const width = this.$refs[id][0].clientWidth-24;
      const regex = /\/\d+?,\d+?,(\d+)?,(\d+)?\//;
      const found = url.match(regex);
      if (found?.length<=1) return 0;
      return found[2]*width/found[1];
    }
  }
}

</script>

<style>
.text-align-center {
  text-align:center
}
.font-color-gray {
  color:#ccc
}
.btn-answer {
  width:100%;
  background-color:white !important;
}
.theme--light.v-btn-toggle:not(.v-btn-toggle--group) .v-btn.btn-answer-active {
  border: 4px solid red !important;
}
.btn-answer:before,
.v-btn:not(.v-btn--text):not(.v-btn--outlined):hover:before,
.theme--light.v-btn-toggle:not(.v-btn-toggle--group) .v-btn.btn-answer-active:before {
  opacity: 0;
}


.col-answer {
  margin:0;
}
.currentTime {
  font-size:36px;
}
</style>