<template>
    <div>
        <footer>
            <span><a target="_blank" href="https://madcoder.io/privacy_policy.html">Policita de privacidad</a></span>
            <span>Support: <a href="mailto:team@madcoder.io">team@madcoder.io</a> | by <a target="_blank" href="https://madcoder.io">madcoder</a></span>
        </footer>
    </div>
</template>

<script>
export default {
    name: "FooterComponent"
}
</script>
<style scoped>
footer {
    display: flex;
    justify-content: space-between;
    margin: auto;
}
footer span {
    margin: 0 0.5rem;
}
</style>
