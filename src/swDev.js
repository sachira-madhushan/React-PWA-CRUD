export default function swDev() {
    let swUrl = `https://pwa-offline-mode-test.netlify.app/sw.js`;
    navigator.serviceWorker.register(swUrl).then((response) => {
        console.log("response", response);
    }).catch((error) => {
        console.log("error", error);
    });
}