<template>
  <div id="app" v-loading="generateProgress">
    <div class="progress" v-if="generateProgress">
      <el-progress :percentage="generateProgress" :show-text="false" :stroke-width="14"></el-progress>
      <span class="progress-text">{{generateStatus}}</span>
    </div>
    <img src="./assets/imgs/kuuga-white.png" alt="" class="logo">
    <el-form :model='form' label-width="50px">
      <el-form-item label="URL">
        <el-input v-model="form.url"></el-input>
      </el-form-item>
      <el-form-item label="NAME">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="ICON">
        <label class="uploader" v-if="!form.previewUrl" @dragover.prevent @drop.stop.prevent="onDrop">
          Click or drap a PNG here
          <input type="file" @change="onChange">
        </label>
        <div class="preview" v-if="form.previewUrl">
          <img :src="form.previewUrl" alt="">
          <div class="delete" @click="deleteImage"><i class="el-icon-delete"></i></div>
        </div>
      </el-form-item>
      <el-form-item>
        <div class="btnbox">
          <el-button size="small" @click="close">Close</el-button>
          <el-button type="success" size="small" @click="generateApp" :disabled="!allowGenerate">Generate</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
const { ipcRenderer } = window.require('electron')
const { dialog } = window.require('electron').remote

export default {
  data () {
    return {
      generateProgress: 0,
      generateStatus: '',
      form: {
        url: '',
        name: '',
        previewUrl: ''
      }
    }
  },
  computed: {
    allowGenerate () {
      return !!this.form.url && !!this.form.name && !!this.form.previewUrl
    }
  },
  mounted () {
    ipcRenderer.on('generate-result', (event, msg) => {
      this.generateStatus = msg
      if (/PACK/.test(msg)) {
        this.generateProgress += 20
      } else if (/DONE/.test(msg)) {
        this.generateProgress = 100
        setTimeout(() => {
          this.reset()
        }, 2000)
      }
    })
  },
  methods: {
    onDrop (e) {
      const { path } = e.dataTransfer.files
      this.checkType(e.dataTransfer.files[0])
      this.uploadImg(path)
    },
    onChange (e) {
      const { path } = e.target.files[0]
      this.checkType(e.target.files[0])
      this.uploadImg(path)
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
    uploadImg (path) {
      ipcRenderer.send('uploadImg', path)
    },
    deleteImage () {
      this.form.previewUrl = ''
      ipcRenderer.send('deleteImg')
    },
    generateApp () {
      dialog.showSaveDialog({
        defaultPath: this.form.name
      }, dirPath => {
        if (!dirPath) return
        ipcRenderer.send('generateApp', {
          url: this.form.url,
          name: this.form.name,
          dirPath
        })
      })
    },
    close () {
      ipcRenderer.send('close')
    },
    reset () {
      this.generateProgress = 0
      this.generateStatus = ''
      this.deleteImage()
      this.form = {
        name: '',
        url: '',
        previewUrl: ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
#app {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background: #000;
  .progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 3000;
    &-text {
      position: absolute;
      top: 1px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      color: #303133;
    }
  }
  .logo {
    display: block;
    width: 55px;
    height: 55px;
    margin: 0 auto 15px auto;
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
}
</style>
