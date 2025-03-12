import service from "../http/service.js";
import { getToken, removeToken } from "../utils/setToken.js"
//查询所有用户
export function initUsers(root, userName, nick_name, user_name) {
    service.get("/system/user/getAllUsers", {
        params: {
            "userName": userName,
            "nick_name": nick_name || null,
            "user_name": user_name || null
        }
    })
        .then(res => {
            if (res && res.status === 200) {
                if (res.data.resultCode === 200) {
                    root.users = res.data.data
                }
            }
        })
        .catch(error => {
            throw error
        })
}
//获取所有角色信息
export function getAllRoles(root) {
    service.get("/system/role/getAllRoles")
        .then(res => {
            if (res && res.status === 200) {
                if (res.data.resultCode === 200) {
                    root.allroles = res.data.data
                }
            }
        })
        .catch(error => {
            throw error
        })
}
//删除用户
export function deleteUserById(root, id, username) {
    service.get("/system/user/deleteUserById", {
        params: {
            "id": id
        }
    })
        .then(res => {
            if (res && res.status === 200) {
                if (res.data.resultCode === 200) {
                    let userName = getToken("username")
                    initUsers(root, userName)
                    root.$message({
                        type: 'success',
                        message: '已成功删除用户【' + username + '】'
                    });

                }
            }
        })
        .catch(error => {
            throw error
        })
}

//更改用户使用状态
export function updateEnabledById(root, enabled, id, username) {
    service.get("/system/user/updateUserEnabledById", {
        params: {
            "id": id,
            "enabled": enabled
        }
    })
        .then(res => {
            if (res && res.status === 200) {
                if (res.data.resultCode === 200) {
                    root.$message({
                        type: 'success',
                        message: '已成功更改用户【' + username + '】的使用状态'
                    });

                }
            }
        })
        .catch(error => {
            throw error
        })
}

//更改用户的角色
export function updateRolesById(root, id, ids, currentIds) {

    service({
        method: 'put',
        url: "/system/user/updateUserRolesById",
        params: {
            "id": id,
            "ids": ids.join(','),
            "currentIds": currentIds.join(',')
        }
    }).then(res => {
        if (res && res.status === 200) {
            if (res.data.resultCode === 200) {
                let userName = getToken("username")
                initUsers(root, userName)
                root.$message({
                    type: 'success',
                    message: res.data.resultMsg
                });
            }
        }

    }).catch(error => {
        throw error
    })
}


//新增用户
export function addUser(root, user) {
    service({
        method: 'post',
        url: "/system/user/insertUser",
        data: user
    }).then(res => {
        if (res && res.status === 200) {
            if (res.data.resultCode === 200) {
                let userName = getToken("username")
                initUsers(root, userName)
                root.$message({
                    type: 'success',
                    message: res.data.resultMsg
                });
            }
        }

    }).catch(error => {
        throw error
    })
}

//新增用户时用户名验证规则
export async function ruleUserName(rule, value, callback) {
    //请输入5-15位用户名
    let reg = /^[a-zA-Z0-9_-]{5,15}$/
    if (!reg.test(value)) {
        callback(new Error("请输入5-15位的用户名"));
    } else {
        console.log("1111111dddddd", value)
        var userNum = await service({
            method: 'get',
            url: "/system/user/getUserNumByName?username=" + value,
        }).then(res => {
            if (res && res.status === 200) {
                if (res.data.resultCode === 200) {
                    //console.log("res.data.data = ", res.data.data)
                    return res.data.data
                }
            }
        })
            .catch(error => {
                throw error
            })
        console.log("userNum = ", userNum)
        if (userNum > 0) {
            callback(new Error("用户名已存在"));
        } else {
            callback();
        }
    }
}

//新增用户时密码验证规则
export function ruleUserPasswd(rule, value, callback) {
    //请输入密码，必须至少包含大、小写字母、数字、特殊字符的两种，长度在8-16之间
    let pass = /^[a-zA-Z0-9_-]{5,16}$/
    if (!pass.test(value)) {
        callback(new Error("请输入5-16位密码"));
    } else {
        callback();
    }
}

//修改用户信息时用户名验证规则
export async function ruleUpdateUserName(rule, value, callback) {
    //请输入5-15位用户名
    let reg = /^[a-zA-Z0-9_-]{5,15}$/
    if (!reg.test(value)) {
        callback(new Error("请输入5-15位的用户名"));
    } else {
        let currentUserName = getToken("username")
        if (value !== currentUserName) {
            var currentUserNameNum = await service({
                method: 'get',
                url: "/system/user/getUserNumByName?username=" + value,
            }).then(res => {
                if (res && res.status === 200) {
                    if (res.data.resultCode === 200) {
                        //console.log("res.data.data = ", res.data.data)
                        return res.data.data
                    }
                }
            }).catch(error => {
                throw error
            })
            if (currentUserNameNum > 0) {
                callback(new Error("用户名已存在"));
            } else {
                callback();
            }
        } else {
            callback();
        }
    }
}
//修改用户信息时密码验证规则
export async function ruleUpdatePassword(rule, value, callback) {
    let currentUserName = getToken("username")
    var isUserPassword = await service({
        method: 'get',
        url: "/system/user/checkPassword",
        params: {
            "oldPassword": value,
            "username": currentUserName
        }
    }).then(res => {
        if (res && res.status === 200) {
            if (res.data.resultCode === 200) {
                //console.log("res.data.data = ", res.data.data)
                return res.data.data
            }
        }
    }).catch(error => {
        throw error
    })
    if (!isUserPassword) {
        callback(new Error("原密码错误"));
    } else {
        callback();
    }
}
//根据用户名获取用户信息（包括角色信息）
export function getAllUserInfo(root, username) {
    service.get("/system/user/getAllUserInfo", {
        params: {
            "username": username
        }
    })
        .then(res => {
            if (res && res.status === 200) {
                if (res.data.resultCode === 200) {
                    root.user = res.data.data
                }
            }
        })
        .catch(error => {
            throw error
        })
}

//修改用户信息
export function editUserInfo(root, userInfo, username) {
    service({
        method: 'put',
        url: "/system/user/updateUser",
        data: userInfo
    }).then(res => {
        if (res && res.status === 200) {
            if (res.data.resultCode === 200) {
                root.$message({
                    type: 'success',
                    message: res.data.resultMsg
                });
                if (username === userInfo.newUserName && userInfo.oldPassword === userInfo.newPassword) {
                    root.user.nickName = userInfo.newNickName
                    root.user.remark = userInfo.newRemark
                } else {
                    removeToken("username")
                    removeToken("token")
                    root.$store.dispatch("clearRoutes")  //清空VUEX的路由数据
                    //this.$router.resetRouter() //重置路由数据
                    root.$router.replace('/')
                }
            }
        }

    }).catch(error => {
        throw error
    })
}