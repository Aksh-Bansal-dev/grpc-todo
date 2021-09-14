import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

// Loading proto file
const packageDef = protoLoader.loadSync("./todo.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const todoPackage = grpc.loadPackageDefinition(packageDef).todoPackage;

type todoType = { id: number; todo: string };
let todos: todoType[] = [{ id: 99, todo: "pre defined todo" }];

const createTodo_ = (todo: todoType) => {
  todos.push(todo);
  return todo;
};

function createTodo(call: any, callback: any) {
  const todo = call.request;
  callback(null, createTodo_(todo));
}

function readTodos(call: any) {
  todos.forEach((e) => {
    call.write(e);
  });
  call.end();
}

function addTodos(call: any) {
  call.on("data", (todo: todoType) => {
    todos.push(todo);
    call.write(todo);
  });

  call.on("end", () => {
    call.end();
  });
  call.end();
}

function updateTodo(call: any, callback: any) {
  const { id, newTodo } = call.request;
  let flag = false;
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todos[i].todo = newTodo;
      flag = true;
      break;
    }
  }
  if (!flag) {
    callback("Index not found", null);
  } else callback(null, { id, todo: newTodo });
}

function deleteTodo(call: any, callback: any) {
  const id = call.request;
  let flag = false;

  todos = todos.filter((e) => {
    if (e.id === id) flag = true;
    return e.id !== id;
  });

  if (!flag) {
    callback("Index not found", null);
  } else callback(null, id);
}

const server = new grpc.Server();
// @ts-ignore
server.addService(todoPackage.TodoService.service, {
  createTodo,
  readTodos,
  addTodos,
  updateTodo,
  deleteTodo,
});

server.bindAsync(
  "localhost:5000",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Server starting at port 5000");
    server.start();
  }
);
