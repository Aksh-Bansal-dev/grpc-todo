import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

type todoType = { id: number; todo: string };

// Loading proto file
const packageDef = protoLoader.loadSync("./todo.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const todoPackage = grpc.loadPackageDefinition(packageDef).todoPackage;

// @ts-ignore
const client = new todoPackage.TodoService(
  "localhost:5000",
  grpc.credentials.createInsecure()
);

const getTodos = () => {
  const readTodos = client.readTodos(null);
  const todos: todoType[] = [];
  readTodos.on("data", (data: any) => {
    todos.push(data);
  });
  readTodos.on("end", () => {
    console.log(todos);
  });
};

client.createTodo(
  { id: 101, todo: "google remote procedure call" },
  (err: any, _data: any) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Item added!");
  }
);

client.updateTodo(
  { id: 101, todo: "yes no yes no" },
  (err: any, _data: any) => {
    if (err) {
      console.log(err.details);
      return;
    }
    console.log("Item updated!");
  }
);

client.deleteTodo({ id: 102 }, (err: any, _data: any) => {
  if (err) {
    console.log(err.details);
    return;
  }
  console.log("Item updated!");
});

(() => {
  const addAll = client.addTodos();
  const newTodos: todoType[] = [
    { id: 1, todo: "todo 1" },
    { id: 2, todo: "todo 2" },
    { id: 3, todo: "todo 3" },
    { id: 4, todo: "todo 4" },
  ];

  addAll.on("data", () => {});

  addAll.on("end", () => {
    getTodos();
  });

  newTodos.forEach((e) => {
    addAll.write(e);
  });
  addAll.end();
})();
