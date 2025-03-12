//用户名正则匹配
export function ruleName(rule, value, callback) {
    //请输入5-15位用户名
    let reg = /^[a-zA-Z0-9_-]{5,15}$/
    if (value === "") {
        callback(new Error("请输入用户名"));
    } else if (!reg.test(value)) {
        callback(new Error("请输入5-15位的用户名"));
    } else {
        callback();
    }
}
//密码正则匹配
export function rulePassword(rule, value, callback) {
    //请输入密码，必须至少包含大、小写字母、数字、特殊字符的两种，长度在8-16之间
    let pass = /^[a-zA-Z0-9_-]{5,16}$/
    if (value === "") {
        callback(new Error("请输入密码"));
    } else if (!pass.test(value)) {
        callback(new Error("请输入5-16位密码"));
    } else {
        callback();
    }
}