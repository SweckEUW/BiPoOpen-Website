<template>
    <div class="Teamanmeldung">
        <iframe class="ta-embedded" src="https://docs.google.com/forms/d/e/1FAIpQLSd_rE4p4uug_OoavN_e9OjRYgKQ0Ybsdyo9P2Ar53CmSuD2MA/viewform?embedded=true" frameborder="0" marginheight="0" marginwidth="0">Wird geladen…</iframe>
    </div>
</template>
<style scoped>
.Teamanmeldung{
    display: flex;
    justify-content: center;
    align-content: center;
}
.ta-embedded{
    width: 50%;
    height: calc(100vh - 200px);
}
/*MOBILE*/
@media (width <= 900px){
	.ta-embedded{
        width: 95%;
	}
}
</style>
