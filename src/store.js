import Vue from 'vue'
import Vuex from 'vuex'
import { ulid } from 'ulid'
import quizData from './assets/hyakunin-isshu.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nQuiz: 5,
    nCandidate: 6,
    answerTime: 45,
    mode: "normal",
    results: [],
    quizzes: [],
    data: [],
  },
  getters: {
    getMode: state => {
      return state.mode;
    },
    getNumberOfCandidate: state => {
      return state.nCandidate;
    },
    getAnswerTime: state => {
      return state.answerTime;
    },
    getResults: state => {
      if (state.results.length>0 && state.results.length===state.quizzes.length)
        return state.results 
    },
    getQuizzes: state => {
      return state.quizzes;
    },
    getFirstQuiz: (state) => {
      return state.quizzes[0];
    },
    getResultById: (state) => (id) => {
      return state.results.find(r=>r.id === id);
    },
    getQuizById: (state) => (id) => {
      return state.quizzes.find(q=>q.id === id);
    },
    getData: (state) => {
      if (state.data.length==0) {
        let data = quizData.results.bindings;
        data = data.filter(d=>d.image.value.match(/^http/)&&!d.image.value.match(/R0000001/)&&!d.image.value.match(/image\.oml\.city\.osaka\.lg\.jp/));
        data = data.map(d=>{
          const found = d.image.value.match(/\/\d+?,\d+?,(\d+)?,(\d+)?\//);
          if (found?.length>1) {
            d.image.value = d.image.value.replace("/full/", "/300,/");
          }
          return d;
        })
        state.data = data;
      }
      return state.data;
    },
    getNumberOfQuize: (state) => {
      return state.nQuiz;
    },
  },
  mutations: {
    setResult(state, result) {
      state.results.push(result);
    },
    setResults(state, results) {
      state.results = results;
    },
    setQuizzes(state, quizzes) {
      state.quizzes = quizzes;
    },
    setMode(state, mode) {
      state.mode = mode;
      if (mode==="hard") {
        state.nCandidate = 20;
        state.answerTime = 30;
      } else if (mode==="easy") {
        state.nCandidate = 4;
        state.answerTime = 30;
      } else {
        state.nCandidate = 12;
        state.answerTime = 30;
      }
    },
    setNumberOfQuize: (state, number) => {
      state.nQuiz = +number;
    }
  },
  actions: {
    initialize(context) {
      context.commit("setResults", []);
      let quizzes = [];
      let data = shuffle(context.getters.getData);
      data = data.filter((v1,i1,a1) =>
        a1.findIndex(v2 =>
          v1.karuta.value===v2.karuta.value) === i1);
      for (const i of [...Array(context.getters.getNumberOfQuize)]) { // eslint-disable-line no-unused-vars
        let answer = data.shift();
        let candidates = [answer];
        for (let ii=0;ii<context.getters.getNumberOfCandidate-1;ii++) {
          candidates.push(data.shift());
        }
        quizzes.push({ answer, candidates:shuffle(candidates) });
      }
      quizzes.map((quiz,index)=>{
        quiz.id = ulid();
        quiz.index = index+1;
        if (index>0) quizzes[index-1].next = quiz.id;
      })
      context.commit("setQuizzes", quizzes);
    },
  }
})

const shuffle = ([...array]) => {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}