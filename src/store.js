import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    showEditor: false
  },
  mutations: {
    TOOGLE_EDITOR (_state, val) {
      _state.showEditor = val
    }
  }
})
