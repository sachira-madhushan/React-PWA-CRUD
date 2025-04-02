export default function swDev() {
    let swUrl = `http://localhost:5173/sw.js`;
    navigator.serviceWorker.register(swUrl).then((response) => {
        console.log("response", response);
    }).catch((error) => {
        console.log("error", error);
    });
}