<template>
  <div class="chat-box">
    <div class="heard">
      <h2 class="title">聊天室</h2>
      <div class="user">当前用户：{{ userName }}</div>
    </div>
    <div class="flex-contain">
      <div class="Message-contain">
        <div class="Message-left">
          <template v-for="item in messageBox[activeInfo.userName]">
            <div
              :class="[
                item.fromUsername === userName ? 'selfMessage' : 'otherMessage',
              ]"
            >
              <span class="messageitem">
                {{ item.msg }}
              </span>
            </div>
          </template>
        </div>
        <div class="Message-right">
          <ul class="userList">
            <template v-for="item in userList">
              <li
                v-if="userName !== item.username"
                class="userItem"
                @click="changUser(item)"
                :class="{ active: item.id == activeInfo.userId }"
              >
                {{ item.username }}
              </li>
            </template>
          </ul>
        </div>
      </div>
      <div class="send-contain">
        <input
          class="messageinput"
          v-model="activeInfo.Message"
          placeholder="请输入聊天内容"
          type="text"
        />
        <button class="sendbtn" @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { io } from "socket.io-client";
import { reactive, ref } from "vue";

const route = useRoute();
// 通过url获取当前用户名
const userName = route.query.username;
// 存储当前在线人员
const userList = ref();
// 存储聊天记录
const messageBox = reactive({});
// 存储当前对话信息
const activeInfo = reactive({
  userId: "",
  userName: "",
  Message: "",
});

// 开始建立连接
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  query: {
    username: userName,
  },
});

// 获取在线人员信息
socket.on("online", (data) => {
  userList.value = data.userList;
});

socket.on("recive", (data) => {
  appendMessage(data, data.fromUsername);
});

// 发送信息
function sendMessage() {
  if (activeInfo.Message === "" || activeInfo.userId === "") return;
  // 将数据存入消息容器中
  appendMessage(
    {
      fromUsername: userName,
      toUsername: activeInfo.userName,
      msg: activeInfo.Message,
      time: new Date().getTime(),
    },
    activeInfo.userName
  );
  // 向服务器发送信息
  socket.emit("sendMessage", {
    fromUsername: userName,
    tragerid: activeInfo.userId,
    msg: activeInfo.Message,
    time: new Date().getTime(),
  });
  activeInfo.Message = "";
}

/* 
  data 获取到的信息数据
  {
      fromUsername: userName,
      toUsername: activeInfo.userName,
      msg: activeInfo.Message,
      time: new Date().getTime(),
  }
  username 对方的用户名字，方便通过取MessageBox通过key取到当前的用户聊天记录
*/
function appendMessage(data: any, username: any) {
  !messageBox[username] && (messageBox[username] = []);
  messageBox[username].push(data);
}

// 选择不同的聊天人员
function changUser(item: any) {
  activeInfo.userId = item.id;
  activeInfo.userName = item.username;
}
</script>

<style lang="scss" scoped>
.chat-box {
  min-width: 620px;
  width: 100%;
  height: 100%;
  .heard {
    position: relative;
    height: 40px;
    line-height: 40px;
    color: var(--theme-font-color);
    border-bottom: 1px solid var(--theme-color);
    text-align: center;
    .user {
      top: 50%;
      left: 10px;
      transform: translate(0px, -50%);
      position: absolute;
    }
  }

  .flex-contain {
    display: flex;
    flex-direction: column;
    height: calc(100% - 41px);
    .Message-contain {
      height: calc(100% - 90px);
      display: flex;
      flex-direction: row;
      .Message-left {
        overflow: auto;
        background: #ddd;
        flex: 1;
        .messageitem {
          display: inline-block;
          margin: 10px;
          padding: 5px;
          max-width: 50%;
          border-radius: 5px;
        }
        .otherMessage {
          span {
            background: #95ec69;
          }
        }
        .selfMessage {
          text-align: right;
          span {
            background: #fff;
          }
        }
      }
      .Message-right {
        border-left: 1px solid var(--theme-color);
        flex: 0 0 150px;
        .userList {
          list-style: none;
          .userItem {
            padding: 5px;
            cursor: pointer;
            border-bottom: 1px solid #ddd;
            &.active {
              background: #4d55f5;
              color: #fff;
            }
          }
        }
      }
    }
    .send-contain {
      height: 90px;
      box-sizing: border-box;
      padding: 10px;
      display: flex;
      border-top: 1px solid var(--theme-color);
      gap: 10px;
      .messageinput {
        flex: 1;
        outline: none;
        border: none;
        padding: 10px;
      }
      .sendbtn {
        background: #535bf2;
        color: #fff;
        border: 1px solid #ddd;
        outline: none;
        &:hover {
          background: #4d55f5;
        }
      }
    }
  }
}
</style>
