<template>
	<div class="AppFooter">
		<p>@2023 Simon Weck</p>
		<p>|</p>
		<router-link to="/Imprint" class="af-link">Imprint/Privacy Policy</router-link>
	</div>
</template>

<style scoped>
.AppFooter{
	width: 100%;
	text-align: center;
	color: gray;
	padding: 20px;
	display: flex;
	justify-content: center;
}
p, .af-link{
	display: inline-block;
	margin: auto 4px;
	font-size: 14px;
}
.af-link{
	cursor: pointer;
	transition: .3s color ease;
}
.af-link:hover{
	color: rgb(211, 211, 211);
}
/*MOBILE*/
@media (width <= 900px){
	p, .af-link{
		font-size: 12px !important;
	}
}
</style>