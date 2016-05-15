"use strict";

var Game = (function Game(){

	// TODO(4): add a `computerPlayerSkill` variable

	var whoseTurn = 1;	// 0: O
						// 1: X   <--- don't change!

	// coordinates for the board upper-left
	var startBoardX = 50;
	var startBoardY = 50;

	// keeps the moves that have been played
	var gameBoard = [ [], [], [] ];

	// elements from the HTML
	var cnv = document.getElementById("game");
	var ctx = cnv.getContext("2d");

	// TODO(3): get the cat image from the HTML
	// var tieGameImg = ..

	var lastMovesPlayed;
	var movesPlayed;
	var boardSize;
	var boxSize;
	var boxPadding;
	var paddedBoxSize;
	var gridLineSize;
	var movePreviewRow;
	var movePreviewColumn;


	var publicAPI = {
		start: start
	};

	return publicAPI;


	// ****************************

	function start() {
		window.addEventListener( "resize", debounce( onViewportResize, 100 ) );
		document.addEventListener( "mousemove", determineMovePreview );
		document.addEventListener( "click", makeMove );

		onViewportResize();
		setupGame();
		runGame();
	}

	function setupGame() {
		lastMovesPlayed = movesPlayed = 0;

		// set all boxes on the board to empty
		for ( var row = 0; row <= 2; row = row + 1 ) {
			gameBoard[row][0] = gameBoard[row][1] = gameBoard[row][2] = null;
		}
	}

	// called any time the browser window is resized
	function onViewportResize() {
		// keep canvas sized to full viewport
		if (cnv.width != window.innerWidth || cnv.height != window.innerHeight) {
			cnv.width = window.innerWidth;
			cnv.height = window.innerHeight;
		}

		// recalculate dimensions to viewport size
		boardSize = Math.floor( Math.max( 200, Math.min( (cnv.width - startBoardX) * 0.9, (cnv.height - startBoardY) * 0.9 ) ) );
		gridLineSize = Math.max( 5, Math.floor( boardSize / 30 ) );
		boxSize = Math.floor( (boardSize - (2 * gridLineSize)) / 3 );
		boxPadding = Math.max( 10, Math.floor( boxSize / 7 ) );
		paddedBoxSize = boxSize - (2 * boxPadding);
	}

	function runGame() {
		if (movesPlayed > 0) {
			// has a move been played since the last time we
			// checked the board?
			if (movesPlayed != lastMovesPlayed) {
				lastMovesPlayed = movesPlayed;

				var gameWon = false;
				var gameTied = false;

				// TODO(3): first, check for a win, then if
				// there's been at least 6 moves, check for
				// a tie

			}
		}
		else {
			var gameWon = false;
			var gameTied = false;
		}

		drawBoard( gameWon, gameTied );

		// keep the game loop going?
		if (!(gameWon || gameTied)) {
			requestAnimationFrame( runGame );
		}
	}

	function drawBoard(win,gameTied) {
		// clear the canvas
		ctx.fillStyle = "#fff";
		ctx.fillRect( 0, 0, cnv.width, cnv.height );

		drawBoardGrid();
		drawMoves( gameBoard );

		// TODO(3): if a win, draw it. if a tie, draw it.

		if (movePreviewRow != null && movePreviewColumn != null) {
			drawMovePreview( movePreviewRow, movePreviewColumn );
		}
	}

	function drawBoardGrid() {
		var halfLineSize = gridLineSize / 2;
		ctx.save();
		ctx.lineWidth = gridLineSize;

		// draw horizontal grid lines
		for ( var row = 1; row <= 2; row = row + 1 ) {
			var startX = startBoardX;
			var startY = startBoardY + (row * boxSize) + ((row - 1) * gridLineSize) + halfLineSize;
			var endX = startX + (3 * boxSize) + (2 * gridLineSize);
			var endY = startY;

			drawLine( startX, startY, endX, endY );
		}

		// draw vertical grid lines
		for ( var column = 1; column <= 2; column = column + 1 ) {
			var startX = startBoardX + (column * boxSize) + ((column - 1) * gridLineSize) + halfLineSize;
			var startY = startBoardY;
			var endX = startX;
			var endY = startY + (3 * boxSize) + (2 * gridLineSize);

			drawLine( startX, startY, endX, endY );
		}

		ctx.restore();
	}

	function drawMoves(board) {
		for ( var row = 0; row <= 2; row = row + 1 ) {
			for (var column = 0; column <= 2; column = column + 1 ) {
				// 0: o, 1: x
				if (board[row][column] == 0) {
					drawO( row, column );
				}
				else if (board[row][column] == 1) {
					drawX( row, column );
				}
			}
		}
	}

	function drawLine(startX,startY,endX,endY) {
		ctx.beginPath();
		ctx.moveTo( startX, startY );
		ctx.lineTo( endX, endY );
		ctx.stroke();
	}

	function drawX(boxRow,boxColumn) {
		var boxX = calculateBoxX( boxColumn ) + boxPadding;
		var boxY = calculateBoxY( boxRow ) + boxPadding;

		ctx.save();
		ctx.lineWidth = Math.ceil( gridLineSize / 2 );
		ctx.lineCap = "round";

		ctx.beginPath();
		ctx.moveTo( boxX, boxY );
		ctx.lineTo( boxX + paddedBoxSize, boxY + paddedBoxSize );
		ctx.moveTo( boxX + paddedBoxSize, boxY );
		ctx.lineTo( boxX, boxY + paddedBoxSize );
		ctx.stroke();

		ctx.restore();
	}

	function drawO(boxRow,boxColumn) {
		var boxX = calculateBoxX( boxColumn ) + boxPadding;
		var boxY = calculateBoxY( boxRow ) + boxPadding;
		var halfPaddedBoxSize = paddedBoxSize / 2;
		var centerX = boxX + halfPaddedBoxSize;
		var centerY = boxY + halfPaddedBoxSize;

		ctx.save();
		ctx.lineWidth = Math.ceil( gridLineSize / 2 );

		ctx.beginPath();
		ctx.arc( centerX, centerY, halfPaddedBoxSize, 0, 2 * Math.PI );
		ctx.stroke();

		ctx.restore();
	}

	function drawMovePreview(row,column) {
		ctx.save();
		ctx.strokeStyle = "#bbb";

		// 0: o, 1: x
		if (whoseTurn == 0) {
			drawO( row, column );
		}
		else {
			drawX( row, column );
		}

		ctx.restore();
	}

	function drawWin(win) {
		var halfBoxSize = boxSize / 2;
		var halfLineSize = gridLineSize / 2;

		if (win[0] != null && win[1] != null) {
			// minor diagonal?
			if (win[1] == 2) {
				var startX = calculateBoxX( 2 ) + boxSize - halfLineSize;
				var startY = calculateBoxY( 0 ) + halfLineSize;
				var endX = calculateBoxX( 0 ) + halfLineSize;
				var endY = calculateBoxY( 2 ) + boxSize - halfLineSize;
			}
			// major diagonal?
			else if (win[1] == 0) {
				var startX = calculateBoxX( 0 ) + halfLineSize;
				var startY = calculateBoxY( 0 ) + halfLineSize;
				var endX = calculateBoxX( 2 ) + boxSize - halfLineSize;
				var endY = calculateBoxY( 2 ) + boxSize - halfLineSize;
			}
		}
		// row?
		else if (win[0] != null) {
			var startX = calculateBoxX( 0 ) + halfLineSize;
			var startY = calculateBoxY( win[0] ) + halfBoxSize;
			var endX = calculateBoxX( 2 ) + boxSize - halfLineSize;
			var endY = startY;
		}
		// column?
		else if (win[1] != null) {
			var startX = calculateBoxX( win[1] ) + halfBoxSize;
			var startY = calculateBoxY( 0 ) + halfLineSize;
			var endX = startX;
			var endY = calculateBoxY( 2 ) + boxSize - halfLineSize;
		}

		// TODO(3): set up a line that's `gridLineSize` width,
		// rounded cap, blue in color, and 70% opaque
		//
		// then, draw the line using `startX`, `startY`, etc

	}

	function drawTie() {
		var origImgWidth = tieGameImg.width;
		var origImgHeight = tieGameImg.height;
		var ratio = Math.min( (boardSize / 2) / origImgWidth, (boardSize / 2) / origImgHeight );
		var newWidth = Math.floor( origImgWidth * ratio );
		var newHeight = Math.floor( origImgHeight * ratio );
		var x = startBoardX + Math.floor( (boardSize - newWidth) / 2 );
		var y = startBoardY + Math.floor( (boardSize - newHeight) / 2 );

		// TODO(3): set to 80% opacity, then draw the `tieGameImg`
		// cat image using the `x`, `y`, `newWidth`, and `newHeight`
		// variables

	}

	function determineMovePreview(evt) {
		var row = -1;
		var column = -1;

		var x = evt.pageX;
		var y = evt.pageY;
		var row0Y = startBoardY;
		var row1Y = row0Y + boxSize + gridLineSize;
		var row2Y = row1Y + boxSize + gridLineSize;
		var col0X = startBoardX;
		var col1X = col0X + boxSize + gridLineSize;
		var col2X = col1X + boxSize + gridLineSize;

		// which row?
		if (y >= row0Y && y <= (row0Y + boxSize)) {
			row = 0;
		}
		else if (y >= row1Y && y <= (row1Y + boxSize)) {
			row = 1;
		}
		else if (y >= row2Y && y <= (row2Y + boxSize)) {
			row = 2;
		}

		// which column?
		if (x >= col0X && x <= (col0X + boxSize)) {
			column = 0;
		}
		else if (x >= col1X && x <= (col1X + boxSize)) {
			column = 1;
		}
		else if (x >= col2X && x <= (col2X + boxSize)) {
			column = 2;
		}

		// hovering over open space on the board?
		if (row >= 0 && column >= 0 && gameBoard[row][column] == null) {
			movePreviewRow = row;
			movePreviewColumn = column;
		}
		else {
			movePreviewRow = null;
			movePreviewColumn = null;
		}
	}

	function makeMove(evt) {
		determineMovePreview( evt );

		if (movePreviewRow != null && movePreviewColumn != null) {
			movesPlayed = movesPlayed + 1;

			// save the move on the board
			gameBoard[movePreviewRow][movePreviewColumn] = whoseTurn;

			// switch turn to other player
			if (whoseTurn == 0) {
				whoseTurn = 1;
			}
			else {
				whoseTurn = 0;
			}

			// undo previewing for this box
			movePreviewRow = movePreviewColumn = null;

			// TODO(4): let the computer play its move now

		}
	}

	function computerPlayer() {
		// should computer automatically play?
		if (computerPlayerSkill != -1 && movesPlayed < 9 && !checkBoardForWin( gameBoard )) {
			// computer on hard mode?
			if (computerPlayerSkill == 1) {
				// always make the best move
				var makeBestMove = true;
			}
			// computer on easy mode
			else {
				// make the best move only 25% of the time
				var makeBestMove = (Math.random() <= 0.25);
			}

			// should the computer use its best move?
			if (makeBestMove) {

				// TODO(4): have the computer player figure out
				// its next move

				movesPlayed = movesPlayed + 1;
			}
			// just make a move in the first open box
			else {
				for ( var row = 0; row <= 2; row = row + 1 ) {
					for ( var column = 0; column <= 2; column = column + 1 ) {
						// found an empty box?
						if ( gameBoard[row][column] == null) {

							// TODO(4): make a move in this box

							movesPlayed = movesPlayed + 1;

							// stop the loops since we've made our move
							row = column = 3;
						}
					}
				}
			}

			// switch turn back to human player
			if (whoseTurn == 0) {
				whoseTurn = 1;
			}
			else {
				whoseTurn = 0;
			}
		}
	}

	function checkBoardForWin(board) {
		// check rows and columns
		for ( var counter = 0; counter <= 2; counter = counter + 1 ) {
			// check row:counter
			if (board[counter][0] != null && board[counter][0] == board[counter][1] && board[counter][1] == board[counter][2]) {
				return [counter,null];
			}
			// check column:counter
			if (board[0][counter] != null && board[0][counter] == board[1][counter] && board[1][counter] == board[2][counter]) {
				return [null,counter];
			}
		}

		// check major diagonal (top-left to bottom-right)
		if (board[0][0] != null && board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
			return [0,0];
		}

		// check minor diagonal (top-right to bottom-left)
		if (board[0][2] != null && board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
			return [0,2];
		}
	}

	function checkBoardForTie(board,turn) {
		// find the next open (unplayed) box
		for ( var row = 0; row <= 2; row = row + 1 ) {
			for ( var column = 0; column <= 2; column = column + 1 ) {
				// found an open box?
				if (board[row][column] == null) {
					// let's try a move in this open box
					var tmpBoard = copyBoard( board );
					tmpBoard[row][column] = turn;

					// did that move win the board?
					if (checkBoardForWin( tmpBoard )) {
						// obviously not a tie board
						return false;
					}

					// switch turn for next attempted move
					if (turn == 0) {
						var nextTurn = 1;
					}
					else {
						var nextTurn = 0;
					}

					// was a win found after next move?
					if (!checkBoardForTie( tmpBoard, nextTurn )) {
						// not a tie board
						return false;
					}
				}
			}
		}

		// haven't found a win in any path, so must be a tie
		return true;
	}

	function checkBoardForComputerWin(board,win) {
		if (win[0] != null && win[1] != null) {
			// minor diagonal
			if (win[1] == 2) {

				// TODO(4): check if (0,2) is a computer move?

			}
			// major diagonal?
			else if (win[1] == 0) {

				// TODO(4): check if (0,0) is a computer move?

			}
		}
		// row?
		else if (win[0] != null) {

			// TODO(4): check if (row,0) is a computer move?

		}
		// column?
		else if (win[1] != null) {

			// TODO(4): check if (0,column) is a computer move?

		}
	}

	// Adapted from: https://blog.vivekpanyam.com/how-to-build-an-ai-that-wins-the-basics-of-minimax-search/
	//
	// NOTES:
	// (1) The original version of this algorithm uses a different method
	//     of checking for and identifying a win and a tie, so that part
	//     has been changed to adapt to our game's code.
	//
	// (2) The original algorithm assumes false for X and true for 1, but
	//     our game uses the opposite (1 for X, 0 for O). As such, the
	//     'isPlayer' argument has to be passed in as false instead of true
	//     (as in the original code), and also the 'isPlayer' / '!isPlayer'
	//     if-logic in the min/max calculations has been reversed.
	//
	// (3) Added a 'depth' tracking to prevent the tie checker from
	//     needing to recurse too much

	function nextComputerMove(board,isPlayer,movesPlayed) {
		var gameWon = checkBoardForWin( board );

		// has either player won?
		if (gameWon) {
			// computer wins?
			if (checkBoardForComputerWin( board, gameWon )) {
				return [1,board];
			}
			// player wins
			else {
				return [-1,board];
			}
		}
		// has either player tied?
		else if (movesPlayed >= 6 && checkBoardForTie( board, isPlayer ? 1 : 0 )) {
			return [0,board];
		}

		// Next states
		var nextVal = null;
		var nextBoard = null;

		for (var row = 0; row <= 2; row = row + 1) {
			for (var column = 0; column <= 2; column = column + 1) {
				if (board[row][column] == null) {
					board[row][column] = isPlayer ? 1 : 0;
					var value = nextComputerMove( board, !isPlayer, movesPlayed + 1 )[0];
					if (
						(!isPlayer && (nextVal == null || value > nextVal)) ||
						(isPlayer && (nextVal == null || value < nextVal))
					) {
						nextBoard = copyBoard( board );
						nextVal = value;
					}
					board[row][column] = null;
				}
			}
		}

		return [nextVal,nextBoard];
	}

	function calculateBoxX(boxColumn) {
		return startBoardX + (boxColumn * (boxSize + gridLineSize));
	}

	function calculateBoxY(boxRow) {
		return startBoardY + (boxRow * (boxSize + gridLineSize));
	}

	function copyBoard(board) {
		var copy = [];
		for ( var counter = 0; counter < board.length; counter = counter + 1 ) {
			copy.push( board[counter].slice( 0 ) );
		}
		return copy;
	}

	// Adapted from: https://davidwalsh.name/javascript-debounce-function
	function debounce(func,wait,immediate) {
		var timeout;
		return fnDebounced;

		// ******************************

		function fnDebounced() {
			var context = this,
				args = arguments,
				callNow = immediate && !timeout
			;
			clearTimeout(timeout);
			timeout = setTimeout(later,wait);
			if (callNow) {
				func.apply(context,args);
			}

			// ******************************

			function later() {
				timeout = null;
				if (!immediate) {
					func.apply(context,args);
				}
			}
		}
	}

})();
