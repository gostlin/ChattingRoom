import {createRouter,createWebHistory} from "vue-router"

const router =createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:"/",
            name:"index",
            redirect:"/chatting"
        },
        {
            path:"/chatting",
            name:"chatting",
            component:()=>import("@/pages/chatting.vue")
        }

    ]
})
export default router