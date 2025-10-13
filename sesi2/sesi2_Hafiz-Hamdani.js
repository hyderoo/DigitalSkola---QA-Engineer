//Hafiz Hamdani - Tugas Digital Skola Pertemuan 3

const args = process.argv.slice(2);
const n = parseInt(args[0], 10) || 5;

function segitiga(n) {
    console.log("------------------------");
    for (let i = 1; i <= n; i++) {
        let line = "";
        for (let j = 1; j <= i; j++) {
            line += "*";
        }
        console.log(line);
    }
    console.log("------------------------");
}

segitiga(n);
