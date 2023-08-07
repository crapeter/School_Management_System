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
        // creates a new students profile
        async function crtSTD() {
          await setStudentName();
          await setStudentID();
          createStudent(studentName, studentID);
        }
        crtSTD();
        userInput();
        break;
      case '2': 
        // creates and edits a students schedule
        async function schedule() {
          await setSchedule()
            .then(() => console.log('Schedule updated\n'))
            .catch(err => console.log(err));
          userInput();
        }
        schedule();
        break;
      case '3': 
        // edits student grades
        async function grades() {
          await setGrades()
            .then(() => console.log('Grades updated\n'))
            .catch(err => console.log(err));
          userInput();
        }
        grades();
        break;
      case '4': 
        // get a students information
        async function info() {
          await studentInfo()
            .catch(err => console.log(err));
          userInput();
        }
        info();
        break;
      case '5':
        // removes a student from the system
        async function remove() {
          await removeStudent()
            .then(() => console.log('Student successfully removed from the system\n'))
            .catch(err => console.log(err));
          userInput();
        }
        remove();
        break;
      case '6': 
        // exits the program
        process.exit();
      default: {
        console.log('Invalid operation');
        userInput();
      }
    }
  });
}

function setStudentName() {
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
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

function setSchedule() {
  return new Promise((resolve, reject) => {
    input.question('Enter the students ID: ', (id) => {
      Student.findOne({ StudentId: id })
      .then(student => {
        if (!student) {
          console.log('No student found with this ID\n');
          userInput();
        } else {
          let newSchedule = [];
          function setSchedule() {
            input.question('Enter a class name or \'q\' to quit: ', (className) => {
              if (!isNaN(className)) {
                console.log('Invalid class name')
                setSchedule();
              } else if (className !== 'q') {
                newSchedule.push(className);
                setSchedule();
              } else {
                student.Schedule = newSchedule;
                student.save()
                  .catch(err => console.log(err));
                resolve();
              }
            })
          }
          setSchedule();
        }
      })
      .catch(err => console.log(err));
    });
  });
}

function setGrades() {
  return new Promise((resolve, reject) => {
    input.question('Enter the students ID: ', (id) => {
      Student.findOne({ StudentId: id })
      .then(student => {
        if (!student) {
          console.log('No student found with this ID\n');
          userInput();
        } else {
          const schedule = student.Schedule;
          let newGrades = [];
          let index = 0;
          if (schedule[0] !== undefined) {
            function setSchedule() {
              input.question(`Enter the grade for ${schedule[index]}: `, (classGrade) => {
                if (isNaN(classGrade)) {
                  setSchedule();
                } else if (index < schedule.length) {
                  newGrades.push(classGrade);
                  if (index !== schedule.length - 1) {
                    index++;
                    setSchedule();
                  } else {
                    student.Grades = newGrades;
                    student.save()
                        .catch(err => console.log(err));
                    resolve();
                  }
                } 
              })
            }
            setSchedule();
          } else {
            console.log("This student does not have a schedule\n");
            userInput();
          }
        }
      })
      .catch(err => console.log(err));
    });
  });
}

function studentInfo() {
  return new Promise((resolve, reject) => {
    input.question('Enter the students ID: ', (id) => {
      Student.findOne({ StudentId: id })
      .then(student => {
        if (!student) {
          console.log('No student found with this ID\n');
          userInput();
        } else {
          console.log(`Name: ${student.Name}`);
          console.log(`Student ID: ${student.StudentId}`);
          console.log(`Schedule: ${student.Schedule}`);
          console.log(`Grades: ${student.Grades}\n`);
          resolve();
        }
      })
      .catch(err => console.log(err));
    });
  });
}

function removeStudent() {
  return new Promise((resolve, reject) => {
    input.question('Enter the students ID: ', (id) => {
      Student.findOneAndDelete({ StudentId: id }).then(result => {
      if (result) {
        resolve();
      } else {
        console.log('No student found with this ID\n');
        userInput();
      }
      })
      .catch(err => console.log(err));
    });
  });
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
