import { io } from "socket.io-client";

const URL = "http://localhost:4401/default";
const URL2 = "http://localhost:4402/fbs";
const URL3 = "http://localhost:4402/";

function getHeader() {
    const ds = new Date().toString();
    //console.log("*** getHeader: ", ds);
    return ds;
}

export const socket = io(URL3, {
    extraHeaders: {
        "fbs2": "my string >>>>>>>>>>>>>>",
        //"fbs": getHeader(),
    },
    auth: (cb) => {
        cb({
            //token: window.localStorage.getItem("auth"),
            fbs: getHeader()
        })
    }
});

