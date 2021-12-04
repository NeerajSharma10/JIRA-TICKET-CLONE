let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");

let colors = ["lightpink","lightblue","lightgreen","lightblack" ];
let modalPriorityColor = colors[colors.length-1];

let toolBoxColors = document.querySelectorAll('.color');

let allPriorityColors = document.querySelectorAll('.priority-colors');

let ticketArr = []; //will store all the tickets in the form of an object 

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open"; //only toggle the class




//if user switch off the website then localstorage will us
//to retrieve the data ie the tickets

if(localStorage.getItem("jira_tickets")){
	ticketArr = JSON.parse(localStorage.getItem("jira_tickets"));
	ticketArr.forEach((ticketObj) => {
		createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
	})
}






//for filtering 

for(let i=0;i<toolBoxColors.length;i++){
	toolBoxColors[i].addEventListener('click',(e) => {
		let currentToolBoxColor = toolBoxColors[i].classList[1];
		
		let filteredtickets = ticketArr.filter((ticketObj,idx) => {
			return currentToolBoxColor === ticketObj.ticketColor;
		});

		// first deleting all the Previous tickets

		let allTicketsCont = document.querySelectorAll('.ticket-cont');
		for(let i=0;i<allTicketsCont.length;i++){
			allTicketsCont[i].remove();
		}

		//Display new filtered tickets

		filteredtickets.forEach((ticketObj,idx) => {
			createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
		})


	})
	//when we doubleclick of any of the color then it should show all the tickets
	toolBoxColors[i].addEventListener("dblclick",(e) => {
		// first deleting all the Previous tickets

		let allTicketsCont = document.querySelectorAll('.ticket-cont');
		for(let i=0;i<allTicketsCont.length;i++){
			allTicketsCont[i].remove();
		}
		//Display all the tickets

		ticketArr.forEach((ticketObj,idx) => {
			createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
		})

	})
}


// Listener for modal priority coloring 
allPriorityColors.forEach((colorElem,idx) => {
	colorElem.addEventListener('click',(e) => {
		//first clear the border for all priority colors
		allPriorityColors.forEach((priorityColorElem,idx) => {
			priorityColorElem.classList.remove("border");
		})
		colorElem.classList.add("border");
		modalPriorityColor = colorElem.classList[0];
	})
})


//for every time we click to add button it should display the modal if we click it again then it should disappear

addBtn.addEventListener('click',()=>{
	// Display Modal
	// Generate Ticket

	//Addflag -> true Modal Display
	//Addflag -> false Modal none
	addFlag = !addFlag;
	if(addFlag){
		modalCont.style.display = "flex";
	}else{
		modalCont.style.display = "none";
	}
})


removeBtn.addEventListener('click',(e) => {
	removeFlag = !removeFlag;
	console.log(removeFlag);
})


//Whenever a user presses Shift key then the ticket should be generated
//and the modal shoul disappear

modalCont.addEventListener('keydown',(e) => {
	let key = e.key;
	if(key === "Shift"){
		createTicket(modalPriorityColor,textareaCont.value);
		textareaCont.value = "";
		setModalToDefault();
	}
})


// function to create a ticket dynamically

function createTicket(ticketColor,ticketTask,ticketID){
	//checkng whther the ticket is new or repeated
	let id = ticketID || shortid();

	let ticketCont = document.createElement('div');
	ticketCont.setAttribute("class","ticket-cont");
	ticketCont.innerHTML = `
			<div class="ticket-color ${ticketColor}"></div>
			<div class="ticket-id">#${id}</div>
			<div class="task-area">${ticketTask}</div>
			<div class="ticket-lock">
				<i class="fas fa-lock"></i>	
			</div>
	`;

	mainCont.appendChild(ticketCont);
	
	//Create object of a ticket and add to the tikcetArr;
	//or to remove duplicacy which is comping for filtered function
	if(!ticketID){

		ticketArr.push({ticketColor,ticketTask,ticketID:id}); 
		localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));	
	}

	handleRemoval(ticketCont,id);
	handleLock(ticketCont,id);
	handleColor(ticketCont,id);
}

function handleColor(ticket,id) {
	let ticketColor = ticket.querySelector('.ticket-color');
	
	ticketColor.addEventListener('click',(e) => {
		//get ticketsidx from the tickets array
		let ticketIdx = getTicketIdx(id);
		let curentTicketColor = ticketColor.classList[1];
		//Get ticket color index
		let currentTicketColoridx = colors.findIndex((color) => {
			if(curentTicketColor === color){
				return true;
			}
		});

		currentTicketColoridx++;
		//avoiding index out of bound problem
		let newTicketColoridx = currentTicketColoridx%colors.length;
		let newTicketColor = colors[newTicketColoridx];
		ticketColor.classList.remove(curentTicketColor);
		ticketColor.classList.add(newTicketColor);

		//Modify data in localstorage and priority color change
		ticketArr[ticketIdx].ticketColor = newTicketColor;
		localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));

	})

}


//
function getTicketIdx(id) {
	let ticketIdx = ticketArr.findIndex((ticketObj) => {
		return ticketObj.ticketID === id;
	})
	return ticketIdx;
}

function handleLock(ticket,id){
	let ticketLockElem = ticket.querySelector('.ticket-lock');
	let ticketLock = ticketLockElem.children[0];
	let tickettaskArea = ticket.querySelector('.task-area');
	ticketLock.addEventListener('click',(e) => {
		let ticketIdx = getTicketIdx(id);
		if(ticketLock.classList.contains(lockClass)){
			ticketLock.classList.remove(lockClass);
			ticketLock.classList.add(unlockClass);
			//special attribute of an element which enables the editing when becomes true
			tickettaskArea.setAttribute('contenteditable',"true");
		}else{
			ticketLock.classList.remove(unlockClass);
			ticketLock.classList.add(lockClass);
			tickettaskArea.setAttribute('contenteditable',"false");
		}

		// Modify data in localStorage (TicketTask)
		ticketArr[ticketIdx].ticketTask = tickettaskArea.innerText;
		localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));

	})
}

function handleRemoval(ticket,id) {
	//removeFlag -> true -> remove
	console.log(removeFlag);
	ticket.addEventListener('click',(e) => {
		if(!removeFlag) return;
		console.log("hell");
		let idx = getTicketIdx(id);
		//it will remove 1  ticket from idx 
		ticketArr.splice(idx,1);
		let strTicketsArr = JSON.stringify(ticketArr);
		localStorage.setItem("jira_tickets",strTicketsArr);
		ticket.remove(); //UI removal
		
	})
	
}


//Setting the priority colors in modal to default as we have made the black on
//as the default one 
function setModalToDefault(){
	modalPriorityColor = colors[colors.length-1];
	modalCont.style.display = "none";
	addFlag = false;
	allPriorityColors.forEach((priorityColorElem,idx) => {
			priorityColorElem.classList.remove("border");
	});
	allPriorityColors[allPriorityColors.length-1].classList.add("border");
}


