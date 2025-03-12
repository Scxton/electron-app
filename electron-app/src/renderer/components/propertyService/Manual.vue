<template>
    <div class="dashboard">
        <!-- 数据统计卡片 -->
        <div class="stats-cards">
            <el-card>
                <h3>日成果受理总数</h3>
                <p>{{ totalAchievements }}</p>
                <small>than yesterday {{ yesterdayChange }}%</small>
            </el-card>
            <el-card>
                <h3>月成果受理总数</h3>
                <p>{{ monthlyAchievements }}</p>
                <small>month on month {{ monthlyChange }}%</small>
            </el-card>
            <el-card>
                <h3>今日投诉申请数</h3>
                <p>{{ dailyComplaints }}</p>
                <small>than yesterday {{ complaintChange }}%</small>
            </el-card>
        </div>

        <!-- 投诉进度 -->
        <div class="complaint-progress">
            <h3>投诉进度</h3>
            <el-timeline>
                <el-timeline-item v-for="(item, index) in complaintProgress" :key="index" :timestamp="item.time">
                    {{ item.step }}
                </el-timeline-item>
            </el-timeline>
        </div>

        <!-- 系统通知 -->
        <div class="system-notifications">
            <h3>系统通知</h3>
            <ul>
                <li v-for="(message, index) in systemNotifications" :key="index">
                    <p>{{ message.title }}</p>
                    <small>{{ message.time }}</small>
                </li>
            </ul>
        </div>
    </div>
</template>


<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
    name: "Home",
    setup() {
        const totalAchievements = ref(0);
        const monthlyAchievements = ref(0);
        const dailyComplaints = ref(0);
        const yesterdayChange = ref(0);
        const monthlyChange = ref(0);

        const complaintProgress = ref([]);
        const systemNotifications = ref([]);

        // const fetchData = async () => {
        //     try {
        //         // 获取统计数据
        //         const statsResponse = await axios.get("/api/stats");
        //         const stats = statsResponse.data;
        //         totalAchievements.value = stats.totalAchievements;
        //         monthlyAchievements.value = stats.monthlyAchievements;
        //         dailyComplaints.value = stats.dailyComplaints;
        //         yesterdayChange.value = stats.yesterdayChange;
        //         monthlyChange.value = stats.monthlyChange;

        //         // 获取投诉进度
        //         const progressResponse = await axios.get("/api/complaint-progress");
        //         complaintProgress.value = progressResponse.data;

        //         // 获取系统通知
        //         const notificationsResponse = await axios.get("/api/system-notifications");
        //         systemNotifications.value = notificationsResponse.data;
        //     } catch (error) {
        //         console.error("Error fetching data:", error);
        //     }
        // };

        // onMounted(fetchData);

        return {
            totalAchievements,
            monthlyAchievements,
            dailyComplaints,
            yesterdayChange,
            monthlyChange,
            complaintProgress,
            systemNotifications,
        };
    },
};
</script>

<style scoped>
.dashboard {
    padding: 20px;
}

.stats-cards {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
}

.complaint-progress,
.system-notifications {
    margin-top: 20px;
}

.system-notifications ul {
    list-style: none;
    padding: 0;
}

.system-notifications li {
    margin-bottom: 10px;
}
</style>
