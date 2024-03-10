export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
        const { $toast } = useNuxtApp();
        $toast.errors(error);
        
        console.log("*** ERROR ***");
        console.log("error:", error);
        console.log("instance:", instance);
        console.log("info:", info);
    }
})
