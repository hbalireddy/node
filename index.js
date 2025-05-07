const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// Port number that server listens to
const PORT = 6084;

const busDetails = async (client) => {
    //Fetches records from given database
    const cursor = await client.db("BusDB").collection("Buses").find({});
    const results = await cursor.toArray();
    return JSON.stringify(results);
}

//Creates HTTP Server(i.e our system acts as server)
http.createServer(async (req, res) => {
    if (req.url === "/api") {
        const URL = "mongodb+srv://hbali2:ASDFasdf%401@buscluster.5gzachd.mongodb.net/?retryWrites=true&w=majority&appName=BusCluster";

        // Creating a new client for connecting to database
        const client = new MongoClient(URL);
        try {
            // Connects to database
            await client.connect();
            console.log("Database is connected sucessfully");
            const busData = await busDetails(client);
            // Handling CORS Issue
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.writeHead(200, { "content-type": "application/json" });
            res.end(busData);
        }
        catch (err) {
            console.error("Error in connecting database", err);
        }
        finally {
            //Closing connection to database
            await client.close();
            console.log("Database connection is closed");
        }
    }
    else {
        console.log(req.url);
        let contentType;
        const filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url.slice(1));
        if (filePath.endsWith(".png")) contentType = "image/png";
        else if (filePath.endsWith(".jpeg") || filePath.endsWith(".jpg")) contentType = "image/jpeg";
        else contentType = "text/html";
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === "ENOENT") {
                    res.writeHead(404, { "content-type": "text/html" });
                    res.end("<h1>404 Page Not Found!</h1>");
                } else {
                    res.writeHead(500, { "content-type": "text/plain" });
                    res.end("Internal Server error");
                }
            } else {
                res.writeHead(200, { "content-type": contentType });
                res.end(content, "utf8");
            }
        });
    }
    
}).listen(PORT, () => console.log(`Server is running on ${PORT}`));