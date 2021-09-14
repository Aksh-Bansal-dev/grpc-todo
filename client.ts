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

// @ts-ignore
const client = new todoPackage.TodoService(
  "localhost:5000",
  grpc.credentials.createInsecure()
);

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
      console.log(err);
      return;
    }
    console.log("Item updated!");
  }
);

const readTodos = client.readTodos(null);
readTodos.on("data", (data: any) => {
  console.log(data);
});
