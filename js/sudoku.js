const gameTable = document.querySelector(".gameTable");
let selectedCell;

includeFillRange(); //add a custom method to the Array prototype

setUpTable();
fillTable();

document.onkeydown = keyDown;



//*******************************//
//***** Table Setup Methods *****//
//*******************************//


//setup HTML (gameTable)
function setUpTable() {

    console.log("setuptable run");
    //set new row 9x
    for(let i=0; i<9; i++) {
        let row = gameTable.insertRow();
        row.className = "gameRow";

        //set new td 9x
        for (let i=0; i<9; i++) {
            let cell = row.insertCell();
            cell.className = "gameCell";
            cell.addEventListener("click",cellClicked);

            //set cell display
            const displayDiv = document.createElement('div');
            displayDiv.classList.add('cellValue');
            cell.appendChild(displayDiv);
            
            //add span to displayDiv
            const displaySpan = document.createElement('span');
            displaySpan.innerText = "";
            displayDiv.appendChild(displaySpan);

            //set pencil grid
            const pencilGridDiv = document.createElement('div');
            pencilGridDiv.classList.add("pencilGrid");
            cell.appendChild(pencilGridDiv);
            for (let i=0; i<9; i++) {
                const newDiv = document.createElement('div');
                newDiv.classList.add("pencilGridCell", "pencilGridCell" + (i+1));
                pencilGridDiv.appendChild(newDiv);
            }
        }

    }
}


//fill game table with numbers
function fillTable() {

    for(let i=1; i<=9; i++) {

        let numbers = [];
        numbers.fillRange(1,9);

        for(let j=1; j<=9; j++) {
            let index = randInt(0,numbers.length-1)
            setCellValue(i,j,numbers[index]);
            numbers.splice(index,1);
        }
    }

    // //Systematic Pattern
    // for (let i=1; i<=9; i++) {

    //     for (let j=1; j<=9; j++) {
    //         let k = j+2
    //         //equation to set x: 3,6,9,1(+1),4,7,2(+2),5,8
    //         let x = (3*k)%9+Math.floor(3*k/9);
    //         if(i===1) {console.log("j:"+j+" x:"+x);}
    //         setCellValue(j,i,(i+x)%9+1); //this equation offsets the values by 3, wrapping around 9
    //     }
    // }
};

//*******************************//
//*******************************//



//*** Event Listener Methods ***//
function cellClicked() {
    formatRelatedCells(selectedCell); //deselect related cells of previously selected
    selectedCell?.classList?.remove("selectedCell"); //deselect previously selected
    if (this === selectedCell) {selectedCell = null; return} //if selection is same as previous, deselect and break

    selectedCell = this;
    this.classList.add("selectedCell");
    formatRelatedCells(selectedCell);
}

function formatRelatedCells(cell) {
    if (!cell) {return}
    let parentRow = cell.parentNode;
    let row = parentRow.rowIndex;
    let col = cell.cellIndex;

    //Row
    for (i=0; i<9; i++) {
        if (i === col) {continue}
        parentRow.cells[i].classList.toggle('relatedCell');
    }

    //Col
    for (i=0; i<9; i++) {
        if (i === row) {continue}
        gameTable.rows[i].cells[col].classList.toggle('relatedCell');
    }

    //Box
    //3x3 grid (box) index
    boxRowStart = 3*Math.floor(row/3);
    boxColStart = 3*Math.floor(col/3);

    for (i=0; i<3; i++) {
        for (j=0; j<3; j++) {
            if (i === row%3 || j=== col%3) {continue} //skip the rows and columns already formatted
            gameTable.rows[boxRowStart + i].cells[boxColStart + j].classList.toggle('relatedCell');
        }
    }

}

function keyDown(event) {
    if (event.repeat) {return} //prevent repeated keycode press

    let code = event.keyCode;

    if (code >= 49 && code <= 57) { //only num keys 1-9
        let num = code-48; //convert the code directly to the number pressed
        if (selectedCell) {
            selectedCell.querySelector(".cellValue span").innerText = num;
            processErrors(getCellRow(selectedCell), getCellCol(selectedCell));
        }
    } else if (code === 8) { //backspace
        if (selectedCell) {
            clearCell(getCellRow(selectedCell), getCellCol(selectedCell));
        }
    }

}



//*** General Use Methods ***//

function processErrors(row, col) {
    let cell = getCell(row, col)
    let errorCells = checkForErrors(row, col);
    formatError(cell, errorCells);
}


//Check for errors, but do not format them
//Return an array of error cells in format [ {row, col} ]
function checkForErrors(row,col,value=null) {
    const cell = getCell(row,col);
    //error handling
    if (!cell) {return}
    if (value===null) {value = getCellValue(row,col)} //if no value provided, use value of cell


    let errorCells = [];

    //check row & col value
    for (let i=0; i<=8; i++) {
        //use i to iterate through row and column at same time.
        //If checking the value of (row, col), set comparison value to null
        //so that you don't trigger an error by comparing with itself
        let checkRowValue = (i===col) ? null:getCellValue(row,i);
        let checkColValue = (i===row) ? null:getCellValue(i,col);

        if (value === checkRowValue) {
            console.log("cell match error: " + row + ", " + i);
            errorCells.push({"row":row,"col":i});
        }

        if (value === checkColValue) {
            console.log("cell match error: " + i + ", " + col);
            errorCells.push({"row":i,"col":col});
        }
    }

    //check 3x3 grid (box) value
    boxRow = Math.floor(row/3); //0,0,0,1,1,1,2,2,2
    boxCol = Math.floor(col/3); //0,0,0,1,1,1,2,2,2

    for (let i=boxRow*3; i<=boxRow*3+2; i++) {
        for (let j=boxCol*3; j<=boxCol*3+2; j++) {
            let checkBoxValue = (i===row && j===col) ? null:getCellValue(i,j);
            if (value === checkBoxValue) {
                console.log("cell match error: " + i + ", " + j);
                errorCells.push({"row":i,"col":j});
            }
        }
    }

    return errorCells;

}

function formatError(userCell,errorCells) {
    userCell.classList.add("errorValue");
    errorCells.forEach(function(cellIndex) {
        let cell = getCell(cellIndex.row, cellIndex.col);
        cell.classList.add("errorValue");
    })
}


//set cell value: use 1-9, 1-9 input for grid index
function setCellValue(row,col,val) {
    if (val < 0 || val > 8 || !Number.isInteger(val)) {console.log("setCellValue error: unexpected value entered"); return; }

    const cell = getCell(row,col)
    if(cell) {
        cell.querySelector(".cellValue span").innerText = val;
    }
}

//pull value of cell from gameTable
function getCellValue(row,col) {
    const cell = getCell(row,col);
    return Number(cell?.querySelector(".cellValue span").innerText) || null;
}

function clearCell(row,col) {
    const cell = getCell(row,col);
    if(cell) {
        cell.querySelector(".cellValue span").innerText = "";
    }
}

function getCell(row,col) {
    //returns an optional cell (td)
    //includes error handling and adjustment for row and col

    //error handling
    if (!gameTable.rows[row] || !gameTable.rows[row].cells[col]) {console.log("getCell error: cell is outside of table range"); return; }

    return gameTable.rows[row].cells[col];
}

function getCellRow(cell) {
    return cell.parentNode.rowIndex+1;
}

function getCellCol(cell) {
    return cell.cellIndex+1;
}

//Random Integer
function randInt(x,y) {
    let random = Math.random()*(y-x+1) + x;
    random = Math.floor(random);
    return random;
}








//ADD NEW FUNCTION TO ARRAY PROTOTYPE:
function includeFillRange(){
    //fill array with number range
    Array.prototype.fillRange = function(x,y) {
        //error handling - check for integers
        if(!Number.isInteger(x) || !Number.isInteger(y)) {console.log("error: non-integer value passed to Array.fillRange"); return;}

        this.splice(0,this.length);
        for(let i=x; i<=y; i++) {
            this.push(i);
        }
    }
}
