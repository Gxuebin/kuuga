<template>
  <div id="app">
    <div class="list">
      <div
        class="list-item"
        :class="{'active': activeIndex === index}"
        v-for="(app, index) in appList"
        :key="index"
        @click="activeApp(index)"
        @mouseenter="activeApp(index, false)">
        <el-tooltip :content="app.name" placement="right" effect="light">
          <img :src="[app.previewUrl ? app.previewUrl : require('./assets/imgs/kuuga.png')]" alt="">
        </el-tooltip>
      </div>
      <div
        class="list-item create"
        @mouseenter="activeApp('', false)">
        <el-tooltip content="Create new" placement="right" effect="light">
          <i class="el-icon-plus"></i>
        </el-tooltip>
      </div>
    </div>
    <div class="content">
      <el-badge class="logo" :value="!versionMatch && latestVersion">
        <img src="./assets/imgs/kuuga-white.png" :class="{'enable': !versionMatch}" @click="updateVersion">
      </el-badge>
      <el-form :model='form' label-width="55px" label-position="left">
        <el-form-item label="URL" :required="true">
          <el-input v-model="form.url"></el-input>
        </el-form-item>
        <el-form-item label="NAME" :required="true">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item>
          <label class="uploader" v-if="!form.previewUrl" @dragover.prevent @drop.stop.prevent="onDrop">
            Drop a PNG or click here to set an icon
            <input type="file" @change="onChange">
          </label>
          <div class="preview" v-if="form.previewUrl">
            <img :src="form.previewUrl" alt="">
            <div class="delete" @click="deleteAppIcon"><i class="el-icon-delete"></i></div>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="btnbox">
            <el-button type="danger" size="small" @click="deleteApp" v-if="activeIndex !== ''">Delete</el-button>
            <el-button type="primary" size="small" @click="updateApp" v-if="activeIndex !== ''">Update</el-button>
            <el-button type="success" size="small" v-if="activeIndex === ''" @click="createApp" :disabled="!allowcreate">Create</el-button>
          </div>
        </el-form-item>
      </el-form>
      <span class="version">{{currentVersion}}</span>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require('electron')

export default {
  data () {
    return {
      form: {
        url: '',
        name: '',
        previewUrl: '',
        iconPath: ''
      },
      versionMatch: true,
      currentVersion: '',
      latestVersion: '',
      activeIndex: '',
      appList: []
    }
  },
  computed: {
    allowcreate () {
      return !!this.form.url && !!this.form.name
    }
  },
  mounted () {
    const storeList = localStorage.getItem('appList') || '[]'
    this.appList = JSON.parse(storeList)

    // const res = ipcRenderer.sendSync('check-update')
    // this.versionMatch = res.match
    // this.currentVersion = 'v.' + res.currentVersion
    // this.latestVersion = 'v.' + res.latestVersion
  },
  methods: {
    onDrop (e) {
      const { path } = e.dataTransfer.files
      this.checkType(e.dataTransfer.files[0])
      this.setAppIcon(path)
    },
    onChange (e) {
      const { path } = e.target.files[0]
      this.checkType(e.target.files[0])
      this.setAppIcon(path)
    },
    checkType (file) {
      if (file.type !== 'image/png') {
        this.$message({
          message: 'TypeError! Only type "image/png" was allowed!',
          type: 'error'
        })
        return false
      } else {
        const reader = new FileReader()
        const vm = this

        reader.onload = function (e) {
          vm.form.previewUrl = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    setAppIcon (path) {
      this.form.iconPath = path
    },
    deleteAppIcon () {
      this.form.previewUrl = ''
      this.form.iconPath = ''
    },
    createApp () {
      ipcRenderer.send('createApp', this.form)
      this.appList.push(this.form)
      localStorage.setItem('appList', JSON.stringify(this.appList))
      this.reset()
    },
    updateVersion () {
      if (!this.versionMatch) {
        ipcRenderer.send('update-version')
      }
    },
    activeApp (index, active = true) {
      this.activeIndex = index
      if (index !== '') {
        this.form = this.appList[index]
      } else {
        this.reset()
      }
      if (active) {
        ipcRenderer.send('createApp', this.form)
      }
    },
    deleteApp () {
      ipcRenderer.send('deleteApp', this.appList[this.activeIndex].name)
      this.appList.splice(this.activeIndex, 1)
      localStorage.setItem('appList', JSON.stringify(this.appList))
      this.reset()
    },
    updateApp () {
      this.appList[this.activeIndex] = this.form
      localStorage.setItem('appList', JSON.stringify(this.appList))
    },
    close () {
      ipcRenderer.send('close')
    },
    reset () {
      this.form = {
        name: '',
        url: '',
        previewUrl: '',
        iconPath: ''
      }
      this.activeIndex = ''
    }
  }
}
</script>

<style lang="less" scoped>
#app {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #1c313a;
  display: flex;
  .list {
    width: 55px;
    height: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: scroll;
    border-right: 2px solid #718792;
    background: #1c313a;
    padding-bottom: 15px;
    &-item {
      width: 40px;
      height: 40px;
      margin: 15px auto 0 auto;
      border: 2px solid #fff;
      box-sizing: border-box;
      border-radius: 40px;
      overflow: hidden;
      cursor: pointer;
      &.active {
        border-color: #67C23A;
        border-width: 4px;
      }
      &.create {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 24px;
      }
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .content {
    padding: 15px;
    flex: 1;
    .logo {
      display: block;
      width: 55px;
      height: 55px;
      margin: 0 auto 15px auto;
      transform: translateX(-28px);
      img {
        width: 100%;
        height: 100%;
        &.enable {
          cursor: pointer;
        }
      }
    }
    .preview {
      width: 80px;
      height: 80px;
      position: relative;
      overflow: hidden;
      background: #fff;
      cursor: pointer;
      img {
        object-fit: cover;
        height: 100%;
        width: 100%;
      }
      .delete {
        position: absolute;
        top: 80px;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 28px;
        color: #fff;
        transition: all .3s ease;
      }
      &:hover {
        .delete {
          transform: translateY(-80px);
        }
      }
    }
    .uploader {
      display: block;
      width: 100%;
      height: 80px;
      line-height: 70px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      border: 5px dotted #eee;
      box-sizing: border-box;
      color: #fff;
      cursor: pointer;
      input[type="file"] {
        position: absolute;
        opacity: 0;
        z-index: -100;
      }
    }
    .btnbox {
      display: flex;
      justify-content: flex-end;
    }
    .version {
      position: absolute;
      top: 15px;
      right: 15px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
