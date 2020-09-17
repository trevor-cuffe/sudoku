import express from "express";
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
	res.render("sudoku");
});

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`serving on port ${port}`)
});