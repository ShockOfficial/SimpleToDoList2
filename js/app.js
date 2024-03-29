let $rightBox;
let $leftBox;
let $newTask;
let $mainInput;
let $btnAdd;
let $btnCancel;
let $popup;
let $warningBox;
let $taskCat;

function main() {
	prepareDomElements();
	prepareDomEvents();
  loadDataFromStorage()
}

function prepareDomElements() {
	$rightBox = document.querySelector('.box-right');
	$leftBox = document.querySelector('.box-left');
	$newTask = document.querySelector('.newTask');
	$mainInput = document.querySelector('.box-input');
	$btnAdd = document.querySelector('.btn-add');
	$btnCancel = document.querySelector('.btn-cancel');
	$popup = document.querySelector('.popup');
	$warningBox = document.querySelector('.warning-box');
}

function prepareDomEvents() {
	$btnAdd.addEventListener('click', createTask);
	$mainInput.addEventListener('keyup', (e) => {
		listenEnter(e) ? createTask() : null;
	});
}

function onDragStart(e) {
	e.dataTransfer.setData('text/plain', e.target.id);
}

function onDragOver(e) {
	e.preventDefault();
}

function onDrop(e) {
	const id = e.dataTransfer.getData('text');
	const draggableElement = document.getElementById(id);
	let dropZone = e.target;
	let complete = draggableElement.querySelector('.complete');

	dropZone =
		dropZone.closest('.box-left') !== null
			? dropZone.closest('.box-left')
			: dropZone.closest('.box-right');

	dropZone.append(draggableElement);

	if (dropZone.closest('div').classList.contains('box-right')) {
		draggableElement.classList.add('done');
		complete.classList.add('notComplete');
		draggableElement.classList.remove('cat-A');
		draggableElement.classList.remove('cat-B');
		draggableElement.classList.remove('cat-C');
	} else {
		draggableElement.classList.remove('done');
		draggableElement.classList.add(
			'cat-' + draggableElement.querySelector('.task-cat').innerText,
		);
		complete.classList.remove('notComplete');
		sortTasks();
	}
	e.dataTransfer.clearData();
  saveCurrentState();
}

function createTask(text, category,id, isLeft = true) {
	if ($mainInput.value !== '' || text !== '') {
		let newDiv = document.createElement('div');
		let toolbox = document.createElement('div');
		let catBox = document.createElement('div');
		$taskCat = document.createElement('p');

		toolbox.classList.add('tools');
		newDiv.classList.add('newTask', `cat-${category || "C"}`);
		newDiv.setAttribute('ondragstart', 'onDragStart(event);');
		newDiv.setAttribute('draggable', 'true');
		newDiv.setAttribute('id', id || crypto.randomUUID());
    
		let btnComplete = document.createElement('button');
		btnComplete.classList.add('complete');
		btnComplete.innerHTML =
			'<i class="fas fa-check " aria-hidden="true "> </i>';
		btnComplete.addEventListener('click', makeComplete);

		let btnEdit = document.createElement('button');
		btnEdit.classList.add('edit');
		btnEdit.innerText = 'EDIT';
		btnEdit.addEventListener('click', editTask);

		let btnDelete = document.createElement('button');
		btnDelete.classList.add('delete');
		btnDelete.innerHTML = '<i class="fas fa-times " aria-hidden="true "></i>';
		btnDelete.addEventListener('click', makeDelete);

		let taskText = document.createElement('p');
		taskText.classList.add('task-text');
		taskText.innerText = typeof text === 'string' ? text :  $mainInput.value;

		let btnA = document.createElement('button');
		btnA.innerText = 'A';
		btnA.classList.add('btn-cat', 'type-a');
		btnA.addEventListener('click', setCategory);
		let btnB = document.createElement('button');
		btnB.innerText = 'B';
		btnB.classList.add('btn-cat', 'type-b');
		btnB.addEventListener('click', setCategory);
		let btnC = document.createElement('button');
		btnC.innerText = 'C';
		btnC.classList.add('btn-cat', 'type-c');
		btnC.addEventListener('click', setCategory);

		$taskCat.classList.add('task-cat');
		$taskCat.innerText = category || "C";

		catBox.classList.add('cat-box');
		catBox.append(btnA, btnB, btnC);
		toolbox.append(btnComplete, btnEdit, btnDelete);
		newDiv.append($taskCat, catBox, taskText, toolbox);

    if(isLeft){
  		$leftBox.append(newDiv);
    }else{
      const complete = newDiv.querySelector('.complete');
      newDiv.classList.add('done');
      $rightBox.append(newDiv);
      newDiv.classList.remove('cat-' + newDiv.querySelector('.task-cat').
      innerText);
      complete.classList.add('notComplete');

    }

		$mainInput.value = '';
    saveCurrentState();
	} else {
		displayPopup('Musisz coś wpisać!');
	}
}

function saveCurrentState() {
	localStorage.removeItem('state');
	const activeTasks = Array.from($leftBox.querySelectorAll('div.newTask'));
	const doneTasks = Array.from($rightBox.querySelectorAll('div.newTask.done'));
  
  const data = JSON.stringify(
    {activeTasks: activeTasks.map(item => {
      const text = item.querySelector('p.task-text').innerText
      const category = item.querySelector('p.task-cat').innerText
      return JSON.stringify({text,category,id:item.id})
    }),
    doneTasks: doneTasks.map(item =>  {
      const text = item.querySelector('p.task-text').innerText
      const category = item.querySelector('p.task-cat').innerText
      return JSON.stringify({text,category,id: item.id})
    })})
  localStorage.setItem('state',data);
}

function loadDataFromStorage(){
  const {activeTasks, doneTasks} = JSON.parse(localStorage.getItem('state'))
  activeTasks.forEach((item) => {
    item = JSON.parse(item);
    createTask(item.text,item.category,item.id)
  })

  doneTasks.forEach((item) => {
    item = JSON.parse(item);
    createTask(item.text,item.category,item.id,false);
  })

  sortTasks()

}

function displayPopup(info) {
	let warning = document.querySelector('.warning');
	warning.innerText = info;

	$warningBox.classList.toggle('hide');

	setTimeout(() => {
		$warningBox.classList.toggle('hide');
	}, 3000);
}

function listenEnter(e) {
	if (e.code === 'Enter') {
		return true;
	}
}

function listenEsc(e) {
	if (e.code === 'Escape') {
		$popup.classList.add('hide');
	}
}

function makeComplete(e) {
	let task = e.target.closest('.newTask');
	let complete = task.querySelector('.complete');

	if (!task.classList.contains('done')) {
		complete.classList.add('notComplete');
		task.classList.add('done');
		task.classList.remove('cat-A');
		task.classList.remove('cat-B');
		task.classList.remove('cat-C');
		$rightBox.append(task);
	} else {
		$leftBox.append(task);
		complete.classList.remove('notComplete');
		task.classList.remove('done');
		task.classList.add('cat-' + task.querySelector('.task-cat').innerText);

		sortTasks();
	}
  saveCurrentState();
}

function makeDelete(e) {
	let task = e.target.closest('.newTask');
	task.remove();
  saveCurrentState();
}

function editTask(e) {
	let task = e.target.closest('.newTask');
	let taskText = task.querySelector('.task-text');
	let btnAdd = $popup.querySelector('.btn');
	let btnCancel = $popup.querySelector('.btn-cancel');
	let input = $popup.querySelector('.box-input');

	if (task.parentNode.classList.contains('box-left')) {
		$popup.classList.remove('hide');
		input.value = taskText.innerText;
		input.focus();
		btnAdd.addEventListener('click', () => {
			taskText.innerText = input.value;
			$popup.classList.add('hide');
      saveCurrentState();

		});
		btnCancel.addEventListener('click', () => {
			$popup.classList.add('hide');
      saveCurrentState();

		});

		input.addEventListener('keyup', (e) => {
			listenEsc(e);
			if (listenEnter(e)) {
				taskText.innerText = input.value;
				$popup.classList.add('hide');
        saveCurrentState();

			}
		})

	} else {
		displayPopup('Nie możesz edytować skończonego zadania.');
	}
}

function setCategory(e) {
	let category = e.target.closest('button').innerText;
	let rootTask = e.target.parentNode.parentNode;
	let taskCat = rootTask.querySelector('.task-cat');
	let lastCategory = taskCat.innerText;

	if (!rootTask.closest('.box-right')) {
		taskCat.innerText = category;

		rootTask.classList.remove('cat-' + lastCategory);
		rootTask.classList.add('cat-' + category);
		sortTasks();
    saveCurrentState();
	} else {
		displayPopup('Nie możesz zmieniać kategorii skończonego zadania');
	}
}

function sortTasks() {
	let tasks = document.querySelectorAll('.box-left .newTask');
	let arrC = [];
	let arrB = [];
	let arrA = [];

	for (const task of tasks) {
		if (task.classList[1] === 'cat-C') {
			arrC.push(task);
		} else if (task.classList[1] === 'cat-B') {
			arrB.push(task);
		} else {
			arrA.push(task);
		}
	}

	for (const child of tasks) {
		$leftBox.removeChild(child);
	}

	$leftBox.append(...arrA, ...arrB, ...arrC);
}

window.addEventListener('DOMContentLoaded', main);
