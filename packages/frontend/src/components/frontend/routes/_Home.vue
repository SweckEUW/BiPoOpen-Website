<script setup lang="ts">
import { ref } from 'vue';

var end = new Date(2024,5,29,14);

var _second = 1000;
var _minute = _second * 60;
var _hour = _minute * 60;
var _day = _hour * 24;

let countdownOver = ref(false);

let daysRef = ref(0);
let hoursRef = ref(0);
let minutesRef = ref(0);
let secondsRef = ref(0);

const updateRemainingTime = () => {
    var now = new Date();
    var distance = end.getTime() - now.getTime();
    if (distance < 0) {
        clearInterval(timer);
        countdownOver.value = true;
        return;
    }

    var days = Math.floor(distance / _day);
    var hours = Math.floor((distance % _day) / _hour);
    var minutes = Math.floor((distance % _hour) / _minute);
    var seconds = Math.floor((distance % _minute) / _second);

    daysRef.value = days;
    hoursRef.value = hours;
    minutesRef.value = minutes;
    secondsRef.value = seconds;
}
updateRemainingTime();
var timer = setInterval(updateRemainingTime, 1000);

// let shareWhatsappText = "Weck BiPo Open 2024 🌟 findet am Samstag den *29.06.2024* um *14:00 Uhr* statt 💥! Es sind noch " + daysRef.value + " Tage " + + hoursRef.value + " Stunden " + + minutesRef.value + " Minuten " + + secondsRef.value + " Sekunden bis zum Turnierstart⏰! Willst du mein Teampartner💑 sein?"
</script>

<template>
    <div class="Home">
        <h1 class="ho-title-1">BiPo Open 2024</h1>

        <div v-if="!countdownOver">
            <h1 class="ho-title-2">Samstag 29.06.2024 - 14:00 Uhr</h1>

            <div class="ho-timer">
                <div class="ho-time">
                    <div>{{ daysRef }}</div>
                    <div>Tage</div>
                </div>
                <div class="ho-timer-break">:</div>
                <div class="ho-time">
                    <div>{{ hoursRef }}</div>
                    <div>Stunden</div>
                </div>
                <div class="ho-timer-break">:</div>
                <div class="ho-time">
                    <div>{{ minutesRef }}</div>
                    <div>Minuten</div>
                </div>  
                <div class="ho-timer-break">:</div>
                <div class="ho-time">
                    <div>{{ secondsRef }}</div>
                    <div>Sekunden</div>
                </div>  
            </div>

            <div class="ho-share-container">
                <router-link class="ho-share" :to="'/2024/Teams'">Teilnehmende Teams</router-link>
            </div>

        </div>

        <div v-if="countdownOver" class="ho-links">
            <router-link class="ho-share" :to="'/2024/Platzierungen'">Platzierungen</router-link>
            <router-link class="ho-share" :to="'/2024/Spielplan'">Spielplan</router-link>
            <router-link class="ho-share" :to="'/2024/MVP'">MVP-Tabelle</router-link>
            <router-link class="ho-share" :to="'/2024/Fotos'">Fotos</router-link>
        </div>

        <!-- Share via Whatsapp -->
        <!-- <div class="ho-share">
            <a :href="'whatsapp://send?text=' + shareWhatsappText" data-action="share/whatsapp/share">Share via Whatsapp</a>
        </div> -->

        <!-- Anmeldung -->
        <!-- <router-link class="ho-share" :to="'/Teamanmeldung'">Anmeldung</router-link> -->


    </div>
</template>

<style scoped>
.Home{
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
.ho-title-1{
    color: var(--main-color);
    font-size: 100px;
    margin-bottom: 60px;
    margin-top: 50px;
}
.ho-title-2{
    color: var(--main-color);
    font-size: 40px;
    margin-bottom: 0px;
    text-align: center;
}
.ho-timer{
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
}
.ho-time div:nth-child(2){
    color: var(--secondary-color);
    font-size: 25px;
}
.ho-time div:nth-child(1), .ho-timer-break{
    font-size: 40px;
    color: var(--secondary-color);
}
.ho-time{
    display: inline-block;
    margin: 20px;
    text-align: center;
    width: 120px;
}
.ho-share-container{
    width: 100%;
    display: flex;
    justify-content: center;
}
.ho-share{
    margin-top: 30px;
    padding: 20px 40px;
    background-color: var(--main-color);
    cursor: pointer;
    color: white;
    text-decoration: none;
    text-align: center;
}
.ho-links{
    width: 90%;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
.ho-links .ho-share{
    margin-top: 10px;
    width: 100%;
}

/*MOBILE*/
@media (width <= 900px){
    .ho-title-1{
        font-size: 45px;
        margin-bottom: 30px;
        margin-top: 100px;
    }
    .ho-title-2{
        font-size: 22px;
    }
    .ho-time div:nth-child(2){
        font-size: 14px;
    }
    .ho-time div:nth-child(1), .ho-timer-break{
        font-size: 26px;
    }
    .ho-time{
        width: 60px;
        margin: 10px;
        margin-top: 5px;
    }
}

/*MOBILE S*/
@media (width <= 360px){
    .ho-title-1{
        font-size: 40px;
    }
    .ho-title-2{
        font-size: 20px;
    }
}
</style>
