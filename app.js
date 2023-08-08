const express = require('express');
const mongoose = require('mongoose');
const readline = require('readline');
const Student = require('./models/students');

const app = express();

let studentName;
let studentID;

const dbURI = 'mongodb+srv://Username:Password@cluster0.pb7fxj4.mongodb.net/Students?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then(() => app.listen(3001))
    .catch((err) => console.error(err));

const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function userInput() {
  input.question('What would you like to do: \n1) Add a student (name and id)\n2) Create/edit a students schedule\n' + 
                 '3) Edit a students grades \n4) Get a students information \n5) Remove a student from the system\n6) Exit\n', (operation) => {
    switch (operation) {
		case '1':
			async function crtSTD() {
        await setStudentName();
        await setStudentID();
        createStudent(studentName, studentID);
			}
			crtSTD();
			userInput();
			break;
		case '2': 
			async function schedule() {
				await setSchedule()
					.then(() => console.log('Schedule updated\n'))
					.catch(err => console.log(err));
				userInput();
			}
			schedule();
			break;
		case '3': 
			async function grades() {
				await setGrades()
					.then(() => console.log('Grades updated\n'))
					.catch(err => console.log(err));
				userInput();
			}
			grades();
			break;
		case '4': 
			async function info() {
				await studentInfo()
					.catch(err => console.log(err));
				userInput();
			}
			info();
			break;
		case '5':
			async function remove() {
				await removeStudent()
					.catch(err => console.log(err));
				userInput();
			}
			remove();
			break;
		case '6': 
			process.exit();
		default: 
			console.log('Invalid operation');
			userInput();
    }
  });
}

function setStudentName() {
  return new Promise((resolve) => {
    input.question('Enter the name of the student: ', (name) => {
      if (isNaN(name)) {
        studentName = name;
        resolve();
      } else {
        console.log('Invalid name')
        resolve(setStudentName());
      }
    })
  });
}
function setStudentID() {
  return new Promise((resolve) => {
    input.question('Enter the students id: ', (id) => {
      Student.findOne({ StudentId: id })
      .then(student => {
        if (student){
          console.log('Student id already exists');
          resolve(setStudentID());
        } else {
          studentID = id;
          resolve();
        }
      })
    })
  });
}
async function setSchedule() {
  const id = await getInput('Enter the studends ID: ');
  try {
    const student = await Student.findOne({ StudentId: id });
    if (!student) {
      console.log('No student found with this ID');
      return setSchedule();
    }
    const newSchedule = await getSchedule();
    student.Schedule = newSchedule;
    await student.save();
  } catch (err) {
    console.log(err);
  }
}
async function setGrades() {
  const id = await getInput('Enter the student ID: ');
  try {
    const student = await Student.findOne({StudentId: id});
    if (!student) {
      console.log('No student found with this ID');
      return setGrades();
    }
    const updatedGrades = await getGrades(student.Schedule);
    student.Grades = updatedGrades;
    await student.save();
  } catch (err) {
    console.log(err);
  }
}

async function studentInfo() {
  const id = await getInput('Enter the student ID: ');
  try {
    const student = await Student.findOne({ StudentId: id });
    if (!student) {
      console.log('No student found with this ID\n');
    } else {
      console.log(`Name: ${student.Name}`);
      console.log(`Student ID: ${student.StudentId}`);
      console.log(`Schedule: ${student.Schedule}`);
      console.log(`Grades: ${student.Grades}\n`);
    }
  } catch (err) {
    console.log(err);
  }
}
async function removeStudent() {
  const id = await getInput('Enter the student ID: ');
  try {
    const student = await Student.findOneAndDelete({ StudentId: id });
    if (!student) {
      console.log('No student found with this ID\n');
    } else {
      console.log(`${student.Name} has been removed from the system\n`); 
    }
  } catch (err) {
    console.log(err);
  }
}

function getInput(question) {
  return new Promise((resolve) => {
    input.question(question, (answer) => {
      resolve(answer);
    })
  })
}
async function getSchedule() {
  const newSchedule = [];
  while (true) {
    const className = await getInput('Enter a class name or \'q\' to quit: ');
    if (!isNaN(className)) {
      console.log('Invalid class name');
    } else if (className !== 'q') {
      newSchedule.push(className);
    } else {
      break;
    }
  }
  return newSchedule;
}
async function getGrades(schedule) {
  const updatedGrades = [];
  let index = 0;
  while (index < schedule.length) {
    const grade = await getInput(`Enter the grade for ${schedule[index]}: `);
    if (isNaN(grade)) {
      console.log('Invalid grade');
    } else if (index < schedule.length && index !== schedule.length - 1) {
      updatedGrades.push(grade);
      index++;
    } else break;
  }
  return updatedGrades;
}

function createStudent(Name, StudentId) {
  let newStudent = new Student({ Name, StudentId });
  newStudent.save()
    .then(() => {
      console.log('Student added successfully!\n');
      userInput();
    })
    .catch(err => console.log(err));
}

userInput();
