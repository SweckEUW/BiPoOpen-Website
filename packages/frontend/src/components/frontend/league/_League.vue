<template>
    <div class="Liga">
        <h1 class="bp-title">BiPo League</h1>
        <div class="container">
            <img src="@/assets/league/BiPo-League-Logo.png" alt="BiPo League Logo">
            <div>Coming soon</div>
        </div>

    </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.Liga{
    .container{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        div{
            color: var(--main-color);
            font-size: 24px;
        }
    }

    img{
        width: 300px;
        padding: 30px;
        filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.5));
    }
}
</style>